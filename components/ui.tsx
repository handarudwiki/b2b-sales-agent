import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  PiArrowLeft,
  PiArrowUpRight,
  PiCheckCircle,
  PiInfo,
  PiWarning,
  PiWarningOctagon,
} from "react-icons/pi";
import { cn } from "./cn";
import { initials, tint } from "./tokens";

export { cn };

export type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "ghost"
  | "danger"
  | "danger-soft";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
) {
  const base =
    "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium outline-none transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:ring-4 focus-visible:ring-lime/70 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0";
  const sizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3.5 text-xs [&_svg]:size-3.5",
    md: "h-10 px-[18px] text-[13px] [&_svg]:size-4",
    lg: "h-12 px-6 text-sm [&_svg]:size-[18px]",
    icon: "size-10 [&_svg]:size-[18px]",
    "icon-sm": "size-8 [&_svg]:size-4",
  };
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-ink text-white shadow-[0_1px_2px_rgb(0_0_0/0.25),inset_0_1px_0_rgb(255_255_255/0.08)] hover:bg-[#262a27]",
    accent:
      "bg-lime text-ink shadow-[inset_0_-1px_0_rgb(0_0_0/0.08)] hover:bg-lime-strong",
    secondary:
      "border border-line bg-surface text-ink shadow-[0_1px_1px_rgb(15_17_16/0.04)] hover:border-line-strong hover:bg-surface-2",
    ghost: "text-ink-2 hover:bg-ink/[0.05] hover:text-ink",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    "danger-soft": "text-rose-600 hover:bg-rose-50",
  };
  return cn(base, sizes[size], variants[variant]);
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconType;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(buttonClass(variant, size), className)}>
      {Icon && <Icon />}
      {children}
    </Link>
  );
}

export function ArrowLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="grid size-10 shrink-0 place-items-center rounded-full bg-lime text-ink outline-none transition duration-300 hover:rotate-45 hover:bg-lime-strong focus-visible:ring-4 focus-visible:ring-lime/70"
    >
      <PiArrowUpRight className="size-[18px]" />
    </Link>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
  back,
  meta,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  back?: { href: string; label: string };
  meta?: ReactNode;
}) {
  return (
    <header className="animate-fade-up pb-6 pt-7 sm:pt-9">
      {back && <BackLink href={back.href} label={back.label} className="mb-5" />}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[34px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-2">
              {subtitle}
            </p>
          )}
          {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
      </div>
    </header>
  );
}

export function BackLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 text-[13px] font-medium text-ink-2 transition-colors hover:text-ink",
        className,
      )}
    >
      <span className="grid size-8 place-items-center rounded-full border border-line bg-surface shadow-[0_1px_1px_rgb(15_17_16/0.04)] transition-transform group-hover:-translate-x-0.5">
        <PiArrowLeft className="size-4" />
      </span>
      {label}
    </Link>
  );
}

export function Card({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        "rounded-[26px] border border-line/80 bg-surface p-5 shadow-card sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: IconType;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && <IconBox icon={icon} />}
        <div className="min-w-0 pt-0.5">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
          {description && (
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

type Tone = "neutral" | "lime" | "blue" | "green" | "amber" | "rose" | "violet" | "ink";

const toneBox: Record<Tone, string> = {
  neutral: "border border-line bg-surface-2 text-ink",
  lime: "bg-lime text-ink",
  blue: "bg-sky-100 text-sky-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  violet: "bg-violet-100 text-violet-700",
  ink: "bg-ink text-lime",
};

export function IconBox({
  icon: Icon,
  tone = "neutral",
  size = "md",
  className,
}: {
  icon: IconType;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "size-8 rounded-xl [&_svg]:size-4",
    md: "size-10 rounded-2xl [&_svg]:size-[18px]",
    lg: "size-12 rounded-2xl [&_svg]:size-[22px]",
  };
  return (
    <span className={cn("grid shrink-0 place-items-center", sizes[size], toneBox[tone], className)}>
      <Icon />
    </span>
  );
}

export function Badge({
  children,
  className,
  dot = false,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  className?: string;
  dot?: boolean;
  icon?: IconType;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ink/[0.05] px-2.5 py-[5px] text-[11.5px] font-medium leading-none text-ink-2 ring-1 ring-inset ring-current/10",
        className,
      )}
    >
      {dot && <span className="size-1.5 shrink-0 rounded-full bg-current" />}
      {Icon && <Icon className="size-3.5 shrink-0" />}
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: IconType;
  tone?: Tone;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] font-medium text-ink-2">{label}</p>
        {icon && <IconBox icon={icon} tone={tone} size="sm" />}
      </div>
      <div>
        <p className="text-[32px] font-semibold leading-none tracking-[-0.03em] text-ink">{value}</p>
        {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
      </div>
    </Card>
  );
}

export function Avatar({
  name,
  color = "#898781",
  size = "md",
  icon: Icon,
  className,
}: {
  name: string | null | undefined;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg";
  icon?: IconType;
  className?: string;
}) {
  const sizes = {
    xs: "size-6 text-[9.5px] [&_svg]:size-3",
    sm: "size-8 text-[11px] [&_svg]:size-4",
    md: "size-10 text-[13px] [&_svg]:size-[18px]",
    lg: "size-14 text-lg [&_svg]:size-6",
  };
  return (
    <span
      aria-hidden
      style={tint(color, 18)}
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold tracking-tight",
        sizes[size],
        className,
      )}
    >
      {Icon ? <Icon /> : initials(name)}
    </span>
  );
}

export function Meter({
  value,
  max = 100,
  color = "#2a78d6",
  className,
  label,
}: {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  label?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full", className)}
      style={{ backgroundColor: `color-mix(in oklab, ${color} 16%, white)` }}
    >
      <div
        className="h-full origin-left animate-grow-x rounded-full"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: IconType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[26px] border border-dashed border-line-strong bg-surface/60 px-6 py-14 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="mb-4 grid size-14 place-items-center rounded-2xl border border-line bg-surface text-ink shadow-card [&_svg]:size-6">
          <Icon />
        </span>
      )}
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

const alertStyles = {
  info: { className: "border-sky-200 bg-sky-50 text-sky-900", icon: PiInfo, iconClass: "text-sky-600" },
  success: { className: "border-emerald-200 bg-emerald-50 text-emerald-900", icon: PiCheckCircle, iconClass: "text-emerald-600" },
  warning: { className: "border-amber-200 bg-amber-50 text-amber-900", icon: PiWarning, iconClass: "text-amber-600" },
  danger: { className: "border-rose-200 bg-rose-50 text-rose-900", icon: PiWarningOctagon, iconClass: "text-rose-600" },
  neutral: { className: "border-line bg-surface-2 text-ink-2", icon: PiInfo, iconClass: "text-ink" },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
  icon,
}: {
  tone?: keyof typeof alertStyles;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  icon?: IconType;
}) {
  const s = alertStyles[tone];
  const Icon = icon ?? s.icon;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-2xl border px-4 py-3 text-[13px] leading-relaxed", s.className, className)}
    >
      <Icon className={cn("mt-0.5 size-[18px] shrink-0", s.iconClass)} />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5 opacity-90" : undefined}>{children}</div>}
      </div>
    </div>
  );
}

export function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: IconType;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-2 ring-1 ring-line [&_svg]:size-4">
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[11.5px] font-medium text-muted">{label}</dt>
        <dd className="mt-0.5 break-words text-[13px] text-ink">{children}</dd>
      </div>
    </div>
  );
}

const fieldBase =
  "w-full rounded-2xl border border-line bg-surface text-[13.5px] text-ink shadow-[0_1px_1px_rgb(15_17_16/0.03)] outline-none transition-[border-color,box-shadow] placeholder:text-muted/80 hover:border-line-strong focus:border-ink/60 focus:ring-4 focus:ring-lime/45 disabled:opacity-60";

export const inputClass = cn(fieldBase, "h-11 px-4");

export const textareaClass = cn(fieldBase, "px-4 py-3 leading-relaxed");

export const selectClass = cn(
  fieldBase,
  "h-11 cursor-pointer appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 256 256'%3E%3Cpath fill='%2381867e' d='M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z'/%3E%3C/svg%3E\")] bg-[length:16px_16px] bg-[position:right_14px_center] bg-no-repeat pl-4 pr-10",
);

export const labelClass = "mb-1.5 block text-[12.5px] font-medium text-ink-2";

export const checkboxClass =
  "size-[18px] shrink-0 cursor-pointer rounded-md border-line-strong accent-ink";

export function Field({
  label,
  hint,
  icon: Icon,
  children,
  className,
  htmlFor,
}: {
  label: string;
  hint?: ReactNode;
  icon?: IconType;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={cn(labelClass, "flex items-center gap-1.5")}>
        {Icon && <Icon className="size-3.5 text-muted" />}
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11.5px] text-muted">{hint}</p>}
    </div>
  );
}
