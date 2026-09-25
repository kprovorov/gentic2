import { assert, it } from "@effect/vitest";

import { formatCliCommand } from "./invocation.ts";

it("formats package runner commands from their cache entry paths", () => {
  for (const [entryPath, expected] of [
    ["/home/theo/.npm/_npx/abc123/node_modules/g2/dist/bin.mjs", "npx g2 serve"],
    [
      "C:\\Users\\theo\\AppData\\Local\\npm-cache\\_npx\\abc\\node_modules\\g2\\dist\\bin.mjs",
      "npx g2 serve",
    ],
    ["/home/theo/.cache/pnpm/dlx/abc/node_modules/g2/dist/bin.mjs", "pnpm dlx g2 serve"],
    [
      "/home/theo/.local/share/pnpm/.pnpm/dlx/abc/node_modules/g2/dist/bin.mjs",
      "pnpm dlx g2 serve",
    ],
    [
      "C:\\Users\\theo\\AppData\\Local\\pnpm-cache\\dlx\\abc\\node_modules\\g2\\dist\\bin.mjs",
      "pnpm dlx g2 serve",
    ],
    ["/home/theo/.bun/install/cache/g2@0.0.31/dist/bin.mjs", "bunx g2 serve"],
    ["/tmp/bunx-1000-g2@latest/node_modules/g2/dist/bin.mjs", "bunx g2 serve"],
    [
      "C:\\Users\\theo\\AppData\\Local\\Temp\\bunx-0-g2@latest\\node_modules\\g2\\dist\\bin.mjs",
      "bunx g2 serve",
    ],
  ] as const) {
    assert.equal(formatCliCommand({ subcommand: "serve", entryPath, version: "0.0.31" }), expected);
  }
});

it("treats stable installs as direct invocations", () => {
  for (const entryPath of [
    "/usr/local/lib/node_modules/g2/dist/bin.mjs",
    "/home/theo/Code/work/gentic2/apps/server/dist/bin.mjs",
    "/home/theo/.g2/runtime/0.0.31/node_modules/g2/dist/bin.mjs",
    "",
  ]) {
    assert.equal(
      formatCliCommand({ subcommand: "serve", entryPath, version: "0.0.31" }),
      "g2 serve",
    );
  }
});

it("re-suggests the prerelease channel only for prerelease builds", () => {
  for (const [version, expected] of [
    ["0.0.31-nightly.20260729", "npx g2@nightly serve"],
    ["0.0.31-preview.20260729.1", "npx g2@preview serve"],
    ["0.0.31-foo-preview.20260729.1", "npx g2 serve"],
    ["0.0.31", "npx g2 serve"],
  ] as const) {
    assert.equal(
      formatCliCommand({
        subcommand: "serve",
        entryPath: "/home/theo/.npm/_npx/abc123/node_modules/g2/dist/bin.mjs",
        version,
      }),
      expected,
    );
  }
});

it("formats serve suggestions to match the launching command", () => {
  assert.equal(
    formatCliCommand({
      subcommand: "serve",
      entryPath: "/home/theo/.npm/_npx/abc/node_modules/g2/dist/bin.mjs",
      version: "0.0.31-nightly.20260729",
    }),
    "npx g2@nightly serve",
  );
  assert.equal(
    formatCliCommand({
      subcommand: "serve",
      entryPath: "/tmp/bunx-1000-g2@latest/node_modules/g2/dist/bin.mjs",
      version: "0.0.31",
    }),
    "bunx g2 serve",
  );
  assert.equal(
    formatCliCommand({
      subcommand: "serve",
      entryPath: "/usr/local/lib/node_modules/g2/dist/bin.mjs",
      version: "0.0.31-nightly.20260729",
    }),
    "g2 serve",
  );
});
