import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
};

/**
 * 12-column editorial heading: eyebrow + headline on the left,
 * supporting copy or an action on the right.
 */
export default function SectionHeading({ eyebrow, title, description, aside, className = "" }: SectionHeadingProps) {
  return (
    <div className={`grid items-end gap-8 md:grid-cols-12 md:gap-10 ${className}`}>
      <div className="reveal-left md:col-span-7">
        <p className="eyebrow eyebrow-dot mb-5">{eyebrow}</p>
        <h2 className="display-h2 text-balance">{title}</h2>
      </div>
      {(description || aside) && (
        <div className="reveal-right flex flex-col gap-5 md:col-span-5 md:items-start">
          {description && <p className="text-pretty text-muted">{description}</p>}
          {aside}
        </div>
      )}
    </div>
  );
}
