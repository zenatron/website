/**
 * The photos on /photos. What the camera recorded comes from
 * photos.generated.json (see scripts/photos.mjs); what it saw is written
 * here. `place` is as coarse as it should ever get — a city or a park,
 * never a street — and is left off where saying it would say where I live.
 */
import generated from "./photos.generated.json";

interface Written {
  alt: string;
  place?: string;
}

const WRITTEN: Record<string, Written> = {
  IMG_0464: {
    place: "Maui",
    alt: "A black sand cove under a clear blue sky, surf breaking against dark lava rock, framed by spiky agave leaves in the foreground.",
  },
  IMG_0499: {
    place: "Maui",
    alt: "A tree in silhouette arching over a green headland, where the cliffs meet a deep blue ocean and a line of white surf.",
  },
  IMG_0682: {
    place: "UNC Charlotte",
    alt: "A brick clock tower at the end of an empty herringbone brick walkway, bare winter trees and green university banners either side.",
  },
  IMG_0909: {
    alt: "Close up of potted kalanchoe in bloom: clusters of red, white and pink flowers among glossy green leaves, lit from a window.",
  },
  IMG_1743: {
    place: "Charlotte",
    alt: "An empty street at night, a single amber street lamp on the left, a painted bike lane arrow in the road and a lit bar sign in the distance.",
  },
  IMG_1916: {
    place: "New Haven",
    alt: "The corner of Marcel Breuer's concrete Pirelli Building against a deep blue sky, its sculpted panels and recessed windows raked by low sun.",
  },
  IMG_1978: {
    alt: "Looking up at a dark glass office tower in fog, a single column of pale lit windows running up its corner to a flat grey sky.",
  },
  IMG_2005: {
    place: "Great Smoky Mountains",
    alt: "A rocky mountain stream running away into a misty winter forest of bare trees and rhododendron.",
  },
  IMG_2006: {
    place: "Great Smoky Mountains",
    alt: "Looking down a mountain stream, water rushing white between mossy, lichen-spotted boulders.",
  },
};

export interface Photo {
  id: string;
  alt: string;
  place?: string;
  width: number;
  height: number;
  /** YYYY-MM-DD, the camera's local date. */
  taken?: string;
  camera?: string;
  app?: string;
  lens?: string;
  /** 35mm-equivalent focal length, as Photos shows it. */
  focal?: number;
  aperture?: number;
  /** Seconds. */
  shutter?: number;
  iso?: number;
  ev?: number;
}

/** Oldest first, the way a library scrolls. */
export const PHOTOS: Photo[] = generated
  .filter((g) => WRITTEN[g.id])
  .map((g) => ({ ...g, ...WRITTEN[g.id] }))
  .sort((a, b) => (a.taken ?? "").localeCompare(b.taken ?? ""));

export const PHOTO_WIDTHS = [480, 960, 1600] as const;
