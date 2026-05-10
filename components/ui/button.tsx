import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/20 disabled:pointer-events-none disabled:opacity-50";
  const styles: Record<ButtonVariant, string> = {
    primary: "bg-black px-3.5 py-2 text-[13px] text-white hover:bg-neutral-800 sm:px-4 sm:text-sm",
    ghost:
      "px-2.5 py-1.5 text-[13px] text-neutral-600 hover:bg-neutral-100 hover:text-black sm:px-3 sm:py-2 sm:text-sm",
  };

  return (
    <button
      type={type}
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
