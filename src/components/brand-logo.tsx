import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
  priority?: boolean;
  className?: string;
};

export function BrandLogo({
  compact = false,
  priority = false,
  className = "",
}: BrandLogoProps) {
  if (compact) {
    return (
      <Image
        src="/brand/ceylon-news-mark.png"
        alt=""
        width={1254}
        height={1254}
        priority={priority}
        aria-hidden="true"
        className={`h-auto w-full ${className}`.trim()}
      />
    );
  }

  return (
    <Image
      src="/brand/ceylon-news-logo.png"
      alt="Ceylon News"
      width={1882}
      height={836}
      priority={priority}
      className={`h-auto w-full ${className}`.trim()}
    />
  );
}
