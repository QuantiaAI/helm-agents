import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

/** Tailwind arbitrary-variant styling for rendered markdown (no typography plugin). */
const MD_CLASS = [
  "text-sm leading-relaxed text-zinc-300",
  "[&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-zinc-100",
  "[&_h2]:mb-1.5 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-zinc-100",
  "[&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-zinc-200",
  "[&_p]:my-2",
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5",
  "[&_strong]:font-semibold [&_strong]:text-zinc-100",
  "[&_a]:text-helm-accent [&_a]:underline",
  "[&_code]:rounded [&_code]:bg-zinc-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs",
  "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-zinc-950 [&_pre]:p-3 [&_pre]:text-xs",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left",
  "[&_th]:border [&_th]:border-zinc-700 [&_th]:bg-zinc-800/50 [&_th]:px-2 [&_th]:py-1 [&_th]:font-semibold",
  "[&_td]:border [&_td]:border-zinc-800 [&_td]:px-2 [&_td]:py-1",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-zinc-700 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-400",
].join(" ");

/** URL-safe slug from heading text (CJK-aware; falls back to "section"). */
export function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return s || "section";
}

function textOf(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textOf).join("");
  if (children && typeof children === "object" && "props" in children) {
    return textOf((children as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

// When `withIds` is set, headings get a slug id so a Docs TOC can anchor-link.
const HEADING_COMPONENTS: Components = {
  h1: ({ children }) => <h1 id={slugify(textOf(children))}>{children}</h1>,
  h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={slugify(textOf(children))}>{children}</h3>,
};

/** Renders a markdown string with GFM + syntax-highlighted code (HTML escaped). */
export function Markdown({
  children,
  withIds,
}: {
  children: string;
  withIds?: boolean;
}) {
  return (
    <div className={MD_CLASS}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={withIds ? HEADING_COMPONENTS : undefined}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
