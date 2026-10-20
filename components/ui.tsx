import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 bg-transparent px-8 pb-2 pt-8">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && <p className="mt-1 max-w-2xl text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 shadow-[0_1px_3px_rgba(30,45,80,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  className = "bg-slate-100 text-slate-700",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-[10px] text-muted">{label}</p>
      <p className="mt-2 text-[25px] font-bold tracking-tight text-foreground">{value}</p>
      {hint && <p className="mt-1 text-[10px] text-muted">{hint}</p>}
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function buttonClass(
  variant: "primary" | "secondary" | "ghost" | "danger" = "primary",
) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-purple-800",
    secondary: "border border-border bg-card text-foreground hover:bg-slate-50",
    ghost: "text-foreground hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return `${base} ${variants[variant]}`;
}

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <Link href={href} className={buttonClass(variant)}>
      {children}
    </Link>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary";

export const labelClass = "block text-sm font-medium text-foreground mb-1";
