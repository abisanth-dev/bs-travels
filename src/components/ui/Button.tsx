import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-medium transition-[background,color,border-color,transform] duration-300 ease-out-soft active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
const variants: Record<Variant, string> = {
  primary: "bg-gold text-night hover:bg-[#efc480]",
  secondary: "border border-line-strong text-ivory hover:border-ivory hover:bg-ivory/5",
  ghost: "px-0 text-ivory underline-offset-8 hover:text-gold hover:underline",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

type LinkButtonProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  icon?: IconName;
  className?: string;
  children: ReactNode;
};

export function LinkButton({ variant = "primary", icon, className = "", children, ...rest }: LinkButtonProps) {
  return (
    <Link className={buttonClass(variant, className)} {...rest}>
      {children}
      {icon ? <Icon name={icon} size={18} /> : null}
    </Link>
  );
}

/** For tel:, mailto: and external links, which should not use next/link. */
export function AnchorButton({
  variant = "primary",
  icon,
  className = "",
  children,
  ...rest
}: ComponentProps<"a"> & { variant?: Variant; icon?: IconName }) {
  return (
    <a className={buttonClass(variant, className)} {...rest}>
      {icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </a>
  );
}
