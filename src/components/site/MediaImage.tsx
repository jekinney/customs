import React from 'react'
import Image from 'next/image'

type MediaImageProps = {
  src: string
  alt?: string | null
  /** Fill the (positioned, sized) parent and crop to cover. For cards/thumbnails. */
  fill?: boolean
  /** Intrinsic size — for responsive, non-cropped images (cover, before/after). */
  width?: number | null
  height?: number | null
  sizes?: string
  priority?: boolean
  className?: string
  style?: React.CSSProperties
}

// Thin wrapper around next/image for Payload media (served at /api/media/file/**,
// allowed in next.config images.localPatterns). Gives responsive sizes, lazy
// loading and modern formats for Core Web Vitals.
export function MediaImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority,
  className,
  style,
}: MediaImageProps) {
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt || ''}
        fill
        sizes={sizes || '100vw'}
        priority={priority}
        className={className}
        style={{ objectFit: 'cover', ...style }}
      />
    )
  }
  return (
    <Image
      src={src}
      alt={alt || ''}
      width={width || 1600}
      height={height || 1000}
      sizes={sizes}
      priority={priority}
      className={className}
      style={{ width: '100%', height: 'auto', ...style }}
    />
  )
}

export default MediaImage
