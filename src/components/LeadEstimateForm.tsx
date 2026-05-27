import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { formatPhone, isValidPhone, PHONE_INVALID_MESSAGE, PHONE_PLACEHOLDER } from "@/lib/phone";
import { useStore } from "@/lib/store";

const SERVICE_OPTIONS = [
  { value: "design", label: "Dizayn loyihasi" },
  { value: "realization", label: "Pod kluch remont" },
] as const;

const PROJECT_OPTIONS = [
  { value: "residential", label: "Turar joy design loyihasi" },
  { value: "commercial", label: "Noturar joy design loyihasi" },
  { value: "architectural", label: "Arxitektura xizmatlari" },
] as const;

type ServiceType = (typeof SERVICE_OPTIONS)[number]["value"];
type ProjectType = (typeof PROJECT_OPTIONS)[number]["value"];

export function LeadEstimateForm() {
  const { addLead } = useStore();

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [serviceType, setServiceType] = useState<ServiceType | "">("");
  const [projectType, setProjectType] = useState<ProjectType | "">("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const reset = () => {
    setServiceType("");
    setProjectType("");
    setArea("");
    setAddress("");
    setName("");
    setPhone("");
    setSubmitted(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType) return toast.error("Xizmat turini tanlang");
    if (!projectType) return toast.error("Loyiha turini tanlang");
    if (!area.trim() || Number(area) <= 0) return toast.error("Maydonni to'g'ri kiriting (m²)");
    if (!name.trim()) return toast.error("Ism-familiyangizni kiriting");
    if (!phone.trim() || !isValidPhone(phone)) return toast.error(PHONE_INVALID_MESSAGE);

    setSubmitting(true);
    try {
      await addLead({
        name: name.trim(),
        phone: phone.trim(),
        serviceType,
        projectType,
        areaSqm: Number(area),
        propertyAddress: address.trim() || undefined,
      });
      toast.success("Arizangiz qabul qilindi!");
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yuborishda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="lead-form-card p-8 lg:p-6">
        <div className="text-center py-6 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
          <div className="h-16 w-16 rounded-full bg-gold/15 grid place-items-center">
            <CheckCircle2 className="h-9 w-9 text-gold" />
          </div>
          <h2 className="text-2xl font-bold text-gold">Rahmat, {name.split(" ")[0]}!</h2>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            Narx bo'yicha so'rovingiz qabul qilindi. Mutaxassisimiz tez orada siz bilan bog'lanadi.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 inline-flex items-center gap-1 text-sm text-gold hover:underline"
          >
            Yana bir so'rov yuborish <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lead-form-card p-5 sm:p-8 lg:p-6 lg:flex lg:flex-col lg:min-h-0">
      <p className="lead-intro__text text-center mb-5 sm:mb-6">
        <span className="lead-intro__line lead-intro__line--brand">
          Premium dizayn&nbsp;loyiha
        </span>
        <span className="lead-intro__line lead-intro__line--light">
          va arxitektura&nbsp;xizmatlari
        </span>
      </p>

      <form onSubmit={submit} className="lead-form lead-form-grid" noValidate>
        <LeadSelect
          label="XIZMAT TURI *"
          placeholder="Xizmatni tanlang"
          options={SERVICE_OPTIONS}
          value={serviceType}
          onChange={(v) => setServiceType(v as ServiceType)}
        />

        <LeadSelect
          label="LOYIHA TURI *"
          placeholder="Loyiha turini tanlang"
          options={PROJECT_OPTIONS}
          value={projectType}
          onChange={(v) => setProjectType(v as ProjectType)}
        />

        <LeadField label="MAYDON (M²) *">
          <input
            inputMode="decimal"
            value={area}
            onChange={(e) => setArea(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="Masalan: 85"
            className="lead-input"
          />
        </LeadField>

        <LeadField label="OBYEKT MANZILI">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Shahar, tuman, ko'cha"
            className="lead-input"
          />
        </LeadField>

        <LeadField label="ISM-FAMILIYA *">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: Ali Valiyev"
            className="lead-input"
          />
        </LeadField>

        <LeadField label="TELEFON RAQAMI *">
          <input
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder={PHONE_PLACEHOLDER}
            className="lead-input"
          />
        </LeadField>

        <div className="lead-form-grid__full">
          <button type="submit" disabled={submitting} className="lead-submit">
            {submitting ? "YUBORILMOQDA..." : "YUBORISH"}
          </button>
          <p className="lead-secure">
            <span className="lead-secure-dot" aria-hidden>
              ●
            </span>
            XAVFSIZ ULANISH FAOL
          </p>
        </div>
      </form>
    </div>
  );
}

function LeadField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="lead-label">{label}</label>
      {children}
    </div>
  );
}

function LeadSelect<T extends string>({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: readonly { value: T; label: string }[];
  value: T | "";
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (v: T) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="lead-select" ref={rootRef}>
      <label className="lead-label">{label}</label>
      <button
        type="button"
        className={`lead-select__trigger ${open ? "lead-select__trigger--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
      >
        <span className={selected ? "lead-select__value" : "lead-select__placeholder"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className="lead-select__chevron" aria-hidden />
      </button>

      <div
        id={listId}
        role="listbox"
        className={`lead-select__panel ${open ? "lead-select__panel--open" : ""}`}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="option"
            aria-selected={value === opt.value}
            className={`lead-select__option ${value === opt.value ? "lead-select__option--active" : ""}`}
            onClick={() => pick(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
