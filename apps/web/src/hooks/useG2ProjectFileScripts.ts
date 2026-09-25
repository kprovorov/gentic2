import {
  G2_PROJECT_FILE_NAME,
  type EnvironmentId,
  type G2ProjectFile,
  type G2ProjectFileScript,
} from "@gentic2/contracts";
import { parseG2ProjectFile } from "@gentic2/shared/g2ProjectFile";
import { useMemo } from "react";

import { useProjectFileQuery } from "~/components/files/projectFilesQueryState";

const NO_SCRIPTS: ReadonlyArray<G2ProjectFileScript> = [];

export interface G2ProjectFileState {
  /**
   * - `valid`: g2.json exists and decoded.
   * - `invalid`: g2.json exists but fails to decode (the server then ignores
   *   the whole file, including `iconPath` and every script).
   * - `missing`: no readable g2.json at the workspace root.
   * - `loading`: the file query has not settled yet.
   */
  status: "loading" | "missing" | "invalid" | "valid";
  /** The decoded file when status is `valid`, null otherwise. */
  file: G2ProjectFile | null;
  scripts: ReadonlyArray<G2ProjectFileScript>;
}

/**
 * Decoded state of the project's checked-in `g2.json`, including whether the
 * file exists but is broken — which the runtime otherwise swallows silently.
 */
export function useG2ProjectFileState(
  environmentId: EnvironmentId,
  cwd: string | null,
): G2ProjectFileState {
  const query = useProjectFileQuery(environmentId, cwd ?? "", G2_PROJECT_FILE_NAME, cwd !== null);
  const contents = query.data && !query.data.truncated ? query.data.contents : null;
  const isPending = query.isPending;
  return useMemo(() => {
    if (contents === null) {
      return {
        status: isPending ? "loading" : "missing",
        file: null,
        scripts: NO_SCRIPTS,
      } as const;
    }
    const file = parseG2ProjectFile(contents);
    if (file === null) {
      return { status: "invalid", file: null, scripts: NO_SCRIPTS } as const;
    }
    return { status: "valid", file, scripts: file.scripts ?? NO_SCRIPTS } as const;
  }, [contents, isPending]);
}

/**
 * Scripts declared in the project's checked-in `g2.json`, offered in the
 * scripts menu for import. Missing, truncated, or invalid files resolve to
 * an empty list.
 */
export function useG2ProjectFileScripts(
  environmentId: EnvironmentId,
  cwd: string | null,
): ReadonlyArray<G2ProjectFileScript> {
  return useG2ProjectFileState(environmentId, cwd).scripts;
}
