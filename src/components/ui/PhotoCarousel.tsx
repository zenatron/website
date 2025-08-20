"use client";

import * as React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Photo = {
  src: string;
  alt: string;
  caption?: string;
};

type PhotoCarouselProps = {
  photos: Photo[];
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

export default function PhotoCarousel({
  photos,
  className,
  autoPlay = true,
  autoPlayInterval = 4000,
}: PhotoCarouselProps) {
  const autoplay = React.useMemo(
    () =>
      Autoplay({
        delay: autoPlayInterval,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    [autoPlayInterval]
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    autoPlay ? [autoplay] : []
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  if (!photos || photos.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-64 bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-3xl",
          className
        )}
      >
        <p className="text-secondary-text">No photos available</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-3xl group",
        className
      )}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {photos.map((photo, index) => (
            <div key={index} className="min-w-0 shrink-0 grow-0 basis-full">
              <div className="relative aspect-[4/3] md:aspect-[16/9]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                {photo.caption && (
                  <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4">
                    <p className="text-white text-xs md:text-sm lg:text-base font-medium drop-shadow">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className={cn(
              "absolute left-2 md:left-3 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/40 backdrop-blur-md text-white rounded-full",
              "hover:bg-black/60 transition-opacity duration-200",
              "opacity-80 md:opacity-0 md:group-hover:opacity-100 z-20"
            )}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className={cn(
              "absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/40 backdrop-blur-md text-white rounded-full",
              "hover:bg-black/60 transition-opacity duration-200",
              "opacity-80 md:opacity-0 md:group-hover:opacity-100 z-20"
            )}
            aria-label="Next photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {photos.length > 1 && (
        <div className="p-3 md:p-4 bg-neutral-900/30 backdrop-blur-sm border-t border-neutral-600/20 flex items-center justify-center gap-2">
          {photos.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => emblaApi?.scrollTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === currentIndex ? "true" : undefined}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                idx === currentIndex
                  ? "bg-accent scale-125"
                  : "bg-white/50 hover:bg-white"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
