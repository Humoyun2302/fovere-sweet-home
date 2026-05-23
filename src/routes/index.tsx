import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Star,
  Lock,
  ArrowRight,
  CheckCircle2,
  Phone,
  User,
  Wallet,
  Instagram,
  Youtube,
  Mail,
  MapPin,
} from "lucide-react";
import founderImg from "@/assets/founder.png";
import { Logo } from "@/components/Logo";
import { formatPhone, isValidPhone, PHONE_INVALID_MESSAGE, PHONE_PLACEHOLDER } from "@/lib/phone";
import { useStore, type Channel } from "@/lib/store";

const INSTAGRAM_URL = "https://www.instagram.com/fovere_des?igsh=MWdpM2sxOG1vYmFiZQ==";
const YOUTUBE_URL = "https://youtube.com/@fovere_des?si=9JgFKN-LxbnEQi9x";
const CONTACT_PHONE = "+998 99 366 94 45";
const CONTACT_EMAIL = "islomsaidametov1@gmail.com";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Fovere Sweet Home — Remont qilish biz bilan oson" },
      {
        name: "description",
        content: "Premium uy remont xizmatlari. Ariza qoldiring va ekspert maslahatini oling.",
      },
    ],
  }),
});

function getChannelSlugFromUrl() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("channel");
}

function Landing() {
  const { addLead } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState<string>("");
  const [wants, setWants] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [channelSlug] = useState(getChannelSlugFromUrl);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Iltimos, ismingizni kiriting");
    if (!phone.trim() || !isValidPhone(phone)) return toast.error(PHONE_INVALID_MESSAGE);
    if (wants === null) return toast.error("Tanlovni belgilang");

    setSubmitting(true);

    // Derive channel key DIRECTLY from URL slug so it works even before
    // the channels table loads. The DB check constraint allows:
    // ('direct','youtube','instagram','telegram','other').
    const channelKey: Channel = !channelSlug
      ? "direct"
      : channelSlug.includes("youtube")
        ? "youtube"
        : channelSlug.includes("instagram")
          ? "instagram"
          : channelSlug.includes("telegram")
            ? "telegram"
            : "other";

    const channelLabel = channelSlug
      ? channelSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Bevosita";

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      wantsRenovation: wants,
      budget: budget ? Number(budget.replace(/\D/g, "")) || undefined : undefined,
      channel: channelKey,
      channelLabel,
    };
    // eslint-disable-next-line no-console
    console.warn("[submit]", { channelSlug, payload });
    try {
      await addLead(payload);
      toast.success("Arizangiz qabul qilindi!");
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yuborishda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setName("");
    setPhone("");
    setBudget("");
    setWants(null);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-canvas relative overflow-x-hidden">
      <div className="relative z-10">
        {/* Desktop: hero fits one viewport; mobile/tablet: unchanged scroll layout */}
        <div className="relative lg:h-screen lg:flex lg:flex-col lg:overflow-hidden">
          <LandingBackground />

          <section className="container mx-auto px-6 max-w-7xl lg:flex lg:flex-col lg:flex-1 lg:min-h-0 lg:py-4">
            <div className="flex flex-col items-center text-center pt-8 md:pt-12 pb-6 md:pb-8 lg:pt-3 lg:pb-6 lg:shrink-0">
              <Logo heightClass="h-12 md:h-14 lg:h-10" />
              <h1 className="hero-headline font-bold tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-[3.4rem] mt-6 md:mt-10 lg:mt-3 max-w-4xl">
                <span className="hero-headline__line">
                  <span className="text-gradient-gold">REMONT QILISH</span>{" "}
                  <span className="text-gradient-light">BIZ</span>
                </span>
                <span className="hero-headline__line text-gradient-light">BILAN OSON</span>
              </h1>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 pb-16 lg:gap-12 lg:flex-1 lg:min-h-0 lg:pb-3 lg:items-stretch">
              {/* Form / Success */}
              <div className="rounded-2xl bg-card border border-border p-8 lg:p-5 shadow-2xl lg:flex lg:flex-col lg:min-h-0">
            {!submitted ? (
              <>
                <h2 className="text-xl lg:text-lg font-bold tracking-wider text-white mb-6 lg:mb-3">
                  ARIZA QOLDIRING
                </h2>
                <form onSubmit={submit} className="space-y-5 lg:space-y-3" noValidate>
                  <Field label="ISMINGIZ *" icon={User}>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masalan: Ali Valiyev"
                      className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 lg:py-2.5 text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold transition"
                    />
                  </Field>

                  <Field label="TELEFON RAQAMINGIZ *" icon={Phone}>
                    <input
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder={PHONE_PLACEHOLDER}
                      className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 lg:py-2.5 text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold transition"
                    />
                  </Field>

                  <Field label="BYUDJETINGIZ (ixtiyoriy, $)" icon={Wallet}>
                    <input
                      inputMode="numeric"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ""))}
                      placeholder="Masalan: 10000"
                      className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 lg:py-2.5 text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold transition"
                    />
                  </Field>

                  <div>
                    <label className="block text-xs text-muted-foreground tracking-wider font-semibold mb-2">
                      UYINGIZNI REMONT QILDIRMOQCHIMISIZ? *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <ToggleOpt active={wants === true} onClick={() => setWants(true)}>
                        Ha, qildirmoqchiman
                      </ToggleOpt>
                      <ToggleOpt active={wants === false} onClick={() => setWants(false)}>
                        Yo'q, bonus olmoqchiman
                      </ToggleOpt>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-bold py-4 lg:py-3 rounded-lg tracking-wider transition shadow-lg shadow-gold/20 disabled:opacity-60"
                  >
                    {submitting ? "YUBORILMOQDA..." : "YUBORISH"}
                  </button>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                    <Lock className="h-3 w-3" /> XAVFSIZ ULANISH FAOL
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-8 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                <div className="h-16 w-16 rounded-full bg-gold/15 grid place-items-center">
                  <CheckCircle2 className="h-9 w-9 text-gold" />
                </div>
                <h2 className="text-2xl font-bold text-white">Rahmat, {name.split(" ")[0]}!</h2>
                <p className="text-muted-foreground max-w-sm">
                  Arizangiz qabul qilindi. Mutaxassisimiz tez orada siz bilan bog'lanadi.
                </p>
                <button
                  onClick={reset}
                  className="mt-2 inline-flex items-center gap-1 text-sm text-gold hover:underline"
                >
                  Yana bir ariza yuborish <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

              {/* Founder card */}
              <div className="group relative rounded-2xl overflow-hidden border border-border bg-card min-h-[500px] lg:min-h-0 lg:h-full transition-[border-color,box-shadow] duration-500 ease-out hover:border-gold/35 hover:shadow-2xl hover:shadow-black/50">
            <img
              src={founderImg}
              alt="Islombek Saidametov"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent transition-opacity duration-500 group-hover:via-card/30" />

            <span className="absolute top-5 left-5 inline-flex items-center gap-1.5 bg-card/90 backdrop-blur border border-border text-gold text-xs font-semibold px-3 py-1.5 rounded-full">
              <Star className="h-3 w-3 fill-gold" /> EKSPERT
            </span>
            <span className="absolute bottom-32 right-5 inline-flex items-center gap-1.5 bg-gold text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" /> 6 YILLIK TAJRIBA
            </span>

            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-4 text-left">
              <div className="leading-[0.92]">
                <span className="block text-white text-4xl lg:text-[2rem] xl:text-4xl font-bold">
                  Islombek
                </span>
                <span className="block text-gold text-4xl lg:text-[2rem] xl:text-4xl font-bold">
                  Saidametov
                </span>
              </div>
              <p className="text-gold text-xs md:text-sm font-bold tracking-[0.22em] uppercase mt-3 lg:mt-2.5">
                FOVERE DIZAYN STUDIYASI ASOSCHISI
              </p>
            </div>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </div>
  );
}

function LandingBackground() {
  return (
    <div className="landing-bg" aria-hidden>
      <div className="landing-bg__mesh" />
      <div className="landing-bg__orb landing-bg__orb--gold" />
      <div className="landing-bg__orb landing-bg__orb--navy-left" />
      <div className="landing-bg__orb landing-bg__orb--navy-right" />
      <div className="landing-bg__grid" />
      <div className="landing-bg__vignette" />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 mt-8">
      <div className="container mx-auto px-6 max-w-7xl py-10 md:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12 items-start">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Logo to="/" heightClass="h-10" />
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Premium uy remont va dizayn xizmatlari. Fovere bilan o'z uyingizni mukammal qiling.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white text-xs font-semibold tracking-[0.2em] uppercase">ALOQA</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-3 text-muted-foreground hover:text-gold transition"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  {CONTACT_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-3 text-muted-foreground hover:text-gold transition break-all"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="inline-flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                Toshkent, O'zbekiston
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white text-xs font-semibold tracking-[0.2em] uppercase">
              IJTIMOIY TARMOQLAR
            </h4>
            <div className="flex items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="h-10 w-10 grid place-items-center rounded-full bg-background border border-border text-muted-foreground hover:text-gold hover:border-gold/50 transition"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                title="YouTube"
                className="h-10 w-10 grid place-items-center rounded-full bg-background border border-border text-muted-foreground hover:text-gold hover:border-gold/50 transition"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">@fovere_des</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground tracking-wider font-semibold mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
        {children}
      </div>
    </div>
  );
}

function ToggleOpt({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-3 lg:py-2.5 px-3 rounded-lg border text-sm font-medium transition ${
        active
          ? "bg-gold text-primary-foreground border-gold"
          : "bg-input text-white border-border hover:border-gold/50"
      }`}
    >
      {children}
    </button>
  );
}
