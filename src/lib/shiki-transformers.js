/**
 * What a code block can say besides its code, written in the fence:
 *
 *   ```caddyfile title="Caddyfile" {3-4}
 *   reverse_proxy old:80   # [!code --]
 *   reverse_proxy new:80   # [!code ++]
 *   header X-Frame-Options DENY  # [!code highlight]
 *
 * - Every block with a language sits under a tab, the way an editor shows
 *   which file you're in: `title` names the file, and without one the tab
 *   says the language. Built into the HTML here rather than added by
 *   script, so it's there on first paint and nothing shifts. Several
 *   blocks in a <CodeGroup> share one row of tabs.
 * - `{1,3-4}` in the meta, or `[!code highlight]` on a line, marks the
 *   lines the prose is talking about.
 * - `[!code ++]` / `[!code --]` mark lines added and removed, for "change
 *   this to that".
 *
 * The notation comments are stripped from the output, so what's copied is
 * the file as it should be written.
 */
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import { labelFor } from "./code-labels.js";

/** `title="docker-compose.yml"` or `title=Caddyfile`. */
function titleOf(meta = "") {
  return meta.match(/\btitle=(?:"([^"]+)"|'([^']+)'|(\S+))/)?.slice(1).find(Boolean);
}

function transformerFileTab() {
  return {
    name: "pvish:file-tab",
    root(root) {
      const title = titleOf(this.options.meta?.__raw);
      const name = title ?? labelFor(this.options.lang);
      if (!name) return;
      const pre = root.children.find((n) => n.type === "element" && n.tagName === "pre");
      if (!pre) return;
      if (title) pre.properties["data-title"] = title;
      root.children = [
        {
          type: "element",
          tagName: "div",
          properties: { className: ["codefile"] },
          children: [
            {
              type: "element",
              tagName: "div",
              // A file's name, or only its language.
              properties: { className: ["codetab"], "data-kind": title ? "file" : "lang" },
              children: [{ type: "text", value: name }],
            },
            pre,
          ],
        },
      ];
    },
  };
}

export const transformers = [
  transformerMetaHighlight(),
  transformerNotationHighlight({ matchAlgorithm: "v3" }),
  transformerNotationDiff({ matchAlgorithm: "v3" }),
  transformerFileTab(),
];
