import { G2_PROJECT_FILE_NAME, type EnvironmentId, type G2ProjectFile } from "@gentic2/contracts";
import { parseG2ProjectFile } from "@gentic2/shared/g2ProjectFile";
import { executeAtomQuery } from "@gentic2/client-runtime/state/runtime";

import {
  getProjectFileQueryAtom,
  resolveProjectFileQueryData,
} from "~/components/files/projectFilesQueryState";
import { appAtomRegistry } from "~/rpc/atomRegistry";

/**
 * Read and decode the project's checked-in `g2.json`.
 *
 * Imperative counterpart to `useG2ProjectFileState` for the new-thread path,
 * which resolves defaults at call time rather than render time. The file
 * query atom caches per (environment, cwd), so repeat calls don't re-fetch.
 * Optimistic in-app writes overlay the query result, matching what
 * `useProjectFileQuery` renders. Missing, truncated, or invalid files
 * resolve to null.
 */
export async function readG2ProjectFile(
  environmentId: EnvironmentId,
  workspaceRoot: string,
): Promise<G2ProjectFile | null> {
  const result = await executeAtomQuery(
    appAtomRegistry,
    getProjectFileQueryAtom(environmentId, workspaceRoot, G2_PROJECT_FILE_NAME),
    { reportDefect: false, reportFailure: false },
  );
  const data = resolveProjectFileQueryData(
    environmentId,
    workspaceRoot,
    G2_PROJECT_FILE_NAME,
    result._tag === "Success" ? result.value : null,
  );
  if (data === null || data.truncated) return null;
  return parseG2ProjectFile(data.contents);
}
