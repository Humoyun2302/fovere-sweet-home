// vite-tanstack-config includes React, Tailwind, and path aliases — do not add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { loadEnv } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.

/** Force Supabase vars into the client bundle (Netlify sets process.env at build time). */
function supabaseEnvDefine(mode: string) {
  const loaded = loadEnv(mode, process.cwd(), "VITE_");
  const url = (process.env.VITE_SUPABASE_URL ?? loaded.VITE_SUPABASE_URL ?? "").trim();
  const key = (process.env.VITE_SUPABASE_ANON_KEY ?? loaded.VITE_SUPABASE_ANON_KEY ?? "").trim();
  return {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(url),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(key),
  };
}

export default defineConfig((env) => ({
  // Cloudflare output uses index.js; disable on Netlify so prerender + static HTML work.
  cloudflare: process.env.NETLIFY === "true" ? false : {},
  vite: {
    define: supabaseEnvDefine(env.mode),
  },
  tanstackStart: {
    server: { entry: "server" },
    prerender: {
      enabled: true,
      crawlLinks: true,
    },
  },
}));
