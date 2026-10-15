import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders product and article copy without ever inserting raw HTML.
 *
 * Content from the shop API (product descriptions, blog bodies) is authored
 * in an admin and may contain markup. Instead of `dangerouslySetInnerHTML`,
 * the string is tokenised here and only an allowlist of structural tags is
 * turned into React elements; every attribute is dropped except a vetted
 * link `href`, and all text goes through React's escaping. Scripts, styles,
 * iframes, event handlers and `javascript:` URLs therefore cannot reach the
 * page, whatever the source contains.
 *
 * The backend should still sanitise on write (see DOCHOMO-PHASE16 report);
 * this is the display-side guarantee.
 */

const BLOCK = new Set(["p", "h2", "h3", "h4", "ul", "ol", "li", "blockquote"]);
const INLINE = new Set(["strong", "b", "em", "i", "u", "br", "a", "span", "small", "sup", "sub"]);
/** Dropped with everything inside them. */
const DISCARD = new Set(["script", "style", "iframe", "object", "embed", "template", "noscript", "svg", "math", "form"]);
const VOID = new Set(["br", "img", "hr", "input", "meta", "link", "source", "wbr"]);

type Node = { tag: string; href?: string; children: (Node | string)[] };

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…" };

function decode(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const value = code[1].toLowerCase() === "x" ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(value) && value > 0 && value < 0x110000 ? String.fromCodePoint(value) : "";
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Only site-relative paths and http(s)/mailto links survive. */
function safeHref(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const href = decode(raw).trim();
  if (/^\/(?!\/)/.test(href) || /^#/.test(href)) return href;
  try {
    const url = new URL(href);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function parseRichText(source: string): Node {
  const root: Node = { tag: "root", children: [] };
  const stack: Node[] = [root];
  let discarding: string | null = null;
  const pattern = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>|([^<]+|<)/g;

  for (const match of source.matchAll(pattern)) {
    const [whole, rawTag, attrs, text] = match;
    const top = stack[stack.length - 1];
    if (whole.startsWith("<!--")) continue;

    if (text !== undefined) {
      if (!discarding) top.children.push(decode(text));
      continue;
    }

    const tag = rawTag.toLowerCase();
    const closing = whole.startsWith("</");

    if (discarding) {
      if (closing && tag === discarding) discarding = null;
      continue;
    }
    if (DISCARD.has(tag)) {
      if (!closing && !/\/\s*$/.test(attrs)) discarding = tag;
      continue;
    }
    if (!BLOCK.has(tag) && !INLINE.has(tag)) continue; // unknown tags vanish, their text stays

    if (closing) {
      const index = stack.map((node) => node.tag).lastIndexOf(tag);
      if (index > 0) stack.length = index;
      continue;
    }

    const node: Node = { tag, children: [] };
    if (tag === "a") node.href = safeHref(attrs.match(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i)?.slice(2).find(Boolean));
    top.children.push(node);
    if (!VOID.has(tag) && !/\/\s*$/.test(attrs)) stack.push(node);
  }
  return root;
}

function render(children: (Node | string)[], keyPrefix: string): ReactNode[] {
  return children.map((child, index) => {
    const key = `${keyPrefix}-${index}`;
    if (typeof child === "string") return <Fragment key={key}>{child}</Fragment>;
    const inner = render(child.children, key);
    switch (child.tag) {
      case "p":
        return <p key={key}>{inner}</p>;
      case "h2":
        return <h2 key={key}>{inner}</h2>;
      case "h3":
      case "h4":
        return <h3 key={key}>{inner}</h3>;
      case "ul":
        return <ul key={key}>{inner}</ul>;
      case "ol":
        return <ol key={key}>{inner}</ol>;
      case "li":
        return <li key={key}>{inner}</li>;
      case "blockquote":
        return <blockquote key={key}>{inner}</blockquote>;
      case "strong":
      case "b":
        return <strong key={key}>{inner}</strong>;
      case "em":
      case "i":
        return <em key={key}>{inner}</em>;
      case "br":
        return <br key={key} />;
      case "sup":
        return <sup key={key}>{inner}</sup>;
      case "sub":
        return <sub key={key}>{inner}</sub>;
      case "a":
        return child.href ? (
          <a key={key} href={child.href} {...(/^https?:/.test(child.href) ? { rel: "noopener noreferrer nofollow", target: "_blank" } : {})}>
            {inner}
          </a>
        ) : (
          <Fragment key={key}>{inner}</Fragment>
        );
      default:
        return <Fragment key={key}>{inner}</Fragment>;
    }
  });
}

/**
 * Plain text (no tags) is split into paragraphs on blank lines, so a
 * description typed without markup still reads as paragraphs.
 */
export function SafeRichText({ content, className }: { content: string; className?: string }) {
  const hasMarkup = /<[a-z][\s\S]*>/i.test(content);
  const tree: Node = hasMarkup
    ? parseRichText(content)
    : {
        tag: "root",
        children: content
          .split(/\n\s*\n/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .map((paragraph) => ({ tag: "p", children: [paragraph] })),
      };

  return (
    <div
      className={cn(
        "space-y-4 [&_a]:font-medium [&_a]:text-forest [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-forest/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:pt-2 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:tracking-tight [&_h2]:text-ink [&_h3]:pt-1 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
        className,
      )}
    >
      {render(tree.children, "rt")}
    </div>
  );
}
