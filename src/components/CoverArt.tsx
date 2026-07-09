type CoverArtProps = {
  src: string | null;
  alt: string;
  className?: string;
};

export function CoverArt({ src, alt, className = '' }: CoverArtProps) {
  if (!src) {
    return (
      <div className={`cover-fallback ${className}`} aria-label={alt}>
        <span />
      </div>
    );
  }

  return <img className={className} src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" />;
}
