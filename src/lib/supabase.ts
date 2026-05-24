import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Lead, LeadStatus, ServiceType, ProjectType } from "./store-types";

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

  service_type: ServiceType | null;

  project_type: ProjectType | null;

  area_sqm: number | null;

  property_address: string | null;

  status: LeadStatus;

  note: string | null;

  created_at: string;

  next_call: string;

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

    serviceType: r.service_type ?? undefined,

    projectType: r.project_type ?? undefined,

    areaSqm: r.area_sqm ?? undefined,

    propertyAddress: r.property_address ?? undefined,

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

  if (l.serviceType !== undefined) row.service_type = l.serviceType ?? null;

  if (l.projectType !== undefined) row.project_type = l.projectType ?? null;

  if (l.areaSqm !== undefined) row.area_sqm = l.areaSqm ?? null;

  if (l.propertyAddress !== undefined) row.property_address = l.propertyAddress ?? null;

  if (l.status !== undefined) row.status = l.status;

  if (l.note !== undefined) row.note = l.note ?? null;

  if (l.createdAt !== undefined) row.created_at = l.createdAt;

  if (l.nextCall !== undefined) row.next_call = l.nextCall;

  return row;

}

