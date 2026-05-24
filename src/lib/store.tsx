import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  supabase,
  supabaseConfigured,
  SUPABASE_CONFIG_HINT,
  rowToLead,
  leadToRow,
  type LeadRow,
  type ProfileRow,
} from "./supabase";
import type { Lead, LeadStatus, AdminUser, ServiceType, ProjectType } from "./store-types";

export type { Lead, LeadStatus, AdminUser } from "./store-types";
export { STATUS_META, STATUS_ORDER } from "./store-types";

/* ----------------- Store API ----------------- */
interface Store {
  // Auth
  user: AdminUser | null;
  authReady: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Data
  leads: Lead[];
  leadsLoading: boolean;

  // Lead mutations (async, throw on error)
  addLead: (l: NewLeadInput) => Promise<void>;
  createLead: (l: AdminLeadInput) => Promise<void>;
  updateLead: (id: string, patch: Partial<Lead>) => Promise<void>;
  updateStatus: (id: string, status: LeadStatus) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
}

/** What the landing form provides. */
export interface NewLeadInput {
  name: string;
  phone: string;
  serviceType: ServiceType;
  projectType: ProjectType;
  areaSqm: number;
  propertyAddress?: string;
  budget?: number;
}

/** What the admin "create" / "edit" dialog provides. */
export interface AdminLeadInput {
  name: string;
  phone: string;
  serviceType?: ServiceType;
  projectType?: ProjectType;
  areaSqm?: number;
  propertyAddress?: string;
  wantsRenovation: boolean;
  budget?: number;
  status: LeadStatus;
  nextCall: string;
  note?: string;
}

const Ctx = createContext<Store | null>(null);

/* ----------------- Provider ----------------- */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  const mounted = useRef(false);

  /* ---- Auth bootstrap ---- */
  useEffect(() => {
    if (!supabaseConfigured) {
      setAuthReady(true);
      return;
    }

    let active = true;

    async function resolveAdminProfile(userId: string): Promise<AdminUser | null> {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("id", userId)
        .maybeSingle<ProfileRow>();
      if (error || !data) return null;
      if (data.role !== "admin") return null;
      return { id: data.id, email: data.email };
    }

    // Never await Supabase calls inside onAuthStateChange — that holds the auth
    // lock and deadlocks other client calls (e.g. landing-form lead inserts).
    function applySession(session: { user: { id: string } } | null, markReady: boolean) {
      setTimeout(async () => {
        if (!active) return;
        if (session?.user) {
          const profile = await resolveAdminProfile(session.user.id);
          if (active) setUser(profile);
        } else if (active) {
          setUser(null);
        }
        if (markReady && active) setAuthReady(true);
      }, 0);
    }

    // getSession covers the case where INITIAL_SESSION fired before this effect ran.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      applySession(session, true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      applySession(session, event === "INITIAL_SESSION");
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  /* ---- Leads: load + realtime (admin only) ---- */
  const loadLeads = useCallback(async () => {
    if (!supabaseConfigured) return;
    setLeadsLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[loadLeads] FAILED:", error);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[loadLeads] loaded ${data?.length ?? 0} leads`);
      if (data) setLeads((data as LeadRow[]).map(rowToLead));
    }
    setLeadsLoading(false);
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return;
    if (!user) {
      setLeads([]);
      return;
    }

    loadLeads();

    const subscription = supabase
      .channel(`public:leads:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = rowToLead(payload.new as LeadRow);
            setLeads((prev) => (prev.some((l) => l.id === row.id) ? prev : [row, ...prev]));
          } else if (payload.eventType === "UPDATE") {
            const row = rowToLead(payload.new as LeadRow);
            setLeads((prev) => prev.map((l) => (l.id === row.id ? row : l)));
          } else if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id: string }).id;
            setLeads((prev) => prev.filter((l) => l.id !== oldId));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, loadLeads]);

  /* ---- Track mount for diagnostic logging ---- */
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /* ---- Mutations ---- */
  const store: Store = useMemo(() => {
    function throwIfNotConfigured() {
      if (!supabaseConfigured) {
        throw new Error(`Supabase ulanmagan. ${SUPABASE_CONFIG_HINT}`);
      }
    }

    return {
      user,
      authReady,
      leads,
      leadsLoading,

      login: async (email, password) => {
        if (!supabaseConfigured) {
          return { ok: false, error: `Supabase ulanmagan. ${SUPABASE_CONFIG_HINT}` };
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error || !data.user) {
          return { ok: false, error: error?.message ?? "Login muvaffaqiyatsiz" };
        }
        // Verify admin role.
        const { data: profile, error: profErr } = await supabase
          .from("profiles")
          .select("id, email, role")
          .eq("id", data.user.id)
          .maybeSingle<ProfileRow>();
        if (profErr || !profile) {
          await supabase.auth.signOut();
          return { ok: false, error: "Profil topilmadi" };
        }
        if (profile.role !== "admin") {
          await supabase.auth.signOut();
          return { ok: false, error: "Sizda admin huquqi yo'q" };
        }
        setUser({ id: profile.id, email: profile.email });
        return { ok: true };
      },

      logout: async () => {
        if (supabaseConfigured) await supabase.auth.signOut();
        setUser(null);
      },

      /* Landing form submission (anonymous insert). */
      addLead: async (l) => {
        throwIfNotConfigured();
        const row = leadToRow({
          ...l,
          status: "new",
          wantsRenovation: l.serviceType === "realization",
        });
        // No .select() — anonymous users cannot read leads (RLS); returning rows would fail.
        const { error } = await supabase.from("leads").insert(row);
        if (error) {
          // eslint-disable-next-line no-console
          console.error("[addLead] insert failed:", error, "payload:", row);
          throw new Error(error.message);
        }
      },

      /* Admin "Yangi ariza" dialog. */
      createLead: async (l) => {
        throwIfNotConfigured();
        const row = leadToRow(l);
        const { error } = await supabase.from("leads").insert(row);
        if (error) {
          // eslint-disable-next-line no-console
          console.error("[createLead] insert failed:", error, "payload:", row);
          throw new Error(error.message);
        }
      },

      updateLead: async (id, patch) => {
        throwIfNotConfigured();
        const row = leadToRow(patch);
        const { error } = await supabase.from("leads").update(row).eq("id", id);
        if (error) {
          // eslint-disable-next-line no-console
          console.error("[updateLead] failed:", error);
          throw new Error(error.message);
        }
      },

      updateStatus: async (id, status) => {
        throwIfNotConfigured();
        const { error } = await supabase.from("leads").update({ status }).eq("id", id);
        if (error) {
          // eslint-disable-next-line no-console
          console.error("[updateStatus] failed:", error);
          throw new Error(error.message);
        }
      },

      deleteLead: async (id) => {
        throwIfNotConfigured();
        const { error } = await supabase.from("leads").delete().eq("id", id);
        if (error) {
          // eslint-disable-next-line no-console
          console.error("[deleteLead] failed:", error);
          throw new Error(error.message);
        }
      },
    };
  }, [user, authReady, leads, leadsLoading]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
}

/* ----------------- Formatting helpers (unchanged) ----------------- */
export function formatDateShort(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  const hh = String(d.getHours()).padStart(2, "0");
  const mn = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy}, ${hh}:${mn}`;
}
export function formatDateLong(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mn = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}, ${hh}:${mn}`;
}
export function toLocalInputValue(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function fromLocalInputValue(v: string) {
  if (!v) return new Date().toISOString();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
export function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}
export function isThisWeek(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const start = startOfWeek();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return d >= start && d < end;
}
