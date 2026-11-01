import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "secondary", ...props }: ButtonProps) {
  const classes =
    variant === "primary" ? "btn btn-primary" : "btn btn-secondary";
  return <button type="button" className={classes} {...props} />;
}
