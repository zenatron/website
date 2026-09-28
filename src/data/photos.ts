/**
 * The photos on /photos. What the camera recorded comes from
 * photos.generated.json (see scripts/photos.mjs); what it saw is written
 * here: a `title` for what it is, and a `place` as coarse as it should
 * ever get — a city, a park or a public place, never a street — left off
 * where saying it would say where I live.
 */
import generated from "./photos.generated.json";

interface Written {
  title: string;
  place?: string;
  alt: string;
}

const WRITTEN: Record<string, Written> = {
  IMG_0086: {
    title: "Open for the Season",
    place: "Belltown Hill Orchards",
    alt: "A stone-pillared orchard sign under an overhanging autumn tree, marigolds at its base and an OPEN flag beside it, a country road curving away past rows of apple trees.",
  },
  IMG_0089: {
    title: "Macintosh Apples",
    place: "Belltown Hill Orchards",
    alt: "Deep red apples hanging among green and yellowing leaves, the nearest one sharp against a dark, dappled tangle of branches.",
  },
  IMG_0090: {
    title: "A Single Drop",
    place: "Belltown Hill Orchards",
    alt: "Macro of a single bead of water resting on the speckled red skin of an apple, the orchard a soft green blur behind.",
  },
  IMG_0094: {
    title: "Orchard Rows",
    place: "Belltown Hill Orchards",
    alt: "Rows of young apple trees seen over a weathered split-rail fence, windfall apples in the grass and a tree line under a flat grey sky.",
  },
  IMG_0464: {
    title: "Black Sand Cove",
    place: "Pa‘iloa Beach, Maui",
    alt: "A black sand cove under a clear blue sky, surf breaking against dark lava rock, framed by spiky agave leaves in the foreground.",
  },
  IMG_0499: {
    title: "The Headland",
    place: "Pa‘iloa Beach, Maui",
    alt: "A tree in silhouette arching over a green headland, where the cliffs meet a deep blue ocean and a line of white surf.",
  },
  IMG_0682: {
    title: "The Clock Tower",
    place: "UNC Charlotte",
    alt: "A brick clock tower at the end of an empty herringbone brick walkway, bare winter trees and green university banners either side.",
  },
  IMG_0909: {
    title: "Kalanchoe in Bloom",
    alt: "Close up of potted kalanchoe in bloom: clusters of red, white and pink flowers among glossy green leaves, lit from a window.",
  },
  IMG_1743: {
    title: "After Hours",
    place: "Charlotte, NC",
    alt: "An empty street at night, a single amber street lamp on the left, a painted bike lane arrow in the road and a lit bar sign in the distance.",
  },
  IMG_1916: {
    title: "The Pirelli Building",
    place: "New Haven, CT",
    alt: "The corner of Marcel Breuer's concrete Pirelli Building against a deep blue sky, its sculpted panels and recessed windows raked by low sun.",
  },
  IMG_1978: {
    title: "111 Founders Plaza",
    place: "East Hartford, CT",
    alt: "Looking up at 111 Founders Plaza, a dark glass office tower lost in fog, a single column of pale lit windows running up its corner to a flat grey sky.",
  },
  IMG_2005: {
    title: "Winter Stream",
    place: "Great Smoky Mountains",
    alt: "A rocky mountain stream running away into a misty winter forest of bare trees and rhododendron.",
  },
  IMG_2006: {
    title: "Whitewater",
    place: "Great Smoky Mountains",
    alt: "Looking down a mountain stream, water rushing white between mossy, lichen-spotted boulders.",
  },
};

export interface Photo {
  id: string;
  title: string;
  place?: string;
  alt: string;
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
  /** The photo's average color, shown in its tile until the image arrives. */
  tone?: string;
}

/** Oldest first, the way a library scrolls. */
export const PHOTOS: Photo[] = generated
  .filter((g) => WRITTEN[g.id])
  .map((g) => ({ ...g, ...WRITTEN[g.id] }))
  .sort((a, b) => (a.taken ?? "").localeCompare(b.taken ?? ""));

export const PHOTO_WIDTHS = [480, 960, 1600] as const;
