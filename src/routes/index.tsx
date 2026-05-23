import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Star, Lock, ArrowRight } from "lucide-react";
import expertImg from "@/assets/expert.jpg";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Fovere Sweet Home — Remont qilish biz bilan oson" },
      { name: "description", content: "Premium uy remont xizmatlari. Ariza qoldiring va ekspert maslahatini oling." },
    ],
  }),
});

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 grid place-items-center text-gold text-2xl font-serif italic" style={{ transform: "translate(-3px,-1px)" }}>F</span>
        <span className="absolute inset-0 grid place-items-center text-gold/60 text-2xl font-serif italic" style={{ transform: "translate(3px,1px)" }}>F</span>
      </div>
      <div className="leading-tight">
        <div className="text-gold font-semibold tracking-[0.18em] text-sm">FOVERE</div>
        <div className="text-muted-foreground tracking-[0.3em] text-[10px]">SWEET HOME</div>
      </div>
    </div>
  );
}

function Landing() {
  const { addLead, channels } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wants, setWants] = useState<boolean | null>(null);

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const channelSlug = params?.get("channel");
  const matchedChannel = channels.find((c) => c.slug === channelSlug);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || wants === null) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }
    addLead({
      name, phone,
      wantsRenovation: wants,
      channel: matchedChannel ? "youtube" : "direct",
      channelLabel: matchedChannel ? matchedChannel.name : "Bevosita",
    });
    toast.success("Arizangiz qabul qilindi!");
    setName(""); setPhone(""); setWants(null);
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="container mx-auto px-6 py-6 flex items-center justify-between max-w-7xl">
        <Logo />
        <a href="/admin" className="text-xs text-muted-foreground hover:text-gold inline-flex items-center gap-1">CRM Panel <ArrowRight className="h-3 w-3" /></a>
      </header>

      <section className="container mx-auto px-6 max-w-7xl">
        <h1 className="text-center font-bold tracking-tight text-3xl md:text-5xl lg:text-6xl mt-8 mb-12 leading-tight">
          <span className="text-white">REMONT QILISH</span>{" "}
          <span className="text-muted-foreground">BIZ BILAN</span>{" "}
          <span className="text-gold">OSON</span>
        </h1>

        <div className="grid lg:grid-cols-2 gap-6 pb-16">
          {/* Form */}
          <div className="rounded-2xl bg-card border border-border p-8 shadow-2xl">
            <h2 className="text-xl font-bold tracking-wider text-white mb-6">ARIZA QOLDIRING</h2>
            <form onSubmit={submit} className="space-y-5">
              <Field label="ISMINGIZ *">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Ali Valiyev"
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold transition" />
              </Field>
              <Field label="TELEFON RAQAMINGIZ *">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 ..."
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-gold transition" />
              </Field>
              <Field label="UYINGIZNI REMONT QILDIRMOQCHIMISIZ? *">
                <div className="grid grid-cols-2 gap-3">
                  <ToggleOpt active={wants === true} onClick={() => setWants(true)}>Ha, qildirmoqchiman</ToggleOpt>
                  <ToggleOpt active={wants === false} onClick={() => setWants(false)}>Yo'q, bonus olmoqchiman</ToggleOpt>
                </div>
              </Field>
              <button type="submit" className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-bold py-4 rounded-lg tracking-wider transition shadow-lg shadow-gold/20">
                YUBORISH
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Lock className="h-3 w-3" /> XAVFSIZ ULANISH FAOL
              </div>
            </form>
          </div>

          {/* Expert card */}
          <div className="relative rounded-2xl overflow-hidden border border-border bg-card min-h-[500px]">
            <img src={expertImg} alt="Islombek Saidametov" className="absolute inset-0 w-full h-full object-cover grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

            <span className="absolute top-5 left-5 inline-flex items-center gap-1.5 bg-card/90 backdrop-blur border border-border text-gold text-xs font-semibold px-3 py-1.5 rounded-full">
              <Star className="h-3 w-3 fill-gold" /> EKSPERT
            </span>
            <span className="absolute bottom-32 right-5 inline-flex items-center gap-1.5 bg-gold text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" /> 6 YILLIK TAJRIBA
            </span>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="text-gold text-xs tracking-[0.25em] font-semibold mb-1">REMONT MUTAXASSISI</div>
              <div className="text-white text-3xl font-bold">Islombek Saidametov</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground tracking-wider font-semibold mb-2">{label}</label>
      {children}
    </div>
  );
}

function ToggleOpt({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`py-3 px-3 rounded-lg border text-sm font-medium transition ${active ? "bg-gold text-primary-foreground border-gold" : "bg-input text-white border-border hover:border-gold/50"}`}>
      {children}
    </button>
  );
}
