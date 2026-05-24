export type LeadStatus = "new" | "contacted" | "meeting" | "met" | "won" | "lost";
export type ServiceType = "design" | "realization";
export type ProjectType = "residential" | "commercial" | "architectural";

export const SERVICE_LABELS: Record<ServiceType, string> = {
  design: "Dizayn loyihasi",
  realization: "Loyihani amalga oshirish",
};

export const PROJECT_LABELS: Record<ProjectType, string> = {
  residential: "Turar joy interyeri",
  commercial: "Tijorat interyeri",
  architectural: "Arxitektura dizayni",
};

export interface Lead {
  id: string;
  name: string;
  phone: string;
  wantsRenovation: boolean;
  budget?: number;
  serviceType?: ServiceType;
  projectType?: ProjectType;
  areaSqm?: number;
  propertyAddress?: string;
  status: LeadStatus;
  createdAt: string;
  nextCall: string;
  note?: string;
}

export interface AdminUser {
  id: string;
  email: string;
}

export const STATUS_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "meeting",
  "met",
  "won",
  "lost",
];

export const STATUS_META: Record<
  LeadStatus,
  { label: string; color: string; dot: string }
> = {
  new: {
    label: "Yangi",
    color:
      "bg-[color:var(--status-new)]/15 text-[color:var(--status-new)] border-[color:var(--status-new)]/30",
    dot: "bg-[color:var(--status-new)]",
  },
  contacted: {
    label: "Bog'lanildi",
    color:
      "bg-[color:var(--status-contact)]/15 text-[color:var(--status-contact)] border-[color:var(--status-contact)]/30",
    dot: "bg-[color:var(--status-contact)]",
  },
  meeting: {
    label: "Uchrashuv belgilandi",
    color:
      "bg-[color:var(--status-meet)]/15 text-[color:var(--status-meet)] border-[color:var(--status-meet)]/30",
    dot: "bg-[color:var(--status-meet)]",
  },
  met: {
    label: "Uchrashuv bo'ldi",
    color:
      "bg-[color:var(--status-met)]/15 text-[color:var(--status-met)] border-[color:var(--status-met)]/30",
    dot: "bg-[color:var(--status-met)]",
  },
  won: {
    label: "Sotib oldi",
    color:
      "bg-[color:var(--status-won)]/15 text-[color:var(--status-won)] border-[color:var(--status-won)]/30",
    dot: "bg-[color:var(--status-won)]",
  },
  lost: {
    label: "Yo'qotildi",
    color:
      "bg-[color:var(--status-lost)]/15 text-[color:var(--status-lost)] border-[color:var(--status-lost)]/30",
    dot: "bg-[color:var(--status-lost)]",
  },
};
