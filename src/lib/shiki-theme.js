/**
 * Shiki themes built from the palette, one per site theme.
 *
 * Code blocks are the most visually prominent element on a post, so a
 * stock theme would smuggle a dozen off-palette hues onto the page.
 * Syntax borrows the site's own vocabulary:
 *   muted  -> comments        link   -> strings and values
 *   accent -> keywords        violet -> functions and types
 *   danger -> genuine errors
 */
function theme(name, type, c) {
  return {
    name,
    type,
    colors: { "editor.background": c.bg, "editor.foreground": c.text },
    tokenColors: [
      { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: c.muted } },
      {
        scope: ["string", "string.quoted", "string.template", "constant.other.symbol", "markup.inline.raw"],
        settings: { foreground: c.link },
      },
      {
        scope: ["keyword", "storage", "storage.type", "storage.modifier", "constant.language",
                "constant.numeric", "support.type", "entity.name.tag", "keyword.operator.expression",
                "variable.language"],
        settings: { foreground: c.accent },
      },
      {
        scope: ["entity.name.function", "support.function", "entity.name.type", "entity.name.class"],
        settings: { foreground: c.violet },
      },
      {
        scope: ["punctuation", "meta.brace", "keyword.operator", "punctuation.separator"],
        settings: { foreground: c.muted },
      },
      { scope: ["invalid", "invalid.illegal", "markup.deleted"], settings: { foreground: c.danger } },
      { scope: ["variable", "variable.parameter"], settings: { foreground: c.text } },
    ],
  };
}

const light = {
  bg: "#F2EFE8", text: "#35312A", muted: "#635D52",
  accent: "#935D0F", link: "#1E7657", danger: "#B93A28", violet: "#6A4BC4",
};
const dark = {
  bg: "#100F0C", text: "#EDE7DA", muted: "#A69E8D",
  accent: "#FFB454", link: "#7FD1B9", danger: "#F2695E", violet: "#BCA4FF",
};

export const pvishLight = theme("pvish-light", "light", light);
export const pvishDark = theme("pvish-dark", "dark", dark);
