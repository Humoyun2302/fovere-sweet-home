import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type DragEvent } from "react";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Globe,
  LogOut,
  Search,
  Download,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  UserPlus,
  CheckCircle2,
  ArrowRight,
  X,
  GripVertical,
  Menu,
  PanelLeftClose,
} from "lucide-react";
import { toast } from "sonner";
import {
  useStore,
  STATUS_META,
  STATUS_ORDER,
  formatDateShort,
  formatDateLong,
  toLocalInputValue,
  fromLocalInputValue,
  isThisWeek,
  type Lead,
  type LeadStatus,
} from "@/lib/store";
import { PROJECT_LABELS, SERVICE_LABELS, type ServiceType, type ProjectType } from "@/lib/store-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { LeadsStatsCharts } from "@/components/LeadsStatsCharts";
import { formatPhone, isValidPhone, PHONE_INVALID_MESSAGE, PHONE_PLACEHOLDER } from "@/lib/phone";
import { countLeadsOnDay } from "@/lib/lead-stats";

export const Route = createFileRoute("/admin")({
  component: AdminGuard,
  head: () => ({ meta: [{ title: "CRM Panel — Fovere" }] }),
});

type View = "dashboard" | "arizalar" | "kanban";

function AdminGuard() {
  const { user, authReady } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (authReady && !user) navigate({ to: "/login" });
  }, [authReady, user, navigate]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-canvas grid place-items-center text-muted-foreground text-sm">
        Yuklanmoqda...
      </div>
    );
  }
  if (!user) return null;
  return <Admin />;
}

const VIEW_LABELS: Record<View, string> = {
  dashboard: "Dashboard",
  arizalar: "Arizalar",
  kanban: "Kanban",
};

function Admin() {
  const isMobile = useIsMobile();
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-close on mobile, auto-open on desktop when viewport class changes.
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const navigateTo = (v: View) => {
    setView(v);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          aria-hidden
        />
      )}

      <Sidebar
        view={view}
        setView={navigateTo}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar with sidebar toggle */}
        <div className="sticky top-0 z-30 bg-canvas/90 backdrop-blur border-b border-border">
          <div className="px-4 md:px-8 py-3 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "Menyuni yopish" : "Menyuni ochish"}
              title={sidebarOpen ? "Menyuni yopish" : "Menyuni ochish"}
              className="p-2 -ml-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-white transition"
            >
              {sidebarOpen && !isMobile ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <div className="text-sm md:text-base text-white font-semibold">
              {VIEW_LABELS[view]}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {view === "dashboard" && <Dashboard onJump={navigateTo} />}
          {view === "arizalar" && <Arizalar />}
          {view === "kanban" && <Kanban />}
        </div>
      </main>
    </div>
  );
}

/* ----------------- SIDEBAR ----------------- */
function Sidebar({
  view,
  setView,
  open,
  onClose,
  isMobile,
}: {
  view: View;
  setView: (v: View) => void;
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}) {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const items: { id: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "arizalar", label: "Arizalar", icon: Users },
    { id: "kanban", label: "Kanban", icon: KanbanSquare },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success("Tizimdan chiqdingiz");
    navigate({ to: "/login" });
  };

  // On desktop, when closed we collapse to zero width (removed from flex flow).
  // On mobile, we always render the drawer but translate it off-screen when closed.
  if (!isMobile && !open) return null;

  return (
    <aside
      className={`
        ${isMobile ? "fixed inset-y-0 left-0 z-50 shadow-2xl" : "sticky top-0 h-screen"}
        w-64 shrink-0 bg-card border-r border-border flex flex-col
        transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="p-5 border-b border-border flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-white font-bold text-lg">CRM Panel</div>
          <div className="text-[10px] text-muted-foreground mt-1 truncate">{user?.email}</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Menyuni yopish"
          className="p-1.5 -mr-1 rounded hover:bg-accent text-muted-foreground hover:text-white transition shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((it) => {
          const active = view === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${active ? "bg-gold-soft text-gold border border-gold/30" : "text-muted-foreground hover:bg-accent hover:text-white border border-transparent"}`}
            >
              <it.icon className="h-4 w-4" /> {it.label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-white"
        >
          <Globe className="h-4 w-4" /> Sayt
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" /> Chiqish
        </button>
      </div>
    </aside>
  );
}

/* ----------------- DASHBOARD ----------------- */
function Dashboard({ onJump }: { onJump: (v: View) => void }) {
  const { leads, leadsLoading } = useStore();
  const counts = useMemo(() => {
    const c: Record<LeadStatus, number> = { new: 0, contacted: 0, meeting: 0, met: 0, won: 0, lost: 0 };
    leads.forEach((l) => c[l.status]++);
    return c;
  }, [leads]);
  const thisWeek = useMemo(() => leads.filter((l) => isThisWeek(l.createdAt)).length, [leads]);
  const todayLeads = useMemo(() => countLeadsOnDay(leads, new Date()), [leads]);
  const conversion = leads.length ? Math.round((counts.won / leads.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Umumiy statistika va ko'rsatkichlar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI title="Jami Arizalar" value={leads.length} sub={`Bugun: +${todayLeads} · Hafta: +${thisWeek}`} icon={Users} />
        <KPI title="Yangi" value={counts.new} sub="Yangi arizalar" icon={UserPlus} />
        <KPI title="Mijozlar" value={counts.won} sub="Sotib oldi" icon={CheckCircle2} />
        <KPI title="Konversiya" value={`${conversion}%`} sub="O'rtacha" icon={TrendingUp} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Status bo'yicha</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <PipeBox n={counts.new} label="Yangi" color="var(--status-new)" />
          <PipeBox n={counts.contacted} label="Bog'lanildi" color="var(--status-contact)" />
          <PipeBox n={counts.meeting} label="Uchrashuv belgilandi" color="var(--status-meet)" />
          <PipeBox n={counts.met} label="Uchrashuv bo'ldi" color="var(--status-met)" />
          <PipeBox n={counts.won} label="Sotib oldi" color="var(--status-won)" />
          <PipeBox n={counts.lost} label="Yo'qotildi" color="var(--status-lost)" />
        </div>
      </div>

      <LeadsStatsCharts leads={leads} loading={leadsLoading} />

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">So'nggi arizalar</h3>
          <button
            onClick={() => onJump("arizalar")}
            className="text-gold text-sm inline-flex items-center gap-1 hover:underline"
          >
            Hammasini ko'rish <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {leadsLoading && leads.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">Yuklanmoqda...</div>
        ) : leads.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">Hozircha ariza yo'q</div>
        ) : (
          <ul className="divide-y divide-border">
            {leads.slice(0, 5).map((l) => {
              const meta = STATUS_META[l.status];
              return (
                <li
                  key={l.id}
                  onClick={() => onJump("arizalar")}
                  className="py-3 flex items-center gap-4 cursor-pointer hover:bg-accent/30 -mx-2 px-2 rounded-lg transition"
                >
                  <div className="h-10 w-10 rounded-full bg-gold/15 text-gold grid place-items-center font-bold">
                    {l.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.phone}</div>
                    <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {leadServiceLabel(l)} · {leadProjectLabel(l)}
                      {l.areaSqm != null ? ` · ${l.areaSqm} m²` : ""}
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full border ${meta.color}`}>{meta.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function KPI({
  title,
  value,
  sub,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground tracking-wider uppercase">{title}</div>
          <div className="text-3xl font-bold text-white mt-2">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{sub}</div>
        </div>
        <div className="h-10 w-10 rounded-lg bg-gold-soft text-gold grid place-items-center">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
function PipeBox({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div className="bg-background/40 border border-border rounded-xl p-4">
      <div className="text-2xl font-bold text-white">{n}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
      <div className="h-1 rounded-full mt-3" style={{ background: color }} />
    </div>
  );
}

/* ----------------- ARIZALAR ----------------- */
type DateRange = "all" | "today" | "week" | "month";

function leadServiceLabel(l: Lead) {
  if (l.serviceType) return SERVICE_LABELS[l.serviceType];
  return l.wantsRenovation ? SERVICE_LABELS.realization : SERVICE_LABELS.design;
}

function leadProjectLabel(l: Lead) {
  if (l.projectType) return PROJECT_LABELS[l.projectType];
  return "—";
}

function Arizalar() {
  const { leads, leadsLoading, updateStatus, deleteLead } = useStore();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");

  const [editing, setEditing] = useState<Lead | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Lead | null>(null);

  const inDateRange = (iso: string) => {
    if (dateRange === "all") return true;
    const d = new Date(iso);
    const now = new Date();
    if (Number.isNaN(d.getTime())) return false;
    if (dateRange === "today") {
      return d.toDateString() === now.toDateString();
    }
    if (dateRange === "week") {
      return now.getTime() - d.getTime() < 7 * 24 * 3600 * 1000;
    }
    if (dateRange === "month") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filtered = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (!inDateRange(l.createdAt)) return false;
    if (q) {
      const hay = `${l.name} ${l.phone} ${l.propertyAddress ?? ""} ${leadServiceLabel(l)} ${leadProjectLabel(l)}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.error("Eksport qilish uchun arizalar yo'q");
      return;
    }
    const rows = [
      [
        "Ism",
        "Telefon",
        "Xizmat",
        "Loyiha turi",
        "Maydon (m²)",
        "Byudjet",
        "Manzil",
        "Status",
        "Sana",
        "Keyingi qo'ng'iroq",
      ],
    ];
    filtered.forEach((l) =>
      rows.push([
        l.name,
        l.phone,
        leadServiceLabel(l),
        leadProjectLabel(l),
        l.areaSqm != null ? String(l.areaSqm) : "",
        l.budget != null ? String(l.budget) : "",
        l.propertyAddress ?? "",
        STATUS_META[l.status].label,
        formatDateLong(l.createdAt),
        formatDateLong(l.nextCall),
      ]),
    );
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `arizalar-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`${filtered.length} ta ariza eksport qilindi`);
  };

  const dateRangeLabel: Record<DateRange, string> = {
    all: "Hamma vaqt",
    today: "Bugun",
    week: "Bu hafta",
    month: "Bu oy",
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Arizalar</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} ta ariza topildi</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Qidirish..."
              className="bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-gold w-48"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="all">Barcha statuslar</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            className="bg-card border border-border hover:border-gold/50 text-white text-sm px-3 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => setCreating(true)}
            className="bg-gold text-primary-foreground font-semibold text-sm px-4 py-2 rounded-lg inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Yangi ariza
          </button>
        </div>
      </div>

      {/* Working filter pills */}
      <div className="flex flex-wrap gap-2">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as DateRange)}
          className="px-3 py-1.5 rounded-full bg-card border border-border text-xs text-white hover:border-gold/50 focus:outline-none focus:border-gold"
        >
          {(Object.keys(dateRangeLabel) as DateRange[]).map((k) => (
            <option key={k} value={k}>
              Sana: {dateRangeLabel[k]}
            </option>
          ))}
        </select>
        {(statusFilter !== "all" || dateRange !== "all" || q) && (
          <button
            onClick={() => {
              setStatusFilter("all");
              setDateRange("all");
              setQ("");
            }}
            className="px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/30 text-xs text-destructive hover:bg-destructive/20 inline-flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Filtrlarni tozalash
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background/40 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                {[
                  "Ism",
                  "Telefon",
                  "Xizmat",
                  "Loyiha",
                  "Maydon",
                  "Byudjet",
                  "Manzil",
                  "Status",
                  "Sana",
                  "Amallar",
                ].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                    {leadsLoading ? "Yuklanmoqda..." : "Ariza topilmadi"}
                  </td>
                </tr>
              )}
              {filtered.map((l) => {
                const meta = STATUS_META[l.status];
                return (
                  <tr key={l.id} className="hover:bg-accent/40">
                    <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{l.name}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="hover:text-gold">
                        {l.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap max-w-[140px] truncate">
                      {leadServiceLabel(l)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap max-w-[120px] truncate">
                      {leadProjectLabel(l)}
                    </td>
                    <td className="px-4 py-3 text-white whitespace-nowrap">
                      {l.areaSqm != null ? `${l.areaSqm} m²` : "—"}
                    </td>
                    <td className="px-4 py-3 text-white whitespace-nowrap">
                      {l.budget ? `$${l.budget.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[160px] truncate" title={l.propertyAddress ?? undefined}>
                      {l.propertyAddress ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={l.status}
                        onChange={async (e) => {
                          try {
                            await updateStatus(l.id, e.target.value as LeadStatus);
                            toast.success("Status yangilandi");
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Xatolik");
                          }
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs border bg-transparent ${meta.color} focus:outline-none cursor-pointer`}
                      >
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s} className="bg-card text-white">
                            {STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDateShort(l.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditing(l)}
                          title="Tahrirlash"
                          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(l)}
                          title="O'chirish"
                          className="p-1.5 rounded hover:bg-destructive/15 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create dialog */}
      <LeadDialog
        open={!!editing || creating}
        lead={editing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
      />

      {/* Delete confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="bg-card border-border text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Arizani o'chirish</DialogTitle>
            <DialogDescription>
              <span className="text-white font-medium">{confirmDelete?.name}</span> arizasini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setConfirmDelete(null)}
              className="px-4 py-2 rounded-lg border border-border text-sm text-white hover:bg-accent"
            >
              Bekor qilish
            </button>
            <button
              onClick={async () => {
                if (!confirmDelete) return;
                try {
                  await deleteLead(confirmDelete.id);
                  toast.success("O'chirildi");
                  setConfirmDelete(null);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Xatolik");
                }
              }}
              className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90"
            >
              O'chirish
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ----------------- LEAD DIALOG (create + edit) ----------------- */
function LeadDialog({ open, lead, onClose }: { open: boolean; lead: Lead | null; onClose: () => void }) {
  const { updateLead, createLead } = useStore();
  const isEdit = !!lead;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType | "">("");
  const [projectType, setProjectType] = useState<ProjectType | "">("");
  const [areaSqm, setAreaSqm] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [nextCall, setNextCall] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    if (lead) {
      setName(lead.name);
      setPhone(formatPhone(lead.phone));
      setServiceType(lead.serviceType ?? (lead.wantsRenovation ? "realization" : "design"));
      setProjectType(lead.projectType ?? "");
      setAreaSqm(lead.areaSqm != null ? String(lead.areaSqm) : "");
      setPropertyAddress(lead.propertyAddress ?? "");
      setBudget(lead.budget ? String(lead.budget) : "");
      setStatus(lead.status);
      setNextCall(toLocalInputValue(lead.nextCall));
      setNote(lead.note ?? "");
    } else {
      setName("");
      setPhone("");
      setServiceType("");
      setProjectType("");
      setAreaSqm("");
      setPropertyAddress("");
      setBudget("");
      setStatus("new");
      setNextCall(toLocalInputValue(new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString()));
      setNote("");
    }
  }, [open, lead]);

  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Ism kerak");
    if (!phone.trim()) return toast.error("Telefon kerak");
    if (!isValidPhone(phone)) return toast.error(PHONE_INVALID_MESSAGE);
    if (!serviceType) return toast.error("Xizmat turini tanlang");
    if (!projectType) return toast.error("Loyiha turini tanlang");
    if (serviceType === "realization" && !budget.trim()) {
      return toast.error("Taxminiy byudjetni kiriting");
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      serviceType,
      projectType,
      areaSqm: areaSqm.trim() ? Number(areaSqm) || undefined : undefined,
      propertyAddress: propertyAddress.trim() || undefined,
      wantsRenovation: serviceType === "realization",
      budget: budget ? Number(budget) || undefined : undefined,
      status,
      nextCall: fromLocalInputValue(nextCall),
      note: note.trim() || undefined,
    };

    setSaving(true);
    try {
      if (isEdit && lead) {
        await updateLead(lead.id, payload);
        toast.success("Ariza yangilandi");
      } else {
        await createLead(payload);
        toast.success("Ariza qo'shildi");
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border text-white max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEdit ? "Arizani tahrirlash" : "Yangi ariza qo'shish"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Mijoz ma'lumotlarini yangilang" : "Yangi mijoz arizasini qo'shing"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <DialogField label="Ism *">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                placeholder="Ali Valiyev"
              />
            </DialogField>
            <DialogField label="Telefon *">
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                placeholder={PHONE_PLACEHOLDER}
              />
            </DialogField>
            <DialogField label="Xizmat turi *">
              <select
                value={serviceType}
                onChange={(e) => {
                  const v = e.target.value as ServiceType | "";
                  setServiceType(v);
                  if (v !== "realization") setBudget("");
                }}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
              >
                <option value="">Tanlang</option>
                {(Object.keys(SERVICE_LABELS) as ServiceType[]).map((k) => (
                  <option key={k} value={k}>
                    {SERVICE_LABELS[k]}
                  </option>
                ))}
              </select>
            </DialogField>
            <DialogField label="Loyiha turi *">
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType | "")}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
              >
                <option value="">Tanlang</option>
                {(Object.keys(PROJECT_LABELS) as ProjectType[]).map((k) => (
                  <option key={k} value={k}>
                    {PROJECT_LABELS[k]}
                  </option>
                ))}
              </select>
            </DialogField>
            <DialogField label="Maydon (m²)">
              <input
                inputMode="decimal"
                value={areaSqm}
                onChange={(e) => setAreaSqm(e.target.value.replace(/[^\d.]/g, ""))}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                placeholder="85"
              />
            </DialogField>
            <DialogField label="Ob'ekt manzili">
              <input
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                placeholder="Shahar, tuman, ko'cha"
              />
            </DialogField>
            <DialogField label={serviceType === "realization" ? "Byudjet ($) *" : "Byudjet ($)"}>
              <input
                inputMode="numeric"
                value={budget}
                onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                placeholder="10000"
              />
            </DialogField>
            <DialogField label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </DialogField>
            <DialogField label="Keyingi qo'ng'iroq" className="col-span-2">
              <input
                type="datetime-local"
                value={nextCall}
                onChange={(e) => setNextCall(e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
              />
            </DialogField>
            <DialogField label="Izoh" className="col-span-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold resize-none"
                placeholder="Qo'shimcha eslatmalar..."
              />
            </DialogField>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-border text-sm text-white hover:bg-accent disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-gold text-primary-foreground text-sm font-semibold hover:bg-gold/90 disabled:opacity-60"
            >
              {saving ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Qo'shish"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DialogField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-muted-foreground tracking-wider font-semibold mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ----------------- KANBAN ----------------- */
function Kanban() {
  const { leads, updateStatus } = useStore();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<LeadStatus | null>(null);

  const cols: { id: LeadStatus; label: string }[] = STATUS_ORDER.map((s) => ({
    id: s,
    label: STATUS_META[s].label,
  }));

  const onDragStart = (e: DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };
  const onDragOver = (e: DragEvent, col: LeadStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverCol(col);
  };
  const onDrop = async (e: DragEvent, col: LeadStatus) => {
    e.preventDefault();
    const id = dragId ?? e.dataTransfer.getData("text/plain");
    setDragId(null);
    setOverCol(null);
    if (!id) return;
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.status === col) return;
    try {
      await updateStatus(id, col);
      toast.success(`${lead.name} → ${STATUS_META[col].label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Statusni o'zgartirib bo'lmadi");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-white">Kanban Board</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Arizalarni vizual boshqarish — kartani sudrab statusni o'zgartiring
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {cols.map((c) => {
          const items = leads.filter((l) => l.status === c.id);
          const meta = STATUS_META[c.id];
          const isOver = overCol === c.id;
          return (
            <div
              key={c.id}
              onDragOver={(e) => onDragOver(e, c.id)}
              onDragLeave={() => setOverCol((curr) => (curr === c.id ? null : curr))}
              onDrop={(e) => onDrop(e, c.id)}
              className={`bg-card border rounded-2xl p-4 flex flex-col min-h-[400px] transition ${
                isOver ? "border-gold ring-2 ring-gold/30" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                  <h3 className="text-white font-semibold text-sm">{c.label}</h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${meta.color}`}>{items.length}</span>
              </div>
              <div className="space-y-3 flex-1">
                {items.length === 0 && (
                  <div className="h-full grid place-items-center text-muted-foreground/50 text-xs border border-dashed border-border rounded-xl min-h-[120px] px-2 text-center">
                    Bo'sh — bu yerga karta sudrang
                  </div>
                )}
                {items.map((l) => {
                  const d = new Date(l.createdAt);
                  return (
                    <div
                      key={l.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, l.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                      }}
                      className={`bg-background/60 border border-border rounded-xl p-3 hover:border-gold/40 transition cursor-grab active:cursor-grabbing ${
                        dragId === l.id ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-white font-medium text-sm flex items-center gap-1.5">
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60" />
                          {l.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {String(d.getDate()).padStart(2, "0")}/{String(d.getMonth() + 1).padStart(2, "0")}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 pl-5">{l.phone}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 pl-5 truncate">
                        {leadServiceLabel(l)} · {leadProjectLabel(l)}
                        {l.areaSqm != null ? ` · ${l.areaSqm} m²` : ""}
                      </div>
                      <div className="flex items-center gap-2 mt-2 pl-5 flex-wrap">
                        {l.budget ? (
                          <span className="text-[10px] text-muted-foreground">${l.budget.toLocaleString()}</span>
                        ) : null}
                        {l.propertyAddress ? (
                          <span className="text-[10px] text-muted-foreground truncate max-w-[140px]" title={l.propertyAddress}>
                            {l.propertyAddress}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

