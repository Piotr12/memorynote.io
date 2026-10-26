import type { ReactNode } from "react";

type CardProps = {
  title: string;
  meta: string;
  body: string;
  foot: ReactNode;
};

export function Card({ title, meta, body, foot }: CardProps) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <div className="sub">{meta}</div>
      <p>{body}</p>
      <div className="foot">{foot}</div>
    </div>
  );
}
