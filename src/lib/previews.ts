/** One entry in /previews.json — see src/pages/previews.json.ts and scripts/peek.ts. */
export interface Preview {
  /** The explorer's filename stem: `tailscale-explained`. */
  file: string;
  title: string;
  summary?: string;
  /** Right-aligned beside the filename: `24 min`, `app`. */
  aside?: string;
  /** Under the summary: `homelab & networking · part 2`. */
  context?: string;
  hue?: string;
}
