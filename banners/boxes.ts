// Measures logos with the site's own iconbox, so these icons are fitted
// exactly as AppIcon fits them. Writes boxes.js for the templates.
import { iconBox } from "../src/lib/iconbox.ts";
const files = process.argv.slice(2);
const out: Record<string, unknown> = {};
for (const f of files) out[f] = await iconBox(f);
await Bun.write(`${import.meta.dir}/boxes.js`, `window.BOXES = ${JSON.stringify(out)};\n`);
