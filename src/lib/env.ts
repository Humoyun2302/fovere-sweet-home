/** Read Supabase public credentials (inlined at build time via Vite). */
function readEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY") {
  const raw = import.meta.env[name];
  return typeof raw === "string" ? raw.trim() : "";
}

function isPlaceholder(url: string, key: string) {
  if (!url || !key) return true;
  if (url.includes("YOUR-PROJECT") || url.includes("placeholder.supabase")) return true;
  if (key.includes("your-anon") || key === "placeholder-anon-key") return true;
  return false;
}

export const SUPABASE_URL = readEnv("VITE_SUPABASE_URL");
export const SUPABASE_ANON_KEY = readEnv("VITE_SUPABASE_ANON_KEY");

export const supabaseConfigured = !isPlaceholder(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SUPABASE_CONFIG_HINT =
  typeof window !== "undefined" && window.location.hostname.includes("netlify")
    ? "Netlify → Site configuration → Environment variables da VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY ni qo'shing, so'ng qayta deploy qiling."
    : "Loyiha ildizida .env.local faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY ni sozlang, dev serverni qayta ishga tushiring.";
