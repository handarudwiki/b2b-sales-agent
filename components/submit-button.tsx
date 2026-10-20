"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { PiCircleNotch } from "react-icons/pi";
import { buttonClass, cn, type ButtonSize, type ButtonVariant } from "./ui";
import { useTopLoaderWhile } from "./top-loader";

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  size = "md",
  icon,
  className,
  disabled,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  children: ReactNode;
  pendingText?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}) {
  const { pending } = useFormStatus();
  useTopLoaderWhile(pending);

  return (
    <button
      {...props}
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={cn(buttonClass(variant, size), className)}
    >
      {pending ? <PiCircleNotch className="animate-spin" /> : icon}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
