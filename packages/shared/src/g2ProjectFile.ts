import * as Exit from "effect/Exit";
import * as Schema from "effect/Schema";

import { G2ProjectFile, G2_PROJECT_FILE_SCHEMA_URL } from "@gentic2/contracts";

import { fromLenientJson } from "./schemaJson.ts";

/**
 * Codec between the raw `g2.json` file contents (lenient JSONC string) and the
 * decoded {@link G2ProjectFile}.
 */
export const G2ProjectFileFromJson = fromLenientJson(G2ProjectFile);

const decodeG2ProjectFile = Schema.decodeExit(G2ProjectFileFromJson);

/**
 * Decode raw `g2.json` contents, treating invalid or malformed files as
 * absent. Clients use this to read optional defaults (scripts, thread env
 * mode) without surfacing decode errors to the user.
 */
export function parseG2ProjectFile(contents: string): G2ProjectFile | null {
  const decoded = decodeG2ProjectFile(contents);
  return Exit.isSuccess(decoded) ? decoded.value : null;
}

/**
 * Build the publishable JSON Schema document for `g2.json` (draft 2020-12).
 *
 * Served from the marketing site at {@link G2_PROJECT_FILE_SCHEMA_URL} so
 * editors get LSP support via a `$schema` reference.
 */
export function buildG2ProjectFileJsonSchema(): Record<string, unknown> {
  // Closed objects, as before effect rc.113 changed the generator default;
  // editors then flag unknown keys in g2.json.
  const document = Schema.toJsonSchemaDocument(G2ProjectFile, { onExcessProperty: "error" });
  const jsonSchema: Record<string, unknown> = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: G2_PROJECT_FILE_SCHEMA_URL,
    ...document.schema,
  };
  if (document.definitions && Object.keys(document.definitions).length > 0) {
    jsonSchema.$defs = document.definitions;
  }
  return jsonSchema;
}
