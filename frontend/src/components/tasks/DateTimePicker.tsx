"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  // ISO datetime string, or "" when nothing is chosen yet
  value: string;
  onChange: (isoValue: string) => void;
  disabled?: boolean;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0..59
const PERIODS = ["AM", "PM"] as const;

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// "2026-08-20" for the typeable date field
const toDateInput = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const formatTimeLabel = (d: Date) => {
  let h = d.getHours();
  const m = d.getMinutes();
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${period}`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const DateTimePicker = ({ value, onChange, disabled }: DateTimePickerProps) => {
  const selected = value ? new Date(value) : null;

  // the month shown in the calendar grid, and whether we're picking a year
  const [viewMonth, setViewMonth] = useState(() => selected ?? new Date());
  const [pickingYear, setPickingYear] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  // local text for the typeable date field, so partial edits don't reset the value.
  // when `value` changes from the outside (edit dialog, calendar pick) we resync
  // the text during render — the recommended alternative to a setState-in-effect.
  const [dateText, setDateText] = useState(selected ? toDateInput(selected) : "");
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDateText(selected ? toDateInput(selected) : "");
  }

  const today = startOfToday();

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));

  // 12-year window around the shown year for the year grid
  const yearWindowStart = year - (year % 12);
  const yearCells = Array.from({ length: 12 }, (_, i) => yearWindowStart + i);

  const commitDate = (day: Date) => {
    // keep the previously chosen time, default to 09:00 for a fresh pick
    const next = new Date(day);
    if (selected) {
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    } else {
      next.setHours(9, 0, 0, 0);
    }
    onChange(next.toISOString());
  };

  const pickDay = (day: Date) => {
    commitDate(day);
    setDateOpen(false);
  };

  // parse the typeable "YYYY-MM-DD" field; only commit when it's a real date
  const commitDateText = (text: string) => {
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text.trim());
    if (!match) return;
    const [, y, m, d] = match;
    const parsed = new Date(Number(y), Number(m) - 1, Number(d));
    if (
      parsed.getFullYear() !== Number(y) ||
      parsed.getMonth() !== Number(m) - 1 ||
      parsed.getDate() !== Number(d)
    ) {
      return; // e.g. 2026-02-31 rolled over — reject
    }
    if (parsed < today) return; // no past dates
    setViewMonth(parsed);
    commitDate(parsed);
  };

  // change one field of the time (hour / minute / period), keeping the rest.
  // hours come in as 12-hour values (1..12); we recombine with the period.
  const setTimePart = (part: "hour" | "minute" | "period", val: number | string) => {
    const base = selected ? new Date(selected) : new Date();
    if (!selected) base.setHours(9, 0, 0, 0);

    const h24 = base.getHours();
    let period = h24 >= 12 ? "PM" : "AM";
    let hour12 = h24 % 12 || 12;
    let minute = base.getMinutes();

    if (part === "hour") hour12 = val as number;
    if (part === "minute") minute = val as number;
    if (part === "period") period = val as string;

    const finalHour = period === "PM" ? (hour12 % 12) + 12 : hour12 % 12;

    const next = new Date(base);
    next.setHours(finalHour, minute, 0, 0);
    onChange(next.toISOString());
  };

  const selHour12 = selected ? selected.getHours() % 12 || 12 : null;
  const selMinute = selected ? selected.getMinutes() : null;
  const selPeriod = selected ? (selected.getHours() >= 12 ? "PM" : "AM") : null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* ---------- DATE: typeable field + icon-only popover trigger ---------- */}
      <div className="flex h-11 items-center gap-1 rounded-lg border-[1.5px] border-input bg-card px-1 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25">
        <Popover
          open={dateOpen}
          onOpenChange={(o) => {
            setDateOpen(o);
            if (o) setPickingYear(false);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              aria-label="Open calendar"
              className="h-8 w-8 shrink-0 text-muted-foreground"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent inline align="start" className="w-auto">
            <div className="w-[260px]">
              {/* header: month/year label toggles the year picker */}
              <div className="mb-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label={pickingYear ? "Previous years" : "Previous month"}
                  onClick={() =>
                    pickingYear
                      ? setViewMonth(new Date(year - 12, month, 1))
                      : setViewMonth(new Date(year, month - 1, 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={() => setPickingYear((p) => !p)}
                  className="rounded-md px-2 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  {pickingYear
                    ? `${yearWindowStart} – ${yearWindowStart + 11}`
                    : `${MONTHS[month]} ${year}`}
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label={pickingYear ? "Next years" : "Next month"}
                  onClick={() =>
                    pickingYear
                      ? setViewMonth(new Date(year + 12, month, 1))
                      : setViewMonth(new Date(year, month + 1, 1))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {pickingYear ? (
                // ---- year grid ----
                <div className="grid grid-cols-3 gap-1">
                  {yearCells.map((y) => {
                    const isCurrent = y === year;
                    const isPastYear = y < today.getFullYear();
                    return (
                      <button
                        key={y}
                        type="button"
                        disabled={isPastYear}
                        onClick={() => {
                          setViewMonth(new Date(y, month, 1));
                          setPickingYear(false);
                        }}
                        className={cn(
                          "rounded-md py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                          isCurrent && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                          isPastYear && "text-muted-foreground/40 cursor-not-allowed hover:bg-transparent",
                        )}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              ) : (
                // ---- month day grid ----
                <>
                  <div className="mb-1 grid grid-cols-7 text-center text-xs text-muted-foreground">
                    {WEEKDAYS.map((d) => (
                      <div key={d} className="py-1">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {cells.map((day, i) => {
                      if (!day) return <div key={`pad-${i}`} />;
                      const isPast = day < today;
                      const isSelected = selected ? isSameDay(day, selected) : false;
                      const isToday = isSameDay(day, today);
                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          disabled={isPast}
                          onClick={() => pickDay(day)}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isSelected &&
                              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                            !isSelected && isToday && "border border-primary/50",
                            isPast && "text-muted-foreground/40 line-through hover:bg-transparent cursor-not-allowed",
                          )}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Input
          value={dateText}
          onChange={(e) => setDateText(e.target.value)}
          onBlur={() => commitDateText(dateText)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitDateText(dateText);
            }
          }}
          disabled={disabled}
          placeholder="YYYY-MM-DD"
          aria-label="Due date"
          className="h-8 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
        />
      </div>

      {/* ---------- TIME: read-only field + icon-only stepper popover ---------- */}
      <div className="flex h-11 items-center gap-1 rounded-lg border-[1.5px] border-input bg-card px-1 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25">
        <Popover open={timeOpen} onOpenChange={setTimeOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              aria-label="Open time picker"
              className="h-8 w-8 shrink-0 text-muted-foreground"
            >
              <Clock className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent inline align="start" className="w-auto">
            <div className="flex gap-2">
              <TimeColumn
                label="Hour"
                items={HOURS}
                selected={selHour12}
                render={(h) => String(h)}
                onPick={(h) => setTimePart("hour", h)}
              />
              <TimeColumn
                label="Min"
                items={MINUTES}
                selected={selMinute}
                render={(m) => String(m).padStart(2, "0")}
                onPick={(m) => setTimePart("minute", m)}
              />
              <div className="flex flex-col gap-0.5">
                <div className="px-2 pb-1 text-center text-xs text-muted-foreground">
                  {" "}
                </div>
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTimePart("period", p)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      selPeriod === p &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div
          className={cn(
            "flex-1 px-1 text-sm",
            !selected && "text-muted-foreground",
          )}
        >
          {selected ? formatTimeLabel(selected) : "Pick a time"}
        </div>
      </div>
    </div>
  );
};

// a scrollable column of numeric options (hours / minutes) that keeps the
// selected value in view when the popover opens
interface TimeColumnProps<T extends number> {
  label: string;
  items: readonly T[];
  selected: T | null;
  render: (v: T) => string;
  onPick: (v: T) => void;
}

function TimeColumn<T extends number>({
  label,
  items,
  selected,
  render,
  onPick,
}: TimeColumnProps<T>) {
  const activeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "center" });
  }, [selected]);

  return (
    <div className="flex flex-col gap-0.5">
      <div className="px-2 pb-1 text-center text-xs text-muted-foreground">
        {label}
      </div>
      <div className="scrollbar-thin grid max-h-50 w-13 gap-0.5 overflow-y-auto pr-1">
        {items.map((v) => {
          const isSelected = selected === v;
          return (
            <button
              key={v}
              type="button"
              ref={isSelected ? activeRef : undefined}
              onClick={() => onPick(v)}
              className={cn(
                "rounded-md px-2 py-1.5 text-center text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              {render(v)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DateTimePicker;
