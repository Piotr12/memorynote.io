import type { HTMLAttributes } from "react";

// The text roles of the type scale. The class is the token surface; the
// sizes live in globals.css.
export type TextRole = "display" | "heading" | "body" | "small" | "caption";

const roleClass: Record<TextRole, string> = {
  display: "s-d",
  heading: "s-h",
  body: "s-b",
  small: "s-s",
  caption: "s-c",
};

type TextProps = HTMLAttributes<HTMLElement> & {
  role: TextRole;
};

export function Text({ role, ...props }: TextProps) {
  return <p className={roleClass[role]} {...props} />;
}
