import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Lead, ChannelDef, LeadStatus, Channel } from "./store-types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "./env";

export { supabaseConfigured, SUPABASE_CONFIG_HINT } from "./env";

if (!supabaseConfigured && typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.warn("[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set at build time.");
}

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-anon-key";

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || PLACEHOLDER_URL,
  SUPABASE_ANON_KEY || PLACEHOLDER_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

/* ----------------- DB row shapes ----------------- */
export interface LeadRow {
  id: string;
  name: string;
  phone: string;
  wants_renovation: boolean;
  budget: number | null;
  channel: Channel;
  channel_label: string;
  status: LeadStatus;
  note: string | null;
  created_at: string;
  next_call: string;
}

export interface ChannelRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
}

/* ----------------- Converters ----------------- */
export function rowToLead(r: LeadRow): Lead {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    wantsRenovation: r.wants_renovation,
    budget: r.budget ?? undefined,
    channel: r.channel,
    channelLabel: r.channel_label,
    status: r.status,
    note: r.note ?? undefined,
    createdAt: r.created_at,
    nextCall: r.next_call,
  };
}

export function leadToRow(l: Partial<Lead>): Partial<LeadRow> {
  const row: Partial<LeadRow> = {};
  if (l.id !== undefined) row.id = l.id;
  if (l.name !== undefined) row.name = l.name;
  if (l.phone !== undefined) row.phone = l.phone;
  if (l.wantsRenovation !== undefined) row.wants_renovation = l.wantsRenovation;
  if (l.budget !== undefined) row.budget = l.budget ?? null;
  if (l.channel !== undefined) row.channel = l.channel;
  if (l.channelLabel !== undefined) row.channel_label = l.channelLabel;
  if (l.status !== undefined) row.status = l.status;
  if (l.note !== undefined) row.note = l.note ?? null;
  if (l.createdAt !== undefined) row.created_at = l.createdAt;
  if (l.nextCall !== undefined) row.next_call = l.nextCall;
  return row;
}

export function rowToChannel(r: ChannelRow): ChannelDef {
  return { id: r.id, name: r.name, slug: r.slug };
}
