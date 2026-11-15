import Image from "next/image";

type PhotoProps = {
  src: string;
  alt: string;
  credit?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  overlay?: boolean;
  caption?: string;
};

/**
 * Editorial photo frame. Images are served straight from Pexels' CDN
 * (unoptimized) so they work in any environment without a remote image loader.
 */
export default function Photo({
  src,
  alt,
  credit,
  className = "",
  imgClassName = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  overlay = true,
  caption,
}: PhotoProps) {
  return (
    <figure className={`group relative overflow-hidden rounded-[22px] border hairline bg-surface ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        sizes={sizes}
        className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${imgClassName}`}
      />
      {overlay && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
        />
      )}
      {caption && (
        <figcaption className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <span className="rounded-full border border-white/25 bg-black/30 px-3 py-1 text-[12px] font-medium backdrop-blur">
            {caption}
          </span>
          {credit && <span className="text-[10px] uppercase tracking-widest text-white/70">{credit}</span>}
        </figcaption>
      )}
      {!caption && credit && (
        <figcaption className="pointer-events-none absolute bottom-3 right-4 text-[10px] uppercase tracking-widest text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
          {credit}
        </figcaption>
      )}
    </figure>
  );
}
