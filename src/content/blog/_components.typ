// Reusable Typst components for blog posts
// Import in .typ files with: #import "components.typ": callout, nerd-corner

// ── Callout Component ──────────────────────────────────────────
// Usage: #callout("info", title: "Quick tip")[Your content here]
// Types: info, warning, error, success, note, tip
#let callout-colors = (
  info:    (border: rgb("#3b82f6"), bg: rgb("#3b82f610"), emoji: "💡"),
  warning: (border: rgb("#f59e0b"), bg: rgb("#f59e0b10"), emoji: "⚠️"),
  error:   (border: rgb("#ef4444"), bg: rgb("#ef444410"), emoji: "❌"),
  success: (border: rgb("#22c55e"), bg: rgb("#22c55e10"), emoji: "✅"),
  note:    (border: rgb("#a855f7"), bg: rgb("#a855f710"), emoji: "📝"),
  tip:     (border: rgb("#0ea5e9"), bg: rgb("#0ea5e910"), emoji: "💬"),
)

#let callout(type, title: none, show-emoji: true, body) = {
  let colors = callout-colors.at(type, default: callout-colors.info)
  block(
    width: 100%,
    inset: (left: 16pt, rest: 12pt),
    stroke: (left: 4pt + colors.border),
    radius: 6pt,
    fill: colors.bg,
    above: 18pt,
    below: 18pt,
  )[
    #if title != none [
      #text(weight: "bold")[
        #if show-emoji [#colors.emoji ]
        #title
      ]
      #v(4pt)
    ] else if show-emoji [
      #text[#colors.emoji ]
    ]
    #body
  ]
}

// ── Nerd Corner (Collapsible Details) ──────────────────────────
// Uses HTML <details>/<summary> for native collapse behavior
// Usage: #nerd-corner(title: "Deep Dive", subtitle: "More info")[Content]
#let nerd-corner(title: "Deep Dive", subtitle: none, body) = {
  html.elem("details",
    attrs: (
      class: "nerd-corner",
      style: "margin: 2rem 0; border: 1px solid rgba(255,255,255,0.06); border-left: 3px solid var(--accent, #7c8aff); border-radius: 8px; background: var(--surface-1, rgba(24,25,28,0.95)); overflow: hidden;",
    ),
  )[
    #html.elem("summary",
      attrs: (
        style: "padding: 1rem 1.25rem; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; user-select: none; list-style: none;",
      ),
    )[
      #html.elem("span", attrs: (style: "font-family: monospace; font-size: 0.875rem; color: var(--accent, #7c8aff);"))[~/]
      #html.elem("span", attrs: (style: "font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 4px; background: rgba(124,138,255,0.12); color: var(--accent, #7c8aff); font-family: monospace;"))[optional]
      #html.elem("span", attrs: (style: "flex: 1; font-weight: 600; color: var(--primary-text, #eff0f3);"))[#title]
    ]
    #html.elem("div",
      attrs: (
        style: "padding: 0 1.25rem 1.25rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.06);",
      ),
    )[#body]
  ]
}
