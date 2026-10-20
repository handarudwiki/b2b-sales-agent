import type { ReactNode } from "react";
import { PiCheckBold } from "react-icons/pi";
import { cn } from "./cn";

export type SeriesItem = {
  key: string;
  label: string;
  value: number;
  color: string;
};

function pct(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 1000) / 10 : 0;
}

export function SegmentBarcode({
  items,
  total,
  unit = "prospek",
}: {
  items: SeriesItem[];
  total: number;
  unit?: string;
}) {
  const shown = items.filter((i) => i.value > 0);

  return (
    <figure>
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 -bottom-5 h-10 opacity-35 blur-2xl"
          style={{
            background: `linear-gradient(90deg, ${shown.map((s) => s.color).join(", ")}${shown.length === 1 ? `, ${shown[0].color}` : ""})`,
          }}
        />
        <div className="relative flex w-full gap-2">
          {shown.map((item) => (
            <div
              key={item.key}
              tabIndex={0}
              role="group"
              aria-label={`${item.label}: ${item.value} ${unit} (${pct(item.value, total)}%)`}
              className="@container group relative min-w-0 rounded-md outline-none focus-visible:ring-4 focus-visible:ring-lime/60"
              style={{ flexGrow: item.value, flexBasis: 0 }}
            >
              <div className="mb-3 h-[42px] min-w-0">
                <p className="hidden whitespace-nowrap text-[12px] text-ink-2 @min-[190px]:block">{item.label}</p>
                <p className="hidden whitespace-nowrap text-[19px] font-semibold tracking-[-0.02em] text-ink @min-[64px]:block">
                  {item.value}
                  <span className="ml-1 hidden text-[12px] font-medium text-muted @min-[120px]:inline">
                    · {pct(item.value, total)}%
                  </span>
                </p>
              </div>
              <div
                className="relative h-14 overflow-hidden rounded-[4px] transition-transform duration-300 group-hover:-translate-y-0.5"
                style={{ ["--bar-color" as string]: item.color }}
              >
                <span className="absolute inset-y-0 left-0 w-[2px]" style={{ backgroundColor: item.color }} />
                <span className="barcode absolute inset-0 origin-left animate-grow-x opacity-90" />
              </div>
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-[calc(100%-36px)] left-0 z-10 hidden whitespace-nowrap rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-pop group-hover:block group-focus-visible:block"
              >
                <span className="font-semibold">
                  {item.value} {unit} · {pct(item.value, total)}%
                </span>
                <span className="mt-0.5 block text-white/70">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <figcaption className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
        {shown.map((item) => (
          <span key={item.key} className="inline-flex items-center gap-2 text-[12px] text-ink-2">
            <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: item.color }} />
            {item.label}
            <span className="font-semibold text-ink tabular-nums">{item.value}</span>
          </span>
        ))}
      </figcaption>

      <table className="sr-only">
        <caption>Distribusi {unit} per segmen</caption>
        <tbody>
          {shown.map((item) => (
            <tr key={item.key}>
              <th scope="row">{item.label}</th>
              <td>{item.value}</td>
              <td>{pct(item.value, total)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

const FUNNEL_RAMP = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab"];

export function FunnelChart({
  stages,
}: {
  stages: { label: string; value: number; hint?: string }[];
}) {
  const base = stages[0]?.value ?? 0;

  return (
    <ol className="space-y-4">
      {stages.map((stage, i) => {
        const width = base > 0 ? (stage.value / base) * 100 : 0;
        const prev = i > 0 ? stages[i - 1].value : null;
        const conversion = prev != null ? pct(stage.value, prev) : null;
        const color = FUNNEL_RAMP[Math.min(i, FUNNEL_RAMP.length - 1)];
        return (
          <li
            key={stage.label}
            tabIndex={0}
            className="group grid grid-cols-[minmax(0,148px)_minmax(0,1fr)_64px] items-center gap-4 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-lime/60"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-ink">{stage.label}</p>
              <p className="mt-0.5 truncate text-[11.5px] text-muted">
                {conversion == null ? stage.hint ?? "Basis funnel" : `${conversion}% dari tahap sebelumnya`}
              </p>
            </div>
            <div className="relative h-6">
              <div className="absolute inset-y-0 left-0 w-px bg-line-strong" />
              <div
                className="relative h-full origin-left animate-grow-x rounded-r-[4px] transition-[filter] group-hover:brightness-110"
                style={{
                  width: `${Math.max(width, stage.value > 0 ? 2 : 0.6)}%`,
                  backgroundColor: color,
                  animationDelay: `${i * 90}ms`,
                }}
              />
            </div>
            <p className="text-right text-[17px] font-semibold tracking-[-0.02em] text-ink tabular-nums">
              {stage.value}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export function HBarList({
  rows,
  color = "#2a78d6",
}: {
  rows: { key: string; label: ReactNode; value: number }[];
  color?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3.5">
      {rows.map((row) => (
        <li key={row.key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_32px] items-center gap-3">
          <div className="min-w-0">{row.label}</div>
          <div className="h-3">
            <div
              className="h-full origin-left animate-grow-x rounded-r-[4px]"
              style={{ width: `${(row.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
          <p className="text-right text-[14px] font-semibold text-ink tabular-nums">{row.value}</p>
        </li>
      ))}
    </ul>
  );
}

export function ScoreRing({
  value,
  color,
  size = 128,
  stroke = 11,
  children,
  className,
}: {
  value: number | null | undefined;
  color: string;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = Math.max(0, Math.min(100, value ?? 0)) / 100;
  const offset = circumference * (1 - ratio);

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          style={{ stroke: `color-mix(in oklab, ${color} 16%, white)` }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="animate-ring"
          style={{ ["--ring-from" as string]: `${circumference}` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Stepper({
  steps,
  current,
  muted = false,
}: {
  steps: { key: string; label: string }[];
  current: number;
  muted?: boolean;
}) {
  return (
    <ol className="relative space-y-0">
      {steps.map((step, i) => {
        const done = !muted && i < current;
        const active = !muted && i === current;
        return (
          <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[11px] top-6 h-[calc(100%-16px)] w-[2px] rounded-full",
                  done ? "bg-ink" : "bg-line",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-[1] mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 text-[10px] font-bold",
                done && "border-ink bg-ink text-lime",
                active && "border-ink bg-lime text-ink shadow-[0_0_0_4px_rgb(212_246_90/0.45)]",
                !done && !active && "border-line-strong bg-surface text-muted",
              )}
            >
              {done ? <PiCheckBold className="size-3" /> : i + 1}
            </span>
            <span
              className={cn(
                "pt-0.5 text-[13px]",
                active ? "font-semibold text-ink" : done ? "text-ink" : "text-muted",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
