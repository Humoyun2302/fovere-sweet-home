/**
 * Fails the Netlify/CI build early if Supabase env vars are missing.
 * Vite inlines VITE_* at build time — runtime env vars on Netlify are not enough.
 */
const url = process.env.VITE_SUPABASE_URL?.trim();
const key = process.env.VITE_SUPABASE_ANON_KEY?.trim();

// Only enforce on Netlify — local builds use .env.local via Vite loadEnv.
if (process.env.NETLIFY !== "true") {
  process.exit(0);
}

if (!url || !key) {
  console.error(
    "\n[build] Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY.\n" +
      "Add them in Netlify → Site configuration → Environment variables,\n" +
      "scope: Builds (or All scopes), then trigger a new deploy.\n",
  );
  process.exit(1);
}

if (url.includes("YOUR-PROJECT") || key.includes("your-anon")) {
  console.error("\n[build] Supabase env vars look like placeholders. Use real values from Supabase → Settings → API.\n");
  process.exit(1);
}

console.log("[build] Supabase env vars present.");
