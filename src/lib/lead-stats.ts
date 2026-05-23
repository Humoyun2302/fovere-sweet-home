import type { Lead } from "./store-types";

export type StatsPeriod = "hourly" | "weekly" | "monthly";

export type ChartBucket = {
  key: string;
  label: string;
  count: number;
  tooltip: string;
  date?: Date;
};

function parseLeadDate(iso: string): Date | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const UZ_WEEKDAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const UZ_WEEKDAYS_SHORT = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];
const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
];

export function formatDayLabel(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
}

export function formatDayLabelFull(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function formatSelectedDayTitle(d: Date) {
  const day = d.getDate();
  const month = UZ_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const weekday = UZ_WEEKDAYS[d.getDay()];
  return `${day} ${month} ${year}, ${weekday}`;
}

export function getLeadCountByDay(leads: Lead[]) {
  const map = new Map<string, number>();
  for (const l of leads) {
    const d = parseLeadDate(l.createdAt);
    if (!d) continue;
    const key = toDateKey(d);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export function countLeadsOnDay(leads: Lead[], day: Date) {
  const target = startOfDay(day);
  let n = 0;
  for (const l of leads) {
    const d = parseLeadDate(l.createdAt);
    if (d && isSameDay(d, target)) n++;
  }
  return n;
}

export function countLeadsInDays(leads: Lead[], days: number) {
  const end = new Date();
  const start = startOfDay(end);
  start.setDate(start.getDate() - (days - 1));
  let n = 0;
  for (const l of leads) {
    const d = parseLeadDate(l.createdAt);
    if (d && d >= start && d <= end) n++;
  }
  return n;
}

export function buildHourlyBuckets(leads: Lead[], day: Date): ChartBucket[] {
  const anchor = startOfDay(day);
  const dateLabel = formatDayLabelFull(anchor);

  const buckets = Array.from({ length: 24 }, (_, hour) => ({
    key: `${toDateKey(anchor)}-${hour}`,
    label: String(hour),
    count: 0,
    tooltip: `${dateLabel}, ${String(hour).padStart(2, "0")}:00`,
    date: anchor,
  }));

  for (const l of leads) {
    const d = parseLeadDate(l.createdAt);
    if (!d || !isSameDay(d, anchor)) continue;
    buckets[d.getHours()].count++;
  }

  return buckets;
}

export function buildWeeklyBuckets(leads: Lead[]): ChartBucket[] {
  const today = startOfDay(new Date());
  const buckets: ChartBucket[] = [];

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const end = new Date(day);
    end.setDate(end.getDate() + 1);

    let count = 0;
    for (const l of leads) {
      const d = parseLeadDate(l.createdAt);
      if (d && d >= day && d < end) count++;
    }

    const label = formatDayLabel(day);
    buckets.push({
      key: toDateKey(day),
      label,
      count,
      date: day,
      tooltip: `${UZ_WEEKDAYS[day.getDay()]}, ${formatDayLabelFull(day)}`,
    });
  }

  return buckets;
}

export function buildMonthlyBuckets(leads: Lead[]): ChartBucket[] {
  const today = startOfDay(new Date());
  const buckets: ChartBucket[] = [];

  for (let i = 29; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const end = new Date(day);
    end.setDate(end.getDate() + 1);

    let count = 0;
    for (const l of leads) {
      const d = parseLeadDate(l.createdAt);
      if (d && d >= day && d < end) count++;
    }

    buckets.push({
      key: toDateKey(day),
      label: formatDayLabel(day),
      count,
      date: day,
      tooltip: `${UZ_WEEKDAYS_SHORT[day.getDay()]}, ${formatDayLabelFull(day)}`,
    });
  }

  return buckets;
}

export function maxBucketCount(buckets: ChartBucket[]) {
  const max = Math.max(0, ...buckets.map((b) => b.count));
  if (max <= 4) return Math.max(4, max);
  const step = max <= 10 ? 2 : max <= 50 ? 5 : 10;
  return Math.ceil(max / step) * step;
}

export function isToday(d: Date) {
  return isSameDay(d, new Date());
}

export function isYesterday(d: Date) {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return isSameDay(d, y);
}
