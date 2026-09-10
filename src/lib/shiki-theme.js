/**
 * Shiki theme, built from the palette and nothing else.
 *
 * Code blocks are the most visually prominent element on the site, so a
 * stock theme would smuggle a dozen off-palette hues past the three-color
 * rule. Syntax gets the same vocabulary as everything else:
 *   dim   -> comments (recede)
 *   mint  -> strings and values (navigable/literal)
 *   amber -> keywords and constants (structural)
 *   text  -> everything else
 *   red   -> genuine syntax errors
 */
const c = {
  void: "#0E1013",
  text: "#E6E1D8",
  muted: "#8A9099",
  dim: "#5A6069",
  amber: "#FFB454",
  mint: "#7FD1B9",
  red: "#E5484D",
};

export default {
  name: "pvish",
  type: "dark",
  colors: {
    "editor.background": c.void,
    "editor.foreground": c.text,
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: c.dim } },
    {
      scope: ["string", "string.quoted", "string.template", "constant.other.symbol", "markup.inline.raw"],
      settings: { foreground: c.mint },
    },
    {
      scope: [
        "keyword",
        "storage",
        "storage.type",
        "storage.modifier",
        "constant.language",
        "constant.numeric",
        "support.type",
        "entity.name.tag",
        "keyword.operator.expression",
        "variable.language",
      ],
      settings: { foreground: c.amber },
    },
    {
      scope: ["punctuation", "meta.brace", "keyword.operator", "punctuation.separator"],
      settings: { foreground: c.muted },
    },
    { scope: ["invalid", "invalid.illegal", "markup.deleted"], settings: { foreground: c.red } },
    {
      scope: ["entity.name.function", "support.function", "entity.name.type", "variable", "variable.parameter"],
      settings: { foreground: c.text },
    },
  ],
};
