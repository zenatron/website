/**
 * Turn the originals in image_drop/photos/ into what /photos serves.
 *
 * The originals are 12–48MP JPEGs straight out of Photos, carrying the
 * full EXIF — GPS included, for anything shot in ProCam. None of that is
 * deployed. For each one this writes:
 *
 *   public/images/photos/<id>-<w>.avif|webp   three widths, no metadata
 *   src/data/photos.generated.json            the few fields /photos shows,
 *                                             and each photo's average color,
 *                                             painted behind it while it loads
 *
 * Only the fields named in `pick` are read, so a location can't leak into
 * the JSON by accident; sharp writes nothing but pixels and an sRGB
 * profile unless it's told to, so it can't leak into the images either.
 *
 * Existing images are skipped; pass --force to re-encode them. Entries
 * already in the JSON whose originals are no longer here are kept, so the
 * drop folder only needs to hold what's new.
 * Run with `bun run photos`.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import exifr from "exifr";

const SRC = "image_drop/photos";
const OUT = "public/images/photos";
const DATA = "src/data/photos.generated.json";

/** The grid, the viewer on a laptop, and the viewer on a big or dense screen. */
const WIDTHS = [480, 960, 1600];
const FORMATS = {
  avif: (img) => img.avif({ quality: 55, effort: 6 }),
  webp: (img) => img.webp({ quality: 80, effort: 6 }),
};

const force = process.argv.includes("--force");

/** The physical focal length says which camera it was; the 35mm figure says how it was framed. */
function lens(mm) {
  // 6.765 on a 16 Pro, 6.93 on an 18 Pro.
  if (mm > 6 && mm < 8) return "Main";
  if (mm < 3) return "Ultra Wide";
  if (mm > 10) return "Telephoto";
  return undefined;
}

/** "iOS 18.2" writes its version number; third-party apps write their name. */
function app(software) {
  if (!software) return undefined;
  return /^\d/.test(software) ? "Camera" : software.replace(/\s+[\d.]+$/, "");
}

mkdirSync(OUT, { recursive: true });

/** The whole picture averaged to one pixel: its color, from across the room. */
async function tone(img) {
  const { data } = await img.resize(1, 1, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return "#" + [...data.subarray(0, 3)].map((v) => v.toString(16).padStart(2, "0")).join("");
}

// No drop folder is fine: the run just backfills tones for what's published.
const files = (existsSync(SRC) ? readdirSync(SRC) : []).filter((f) => /\.jpe?g$/i.test(f)).sort();
const ids = new Set(files.map((f) => f.replace(/\.jpe?g$/i, "")));
const photos = existsSync(DATA)
  ? JSON.parse(readFileSync(DATA, "utf8")).filter((p) => !ids.has(p.id))
  : [];

for (const file of files) {
  const id = file.replace(/\.jpe?g$/i, "");
  const path = `${SRC}/${file}`;
  // A buffer, not the path: exifr's chunked file reader breaks on Node 26.
  const buf = readFileSync(path);

  const exif = await exifr.parse(buf, {
    pick: [
      "Model", "LensModel", "Software", "FocalLength", "FocalLengthIn35mmFormat",
      "FNumber", "ExposureTime", "ISO", "ExposureCompensation", "DateTimeOriginal",
    ],
    // The raw "YYYY:MM:DD HH:MM:SS", which is the camera's local time. Revived,
    // it's reinterpreted in whatever timezone this script runs in.
    reviveValues: false,
  });

  // .rotate() applies the EXIF orientation before the EXIF is dropped.
  const base = sharp(buf).rotate();
  const { width, height } = await base.metadata();

  for (const w of WIDTHS) {
    for (const [ext, encode] of Object.entries(FORMATS)) {
      const out = `${OUT}/${id}-${w}.${ext}`;
      if (!force && existsSync(out)) continue;
      await encode(base.clone().resize({ width: w, withoutEnlargement: true })).toFile(out);
      console.log(`wrote ${out}`);
    }
  }

  const [date] = String(exif?.DateTimeOriginal ?? "").split(" ");
  photos.push({
    id,
    width,
    height,
    taken: date ? date.replaceAll(":", "-") : undefined,
    camera: exif?.Model,
    app: app(exif?.Software),
    lens: exif?.FocalLength ? lens(exif.FocalLength) : undefined,
    focal: exif?.FocalLengthIn35mmFormat,
    aperture: exif?.FNumber ? Math.round(exif.FNumber * 100) / 100 : undefined,
    shutter: exif?.ExposureTime,
    iso: exif?.ISO,
    ev: exif?.ExposureCompensation != null ? Math.round(exif.ExposureCompensation * 10) / 10 : undefined,
    tone: await tone(base.clone()),
  });
}

// Photos published before tones existed take theirs from the smallest encode.
for (const p of photos) {
  const small = `${OUT}/${p.id}-${WIDTHS[0]}.webp`;
  if (!p.tone && existsSync(small)) p.tone = await tone(sharp(small));
}

photos.sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(DATA, JSON.stringify(photos, null, 2) + "\n");
console.log(`${photos.length} photos → ${DATA}`);
