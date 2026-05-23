import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Kirish — Fovere CRM" }] }),
});

const DEFAULT_EMAIL = "islomsaidametov1@gmail.com";
const DEFAULT_PASSWORD = "fovere1234";

function LoginPage() {
  const { login, user } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/admin" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email va parolni kiriting");
      return;
    }
    setLoading(true);
    try {
      const res = await login(email, password);
      if (!res.ok) {
        toast.error(res.error ?? "Login muvaffaqiyatsiz");
        return;
      }
      toast.success("Xush kelibsiz!");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas grid place-items-center px-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo to="/" heightClass="h-12" />
        </div>

        <div className="rounded-2xl bg-card border border-border p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white">CRM Panelga kirish</h1>
          <p className="text-sm text-muted-foreground mt-1">Hisobingiz bilan kiring</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground tracking-wider font-semibold mb-2">
                EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fovere.uz"
                  className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground tracking-wider font-semibold mb-2">
                PAROL
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-input border border-border rounded-lg pl-10 pr-11 py-3 text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                  title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-gold hover:bg-accent/50 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-bold py-3 rounded-lg tracking-wider transition shadow-lg shadow-gold/20 inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Kirilmoqda..." : "KIRISH"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>

        <Link to="/" className="block text-center text-xs text-muted-foreground mt-6 hover:text-gold">
          ← Saytga qaytish
        </Link>
      </div>
    </div>
  );
}
