'use client';

import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}

export function ProductImageGallery({
  images,
  title,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages = images.length > 0 ? images : ['/placeholder.png'];

  return (
    <div className="flex w-full flex-col gap-5 lg:max-w-117.75">
      {/* Main image */}
      <div className="bg-surface-neutral relative flex h-87.5 w-full items-center justify-center sm:h-112.5 lg:h-146.75">
        <div className="relative h-3/4 w-3/4 max-w-40.75 sm:w-1/2 lg:h-125.75 lg:w-2/5">
          <Image
            src={displayImages[selectedIndex]}
            alt={title}
            fill
            sizes="(max-width: 768px) 80vw, 471px"
            className="object-contain mix-blend-multiply drop-shadow-[0px_15px_20px_rgba(0,0,0,0.25)]"
            priority
          />
        </div>
        {/* Preload all non-selected images at main display size */}
        {displayImages.map((image, index) =>
          index !== selectedIndex ? (
            <div
              key={image}
              className="pointer-events-none absolute inset-0 opacity-0"
              aria-hidden="true"
            >
              <div className="relative flex h-87.5 w-full items-center justify-center sm:h-112.5 lg:h-146.75">
                <div className="relative h-3/4 w-3/4 max-w-40.75 sm:w-1/2 lg:h-125.75 lg:w-2/5">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 80vw, 471px"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          ) : null,
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto lg:gap-5">
        {displayImages.map((image, index) => (
          <button
            key={image}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              'relative flex h-20 w-24 shrink-0 items-center justify-center lg:h-25 lg:w-[143.6px]',
              selectedIndex === index
                ? 'border-[1.5px] border-black'
                : 'bg-white/70',
            )}
          >
            <div className="relative h-16 w-5 lg:h-21.25 lg:w-6.75">
              <Image
                src={image}
                alt={`${title} - ${index + 1}`}
                fill
                sizes="143px"
                className="object-contain mix-blend-multiply drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
