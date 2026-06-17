import Image from "next/image";
import { getProductImageUrl } from "@/lib/getProductImageUrl";
import { cn } from "@/lib/utils";

interface ProductThumbnailProps {
  name: string;
  imageUrl?: string | null;
  imageColor?: string;
  className?: string;
  imageClassName?: string;
}

export function ProductThumbnail({
  name,
  imageUrl,
  imageColor = "#333",
  className,
  imageClassName,
}: ProductThumbnailProps) {
  const src = getProductImageUrl(imageUrl);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-[#12121e]",
        className,
      )}
      style={
        !src
          ? { background: `linear-gradient(135deg, ${imageColor}55, #12121e)` }
          : undefined
      }
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          className={cn("object-contain p-1", imageClassName)}
          sizes="120px"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white/25">
          {name.charAt(0)}
        </div>
      )}
    </div>
  );
}
