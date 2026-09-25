import type { APIRoute } from "astro";

import { buildG2ProjectFileJsonSchema } from "@gentic2/shared/g2ProjectFile";

// Rendered at build time; published at https://t3.codes/schema/t3.json so
// t3.json files can reference it via "$schema" for editor/LSP support.
export const GET: APIRoute = () =>
  new Response(`${JSON.stringify(buildG2ProjectFileJsonSchema(), null, 2)}\n`, {
    headers: { "Content-Type": "application/json" },
  });
