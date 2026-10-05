import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

interface MarkdownMessageProps {
  content: string;
  isStreaming?: boolean;
}

export function MarkdownMessage({ content, isStreaming }: MarkdownMessageProps) {
  return (
    <div className="markdown-prose text-xs leading-relaxed text-foreground break-words selection:bg-secondary selection:text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-semibold text-foreground mt-4 mb-2 pb-1 border-b border-border flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-category-chat inline-block" />
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-semibold text-foreground mt-3.5 mb-1.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-category-link inline-block" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-category-link mt-3 mb-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-foreground mt-2 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 leading-relaxed text-foreground/90 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 space-y-1 pl-4 list-disc marker:text-category-chat last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 space-y-1 pl-4 list-decimal marker:text-category-chat font-medium last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-foreground/90 pl-0.5">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 rounded-r-[var(--radius-base)] border-l-2 border-border bg-muted/50 px-3.5 py-2 text-muted-foreground italic text-xs">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3.5 border-border" />,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-muted-foreground">{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-category-link hover:underline font-medium inline-flex items-center gap-0.5"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-[var(--radius-base)] border border-border bg-card shadow-none">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-secondary border-b border-border text-foreground font-semibold">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-t border-border px-3 py-2 text-foreground/80">
              {children}
            </td>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const isInline = !match && !codeString.includes("\n");

            if (isInline) {
              return (
                <code
                  className="rounded-[4px] bg-card px-1.5 py-0.5 font-mono text-[11px] font-medium text-category-link border border-border"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock language={match ? match[1] : "text"} code={codeString}>
                {children}
              </CodeBlock>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {isStreaming && (
        <span className="inline-block h-3.5 w-1.5 ml-1 bg-category-chat animate-pulse align-middle rounded-xs" />
      )}
    </div>
  );
}

function CodeBlock({
  language,
  code,
  children,
}: {
  language: string;
  code: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-[var(--radius-base)] border border-border bg-card shadow-none">
      <div className="flex items-center justify-between border-b border-border bg-secondary px-3 py-1.5 text-[10px] font-mono text-muted-foreground">
        <span className="uppercase font-semibold text-category-chat">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-[100px] border border-border bg-transparent px-2 py-0.5 text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-category-chat" />
              <span className="text-category-chat">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[11px] font-mono leading-relaxed text-foreground bg-card">
        {children}
      </pre>
    </div>
  );
}
