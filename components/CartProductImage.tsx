"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const FALLBACK_IMAGE = "/images/logo2.jpeg";

export default function CartProductImage({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = failedSrc === src ? FALLBACK_IMAGE : src;

  useEffect(() => {
    setFailedSrc(null);
  }, [src]);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => {
        if (imageSrc !== FALLBACK_IMAGE) setFailedSrc(src);
      }}
    />
  );
}
