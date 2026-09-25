/**
 * G2ProjectFileLoader - Effect service that loads the checked-in `g2.json`
 * project file from a workspace root.
 *
 * Loading is best-effort: a missing file resolves to `Option.none`, and
 * unreadable or invalid files are logged and treated as absent so callers
 * can fall back to their defaults.
 *
 * @module G2ProjectFileLoader
 */
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Path from "effect/Path";
import * as Schema from "effect/Schema";

import { G2_PROJECT_FILE_NAME, type G2ProjectFile } from "@gentic2/contracts";
import { G2ProjectFileFromJson } from "@gentic2/shared/g2ProjectFile";

const decodeG2ProjectFileJson = Schema.decodeEffect(G2ProjectFileFromJson);

export class G2ProjectFileLoadError extends Schema.TaggedError<G2ProjectFileLoadError>()(
  "G2ProjectFileLoadError",
  {
    operation: Schema.Literals(["read", "decode"]),
    workspaceRoot: Schema.String,
    filePath: Schema.String,
    cause: Schema.Defect(),
  },
) {
  override get message(): string {
    return `Failed to ${this.operation} ${G2_PROJECT_FILE_NAME} at ${this.filePath}.`;
  }
}

/** Service tag for g2.json project file loading. */
export class G2ProjectFileLoader extends Context.Service<
  G2ProjectFileLoader,
  {
    /**
     * Load and decode `g2.json` at the workspace root.
     *
     * Never fails: missing, unreadable, or invalid files resolve to
     * `Option.none` (invalid files are logged as warnings).
     */
    readonly load: (workspaceRoot: string) => Effect.Effect<Option.Option<G2ProjectFile>>;
  }
>()("g2/project/G2ProjectFileLoader") {}

const logG2ProjectFileLoadError = (error: G2ProjectFileLoadError) =>
  Effect.logWarning(error).pipe(
    Effect.annotateLogs({
      operation: error.operation,
      workspaceRoot: error.workspaceRoot,
      filePath: error.filePath,
      errorTag: error._tag,
    }),
  );

/** @public Service construction is part of the canonical Effect module API. */
export const make = Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const load: G2ProjectFileLoader["Service"]["load"] = Effect.fn("G2ProjectFileLoader.load")(
    function* (workspaceRoot) {
      const filePath = path.join(workspaceRoot, G2_PROJECT_FILE_NAME);
      const raw = yield* fileSystem.readFileString(filePath).pipe(
        Effect.asSome,
        Effect.catchTags({
          PlatformError: (error) =>
            error.reason._tag === "NotFound"
              ? Effect.succeed(Option.none<string>())
              : logG2ProjectFileLoadError(
                  new G2ProjectFileLoadError({
                    operation: "read",
                    workspaceRoot,
                    filePath,
                    cause: error,
                  }),
                ).pipe(Effect.as(Option.none<string>())),
        }),
      );
      if (Option.isNone(raw)) {
        return Option.none<G2ProjectFile>();
      }
      return yield* decodeG2ProjectFileJson(raw.value).pipe(
        Effect.asSome,
        Effect.catchTags({
          SchemaError: (error) =>
            logG2ProjectFileLoadError(
              new G2ProjectFileLoadError({
                operation: "decode",
                workspaceRoot,
                filePath,
                cause: error,
              }),
            ).pipe(Effect.as(Option.none<G2ProjectFile>())),
        }),
      );
    },
  );

  return G2ProjectFileLoader.of({ load });
});

export const layer = Layer.effect(G2ProjectFileLoader, make);
