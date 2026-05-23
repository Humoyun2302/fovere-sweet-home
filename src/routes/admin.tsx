import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LayoutDashboard, Users, KanbanSquare, Link2, Globe, LogOut,
  Search, Download, Plus, Pencil, Trash2, Check, Copy, TrendingUp, UserPlus, CheckCircle2, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { StoreProvider, useStore, STATUS_META, formatDateShort, formatDateLong, type LeadStatus } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  component: () => <StoreProvider><Admin /></StoreProvider>,
  head: () => ({ meta: [{ title: "CRM Panel — Fovere" }] }),
});

type View = "dashboard" | "arizalar" | "kanban" | "kanallar";

function Admin() {
  const [view, setView] = useState<View>("dashboard");
  return (
    <div className="min-h-screen flex bg-canvas">
      <Sidebar view={view} setView={setView} />
      <main className="flex-1 overflow-x-auto">
        <div className="p-8 max-w-[1600px] mx-auto">
          {view === "dashboard" && <Dashboard onJump={setView} />}
          {view === "arizalar" && <Arizalar />}
          {view === "kanban" && <Kanban />}
          {view === "kanallar" && <Kanallar />}
        </div>
      </main>
    </div>
  );
}

function Sidebar({ view, setView }: { view: View; setView: (v: View) => void }) {
  const items: { id: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "arizalar", label: "Arizalar", icon: Users },
    { id: "kanban", label: "Kanban", icon: KanbanSquare },
    { id: "kanallar", label: "Kanallar", icon: Link2 },
  ];
  return (
    <aside className="w-64 shrink-0 bg-card border-r border-border flex flex-col">
      <div className="p-5 border-b border-border">
        <div className="text-white font-bold text-lg">CRM Panel</div>
        <div className="text-[10px] text-muted-foreground mt-1 truncate">islomsaidametov1@gmail.com</div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((it) => {
          const active = view === it.id;
          return (
            <button key={it.id} onClick={() => setView(it.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${active ? "bg-gold-soft text-gold border border-gold/30" : "text-muted-foreground hover:bg-accent hover:text-white border border-transparent"}`}>
              <it.icon className="h-4 w-4" /> {it.label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-white">
          <Globe className="h-4 w-4" /> Sayt
        </a>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4" /> Chiqish
        </button>
      </div>
    </aside>
  );
}

/* ----------------- DASHBOARD ----------------- */
function Dashboard({ onJump }: { onJump: (v: View) => void }) {
  const { leads } = useStore();
  const counts = useMemo(() => {
    const c = { new: 0, contacted: 0, meeting: 0, met: 0, won: 0, lost: 0 } as Record<LeadStatus, number>;
    leads.forEach((l) => c[l.status]++);
    return c;
  }, [leads]);
  const conversion = leads.length ? Math.round((counts.won / leads.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Umumiy statistika va ko'rsatkichlar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI title="Jami Arizalar" value={leads.length} sub={`Bu hafta: +${leads.length}`} icon={Users} />
        <KPI title="Yangi" value={counts.new} sub="Yangi arizalar" icon={UserPlus} />
        <KPI title="O'quvchilar" value={counts.won} sub="Sotib oldi" icon={CheckCircle2} />
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

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">So'nggi arizalar</h3>
          <button onClick={() => onJump("arizalar")} className="text-gold text-sm inline-flex items-center gap-1 hover:underline">
            Hammasini ko'rish <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <ul className="divide-y divide-border">
          {leads.slice(0, 5).map((l) => {
            const meta = STATUS_META[l.status];
            return (
              <li key={l.id} className="py-3 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gold/15 text-gold grid place-items-center font-bold">{l.name.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.phone}</div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border ${meta.color}`}>{meta.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function KPI({ title, value, sub, icon: Icon }: { title: string; value: number | string; sub: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground tracking-wider uppercase">{title}</div>
          <div className="text-3xl font-bold text-white mt-2">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{sub}</div>
        </div>
        <div className="h-10 w-10 rounded-lg bg-gold-soft text-gold grid place-items-center"><Icon className="h-5 w-5" /></div>
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
function Arizalar() {
  const { leads, updateStatus, deleteLead } = useStore();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const filtered = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (q && !`${l.name} ${l.phone}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const exportCSV = () => {
    const rows = [["Ism", "Telefon", "Remont", "Byudjet", "Kanal", "Status", "Sana"]];
    filtered.forEach((l) => rows.push([l.name, l.phone, l.wantsRenovation ? "Ha" : "Yo'q", String(l.budget ?? ""), l.channelLabel, STATUS_META[l.status].label, formatDateLong(l.createdAt)]));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "arizalar.csv";
    a.click();
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
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidirish..."
              className="bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-white">
            <option value="all">Barcha statuslar</option>
            {(Object.keys(STATUS_META) as LeadStatus[]).map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </select>
          <button onClick={exportCSV} className="bg-card border border-border hover:border-gold/50 text-white text-sm px-3 py-2 rounded-lg inline-flex items-center gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => toast.info("Landing form orqali ariza qo'shing")} className="bg-gold text-primary-foreground font-semibold text-sm px-4 py-2 rounded-lg inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Yangi ariza
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground">Sana bo'yicha</span>
        <span className="px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground">Barcha kanallar</span>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background/40 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                {["Ism", "Telefon", "Remont", "Byudjet", "Kanal", "Status", "Sana", "Keyingi qo'ng'iroq", "Amallar"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((l) => {
                const meta = STATUS_META[l.status];
                return (
                  <tr key={l.id} className="hover:bg-accent/40">
                    <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{l.name}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{l.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs border ${l.wantsRenovation ? "bg-[color:var(--status-won)]/15 text-[color:var(--status-won)] border-[color:var(--status-won)]/30" : "bg-destructive/15 text-destructive border-destructive/30"}`}>
                        {l.wantsRenovation ? "Ha" : "Yo'q"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white whitespace-nowrap">{l.budget?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs border ${l.channel === "youtube" ? "bg-[color:var(--status-meet)]/15 text-[color:var(--status-meet)] border-[color:var(--status-meet)]/30" : "bg-muted text-muted-foreground border-border"}`}>
                        {l.channelLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={l.status} onChange={(e) => updateStatus(l.id, e.target.value as LeadStatus)}
                        className={`px-2.5 py-1 rounded-full text-xs border bg-transparent ${meta.color} focus:outline-none`}>
                        {(Object.keys(STATUS_META) as LeadStatus[]).map((s) => <option key={s} value={s} className="bg-card text-white">{STATUS_META[s].label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDateShort(l.createdAt)}</td>
                    <td className="px-4 py-3 text-gold whitespace-nowrap font-medium">{formatDateLong(l.nextCall)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-white"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => { deleteLead(l.id); toast.success("O'chirildi"); }} className="p-1.5 rounded hover:bg-destructive/15 text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ----------------- KANBAN ----------------- */
function Kanban() {
  const { leads, updateStatus } = useStore();
  const cols: { id: LeadStatus; label: string; next?: LeadStatus; nextLabel?: string }[] = [
    { id: "new", label: "Yangi", next: "contacted", nextLabel: "Bog'lani" },
    { id: "contacted", label: "Bog'lanildi", next: "meeting", nextLabel: "Uchrashu" },
    { id: "meeting", label: "Uchrashuv belgilandi", next: "met", nextLabel: "Uchrashu" },
    { id: "met", label: "Uchrashuv bo'ldi", next: "won", nextLabel: "Sotildi" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-white">Kanban Board</h1>
        <p className="text-muted-foreground text-sm mt-1">Arizalarni vizual boshqarish</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cols.map((c) => {
          const items = leads.filter((l) => l.status === c.id);
          const meta = STATUS_META[c.id];
          return (
            <div key={c.id} className="bg-card border border-border rounded-2xl p-4 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                  <h3 className="text-white font-semibold text-sm">{c.label}</h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${meta.color}`}>{items.length}</span>
              </div>
              <div className="space-y-3 flex-1">
                {items.length === 0 && (
                  <div className="h-full grid place-items-center text-muted-foreground/50 text-sm border border-dashed border-border rounded-xl min-h-[120px]">
                    Bo'sh
                  </div>
                )}
                {items.map((l) => {
                  const d = new Date(l.createdAt);
                  return (
                    <div key={l.id} className="bg-background/60 border border-border rounded-xl p-3 hover:border-gold/40 transition">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-medium text-sm">{l.name}</div>
                        <div className="text-[10px] text-muted-foreground">{String(d.getDate()).padStart(2, "0")}/{String(d.getMonth() + 1).padStart(2, "0")}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{l.phone}</div>
                      <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full border ${l.wantsRenovation ? "bg-gold/10 text-gold border-gold/30" : "bg-muted text-muted-foreground border-border"}`}>
                        {l.wantsRenovation ? "Remont" : "Bonus"}
                      </span>
                      {c.next && (
                        <button onClick={() => updateStatus(l.id, c.next!)} className="mt-3 w-full inline-flex items-center justify-center gap-1 text-[11px] text-gold border border-gold/30 hover:bg-gold/10 rounded-md py-1.5">
                          <ArrowRight className="h-3 w-3" /> {c.nextLabel}
                        </button>
                      )}
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

/* ----------------- KANALLAR ----------------- */
function Kanallar() {
  const { channels, leads, addChannel, removeChannel } = useStore();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const base = typeof window !== "undefined" ? window.location.origin : "https://fovere.vercel.app";

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-white">Kanallar</h1>
          <p className="text-muted-foreground text-sm mt-1">Har bir kanal uchun noyob havola yarating</p>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="bg-gold text-primary-foreground font-semibold text-sm px-4 py-2 rounded-lg inline-flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Yangi kanal
        </button>
      </div>

      {open && (
        <div className="bg-card border border-gold/40 rounded-2xl p-4 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kanal nomi (masalan: Instagram reels)"
            className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
          <button onClick={() => { if (name) { addChannel(name); setName(""); setOpen(false); toast.success("Kanal qo'shildi"); } }} className="bg-gold text-primary-foreground font-semibold text-sm px-4 rounded-lg">Saqlash</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((c) => {
          const url = `${base}/?channel=${c.slug}`;
          const count = leads.filter((l) => l.channelLabel === c.name).length;
          return (
            <div key={c.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-[color:var(--status-won)]/20 text-[color:var(--status-won)] grid place-items-center">
                    <Check className="h-4 w-4" />
                  </div>
                  <h3 className="text-white font-semibold">{c.name}</h3>
                </div>
                <button onClick={() => removeChannel(c.id)} className="p-1.5 rounded hover:bg-destructive/15 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-muted-foreground mb-1.5">Havola:</div>
              <div className="bg-background/60 border border-border rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                <code className="text-xs text-gold truncate">{url}</code>
                <button onClick={() => { navigator.clipboard.writeText(url); toast.success("Nusxalandi"); }} className="text-muted-foreground hover:text-white shrink-0">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">Jami arizalar:</span>
                <span className="text-white font-bold">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
