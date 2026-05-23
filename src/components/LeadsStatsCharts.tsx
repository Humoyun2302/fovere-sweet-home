import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { CalendarIcon } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Lead } from "@/lib/store-types";
import {
  buildHourlyBuckets,
  buildMonthlyBuckets,
  buildWeeklyBuckets,
  countLeadsInDays,
  countLeadsOnDay,
  formatDayLabel,
  formatSelectedDayTitle,
  getLeadCountByDay,
  isToday,
  isYesterday,
  maxBucketCount,
  startOfDay,
  toDateKey,
  type ChartBucket,
  type StatsPeriod,
} from "@/lib/lead-stats";

const chartConfig = {
  count: { label: "Arizalar", color: "var(--gold)" },
};

const PERIOD_LABELS: Record<StatsPeriod, string> = {
  hourly: "Soatlik",
  weekly: "Haftalik",
  monthly: "Oylik",
};

const PERIOD_TITLES: Record<StatsPeriod, string> = {
  hourly: "Soatlik arizalar grafigi",
  weekly: "Haftalik arizalar grafigi",
  monthly: "Oylik arizalar grafigi",
};

const PERIOD_AXIS: Record<StatsPeriod, string> = {
  hourly: "Soat (0–23)",
  weekly: "Sana (so'nggi 7 kun)",
  monthly: "Sana (so'nggi 30 kun)",
};

export function LeadsStatsCharts({ leads, loading }: { leads: Lead[]; loading: boolean }) {
  const [period, setPeriod] = useState<StatsPeriod>("hourly");
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [activeBarKey, setActiveBarKey] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const leadCountByDay = useMemo(() => getLeadCountByDay(leads), [leads]);

  const todayCount = useMemo(() => countLeadsOnDay(leads, new Date()), [leads]);
  const yesterdayCount = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return countLeadsOnDay(leads, y);
  }, [leads]);
  const weekCount = useMemo(() => countLeadsInDays(leads, 7), [leads]);
  const monthCount = useMemo(() => countLeadsInDays(leads, 30), [leads]);

  const buckets = useMemo(() => {
    if (period === "hourly") return buildHourlyBuckets(leads, selectedDate);
    if (period === "weekly") return buildWeeklyBuckets(leads);
    return buildMonthlyBuckets(leads);
  }, [leads, period, selectedDate]);

  const yMax = useMemo(() => maxBucketCount(buckets), [buckets]);
  const totalInView = useMemo(() => buckets.reduce((s, b) => s + b.count, 0), [buckets]);

  const selectedDayCount = useMemo(
    () => countLeadsOnDay(leads, selectedDate),
    [leads, selectedDate],
  );

  const xInterval = period === "monthly" ? 2 : period === "weekly" ? 0 : 3;
  const xAngle = period === "monthly" ? -45 : 0;
  const chartBottom = period === "monthly" ? 28 : 8;

  const pickDay = (day: Date, closeCalendar = false) => {
    const d = startOfDay(day);
    if (d > startOfDay(new Date())) return;
    setSelectedDate(d);
    setPeriod("hourly");
    setActiveBarKey(toDateKey(d));
    if (closeCalendar) setCalendarOpen(false);
  };

  const onBarClick = (bucket: ChartBucket) => {
    if (!bucket.date) return;
    pickDay(bucket.date);
    setActiveBarKey(bucket.key);
  };

  return (
    <div className="stats-chart-card">
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold">{PERIOD_TITLES[period]}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {period === "hourly" ? (
                <>
                  <span className="text-gold font-semibold">{selectedDayCount}</span> ta ariza
                </>
              ) : (
                <>
                  Tanlangan davrda jami: <span className="text-gold font-semibold">{totalInView}</span> ta
                  <span className="hidden sm:inline text-muted-foreground/80">
                    {" "}
                    · Ustiga bosing, kun bo'yicha ko'ring
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="stats-date-picker-btn"
                  aria-label="Kalendarni ochish"
                  title="Sana tanlash"
                >
                  <span className="stats-date-picker-btn__icon" aria-hidden>
                    <CalendarIcon className="h-4 w-4" />
                  </span>
                  <span className="stats-date-picker-btn__text min-w-0">
                    <span className="block truncate text-xs font-semibold text-white sm:hidden">
                      {formatDayLabel(selectedDate)}
                    </span>
                    <span className="hidden sm:block truncate text-xs font-medium text-white/90 max-w-[200px] lg:max-w-[240px]">
                      {formatSelectedDayTitle(selectedDate)}
                    </span>
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="stats-calendar-popover w-auto p-0" align="end" sideOffset={8}>
                <div className="stats-calendar-popover__inner">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && pickDay(d, true)}
                    month={selectedDate}
                    onMonthChange={(m) => setSelectedDate(startOfDay(m))}
                    disabled={{ after: new Date() }}
                    modifiers={{
                      hasLeads: (date) => (leadCountByDay.get(toDateKey(date)) ?? 0) > 0,
                    }}
                    modifiersClassNames={{
                      hasLeads: "stats-cal-day--has-leads",
                    }}
                    className="stats-calendar p-3"
                    classNames={{
                      today: "stats-cal-today",
                      selected: "stats-cal-selected",
                    }}
                  />
                  <p className="stats-calendar-hint border-t border-border/50">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold mr-1 align-middle" />
                    Ariza bo'lgan kunlar
                  </p>
                </div>
              </PopoverContent>
            </Popover>

            {(Object.keys(PERIOD_LABELS) as StatsPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`stats-period-btn ${period === p ? "stats-period-btn--active" : ""}`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatChip
          label="Bugun"
          value={todayCount}
          highlight={period === "hourly" && isToday(selectedDate)}
          onClick={() => pickDay(new Date())}
        />
        <StatChip
          label="Kecha"
          value={yesterdayCount}
          highlight={period === "hourly" && isYesterday(selectedDate)}
          onClick={() => {
            const y = new Date();
            y.setDate(y.getDate() - 1);
            pickDay(y);
          }}
        />
        <StatChip
          label="7 kun"
          value={weekCount}
          highlight={period === "weekly"}
          onClick={() => setPeriod("weekly")}
        />
        <StatChip
          label="30 kun"
          value={monthCount}
          highlight={period === "monthly"}
          onClick={() => setPeriod("monthly")}
        />
      </div>

      <div className="min-w-0">
        {loading && leads.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-16">Yuklanmoqda...</div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="stats-chart-area h-[260px] w-full aspect-auto">
              <BarChart
                data={buckets}
                margin={{ top: 12, right: 12, left: 4, bottom: chartBottom }}
                onMouseLeave={() => setActiveBarKey(null)}
              >
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="oklch(0.35 0.03 255 / 0.5)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "oklch(0.72 0.02 255)", fontSize: 10 }}
                  interval={xInterval}
                  angle={xAngle}
                  textAnchor={xAngle ? "end" : "middle"}
                  height={xAngle ? 48 : 30}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, yMax]}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tick={{ fill: "oklch(0.72 0.02 255)", fontSize: 11 }}
                />
                <ChartTooltip
                  cursor={{ fill: "oklch(0.76 0.11 78 / 0.08)" }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        const row = payload?.[0]?.payload as ChartBucket | undefined;
                        return row?.tooltip ?? "";
                      }}
                      formatter={(value) => [`${value} ta`, "Arizalar"]}
                    />
                  }
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={period === "monthly" ? 12 : period === "weekly" ? 36 : 28}
                  cursor="pointer"
                  onClick={(bar) => {
                    const row = (bar as { payload?: ChartBucket }).payload;
                    if (row?.date) onBarClick(row);
                  }}
                >
                  {buckets.map((b) => (
                    <Cell
                      key={b.key}
                      fill="var(--color-count)"
                      opacity={activeBarKey && activeBarKey !== b.key ? 0.45 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <p className="text-center text-xs text-muted-foreground mt-3">{PERIOD_AXIS[period]}</p>
          </>
        )}
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  highlight,
  onClick,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`stats-chip text-left w-full transition hover:border-gold/40 ${highlight ? "stats-chip--active" : ""}`}
    >
      <div className="stats-chip__label">{label}</div>
      <div className="stats-chip__value">{value}</div>
    </button>
  );
}
