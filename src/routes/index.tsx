import { createFileRoute } from "@tanstack/react-router";
import { Star, Phone, Instagram, Youtube, Mail, MapPin } from "lucide-react";
import founderImg from "@/assets/founder.png";
import { Logo } from "@/components/Logo";
import { LeadEstimateForm } from "@/components/LeadEstimateForm";

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

function Landing() {
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
              <LeadEstimateForm />

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
