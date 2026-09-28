/**
 * Code block chrome: the copy button. A block's tab — its file or its
 * language — and its highlighted and diff lines are built into the HTML
 * instead; see src/lib/shiki-transformers.js.
 *
 * Added client-side, but overlaid rather than inserted into the flow —
 * the wrapper is the same box as the <pre> it replaces, so nothing moves
 * when this runs and CLS stays at zero.
 */

function enhance(pre: HTMLElement) {
  if (pre.dataset.enhanced) return;
  pre.dataset.enhanced = "1";

  const wrap = document.createElement("div");
  wrap.className = "codewrap";
  pre.parentNode?.insertBefore(wrap, pre);
  wrap.append(pre);

  const bar = document.createElement("div");
  bar.className = "codebar";

  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "codecopy";
  copy.textContent = "copy";
  copy.setAttribute("aria-label", "Copy code to clipboard");

  copy.addEventListener("click", async () => {
    // A removed line is shown for the change, not copied into the file.
    const lines = [...pre.querySelectorAll<HTMLElement>("code .line")];
    const text = lines.length
      ? lines.filter((l) => !l.classList.contains("remove")).map((l) => l.textContent).join("\n")
      : (pre.querySelector("code")?.textContent ?? "");
    try {
      await navigator.clipboard.writeText(text);
      copy.textContent = "copied";
      copy.dataset.done = "";
    } catch {
      copy.textContent = "press ⌘C";
    }
    setTimeout(() => {
      copy.textContent = "copy";
      delete copy.dataset.done;
    }, 1600);
  });

  bar.append(copy);
  wrap.append(bar);
}

function init() {
  document
    .querySelectorAll<HTMLElement>(".prose pre.astro-code")
    .forEach(enhance);
}

document.addEventListener("astro:page-load", init);
init();
