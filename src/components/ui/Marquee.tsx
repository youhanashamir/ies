type MarqueeProps = {
  items: string[];
  className?: string;
};

export default function Marquee({ items, className = "" }: MarqueeProps) {
  const doubled = [...items, ...items];
  return (
    <div className={`mask-fade-x overflow-hidden ${className}`} aria-hidden="true">
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-10">
            <span className="font-display text-xl font-semibold tracking-tight text-ink md:text-2xl">{item}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}
