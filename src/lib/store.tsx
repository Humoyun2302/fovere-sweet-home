import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type LeadStatus = "new" | "contacted" | "meeting" | "met" | "won" | "lost";
export type Channel = "direct" | "youtube" | "instagram" | "telegram";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  wantsRenovation: boolean;
  budget?: number;
  channel: Channel;
  channelLabel: string;
  status: LeadStatus;
  createdAt: string;
  nextCall: string;
}

export interface ChannelDef {
  id: string;
  name: string;
  slug: string;
}

interface Store {
  leads: Lead[];
  channels: ChannelDef[];
  addLead: (l: Omit<Lead, "id" | "createdAt" | "nextCall" | "status">) => void;
  updateStatus: (id: string, status: LeadStatus) => void;
  deleteLead: (id: string) => void;
  addChannel: (name: string) => void;
  removeChannel: (id: string) => void;
}

const seed: Lead[] = [
  { id: "1", name: "Зафар ТУРАЕВ", phone: "+998935686466", wantsRenovation: true, budget: 15000, channel: "direct", channelLabel: "Bevosita", status: "new", createdAt: "2026-05-19T13:15:00", nextCall: "2026-05-23T12:30:00" },
  { id: "2", name: "Islombek", phone: "993669445", wantsRenovation: true, budget: 50000, channel: "direct", channelLabel: "Bevosita", status: "meeting", createdAt: "2026-05-17T18:27:00", nextCall: "2026-05-23T12:30:00" },
  { id: "3", name: "Test prod", phone: "+998917589999", wantsRenovation: true, budget: 2000, channel: "direct", channelLabel: "Bevosita", status: "new", createdAt: "2026-05-16T19:49:00", nextCall: "2026-05-23T12:30:00" },
  { id: "4", name: "test youtube", phone: "+998999999999", wantsRenovation: false, channel: "youtube", channelLabel: "YouTube video", status: "new", createdAt: "2026-05-16T19:12:00", nextCall: "2026-05-23T12:30:00" },
  { id: "5", name: "test", phone: "+998917777777", wantsRenovation: false, channel: "direct", channelLabel: "Bevosita", status: "new", createdAt: "2026-05-16T19:10:00", nextCall: "2026-05-23T12:30:00" },
  { id: "6", name: "Test", phone: "+998900000001", wantsRenovation: true, budget: 500, channel: "direct", channelLabel: "Bevosita", status: "new", createdAt: "2026-05-15T10:00:00", nextCall: "2026-05-23T12:30:00" },
  { id: "7", name: "Test", phone: "+998900000002", wantsRenovation: true, budget: 15000000, channel: "direct", channelLabel: "Bevosita", status: "new", createdAt: "2026-05-14T09:00:00", nextCall: "2026-05-23T12:30:00" },
];

const seedChannels: ChannelDef[] = [
  { id: "c1", name: "YouTube video", slug: "youtube-video" },
];

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(seed);
  const [channels, setChannels] = useState<ChannelDef[]>(seedChannels);

  useEffect(() => {
    try {
      const l = localStorage.getItem("fovere_leads");
      const c = localStorage.getItem("fovere_channels");
      if (l) setLeads(JSON.parse(l));
      if (c) setChannels(JSON.parse(c));
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem("fovere_leads", JSON.stringify(leads)); } catch {} }, [leads]);
  useEffect(() => { try { localStorage.setItem("fovere_channels", JSON.stringify(channels)); } catch {} }, [channels]);

  const store: Store = {
    leads, channels,
    addLead: (l) => setLeads((prev) => [{
      ...l,
      id: crypto.randomUUID(),
      status: "new",
      createdAt: new Date().toISOString(),
      nextCall: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    }, ...prev]),
    updateStatus: (id, status) => setLeads((p) => p.map((x) => x.id === id ? { ...x, status } : x)),
    deleteLead: (id) => setLeads((p) => p.filter((x) => x.id !== id)),
    addChannel: (name) => setChannels((p) => [...p, { id: crypto.randomUUID(), name, slug: name.toLowerCase().replace(/\s+/g, "-") }]),
    removeChannel: (id) => setChannels((p) => p.filter((x) => x.id !== id)),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
}

export const STATUS_META: Record<LeadStatus, { label: string; color: string; dot: string }> = {
  new: { label: "Yangi", color: "bg-[color:var(--status-new)]/15 text-[color:var(--status-new)] border-[color:var(--status-new)]/30", dot: "bg-[color:var(--status-new)]" },
  contacted: { label: "Bog'lanildi", color: "bg-[color:var(--status-contact)]/15 text-[color:var(--status-contact)] border-[color:var(--status-contact)]/30", dot: "bg-[color:var(--status-contact)]" },
  meeting: { label: "Uchrashuv belgilandi", color: "bg-[color:var(--status-meet)]/15 text-[color:var(--status-meet)] border-[color:var(--status-meet)]/30", dot: "bg-[color:var(--status-meet)]" },
  met: { label: "Uchrashuv bo'ldi", color: "bg-[color:var(--status-met)]/15 text-[color:var(--status-met)] border-[color:var(--status-met)]/30", dot: "bg-[color:var(--status-met)]" },
  won: { label: "Sotib oldi", color: "bg-[color:var(--status-won)]/15 text-[color:var(--status-won)] border-[color:var(--status-won)]/30", dot: "bg-[color:var(--status-won)]" },
  lost: { label: "Yo'qotildi", color: "bg-[color:var(--status-lost)]/15 text-[color:var(--status-lost)] border-[color:var(--status-lost)]/30", dot: "bg-[color:var(--status-lost)]" },
};

export function formatDateShort(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  const hh = String(d.getHours()).padStart(2, "0");
  const mn = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy}, ${hh}:${mn}`;
}
export function formatDateLong(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mn = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}, ${hh}:${mn}`;
}
