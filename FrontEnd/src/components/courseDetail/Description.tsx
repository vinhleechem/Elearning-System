import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  html?: string;
}

const Description: React.FC<Props> = ({ html }) => {
  const [expanded, setExpanded] = useState(false);

  if (!html) return null;

  // Normalize Windows line endings
  const content = html.replace(/\r\n/g, "\n");

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
        Mô tả khóa học
      </h2>

      <div
        className={`relative overflow-hidden transition-all duration-300 ${expanded ? "" : "max-h-64"
          }`}
      >
        <div className="description-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>

        {/* Fade gradient when collapsed */}
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none" />
        )}
      </div>

      <button
        onClick={() => setExpanded((s) => !s)}
        className="mt-4 text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all text-sm"
      >
        {expanded ? "Thu gọn" : "Xem thêm mô tả"}
        <span
          className={`material-symbols-outlined transition-transform ${expanded ? "rotate-180" : ""
            }`}
        >
          expand_more
        </span>
      </button>

      <style>{`
        .description-prose { font-size: 0.9rem; line-height: 1.8; }
        .description-prose p { margin-bottom: 0.85rem; color: #475569; }
        .dark .description-prose p { color: #94a3b8; }
        .description-prose h1, .description-prose h2, .description-prose h3 {
          font-weight: 700; color: #0f172a;
          margin-top: 1.25rem; margin-bottom: 0.4rem;
        }
        .dark .description-prose h1,
        .dark .description-prose h2,
        .dark .description-prose h3 { color: #f1f5f9; }
        .description-prose ul, .description-prose ol {
          padding-left: 1.5rem; margin-bottom: 0.85rem;
        }
        .description-prose ul { list-style-type: disc; }
        .description-prose ol { list-style-type: decimal; }
        .description-prose li { margin-bottom: 0.3rem; color: #475569; }
        .dark .description-prose li { color: #94a3b8; }
        .description-prose strong, .description-prose b {
          font-weight: 700; color: #1e293b;
        }
        .dark .description-prose strong,
        .dark .description-prose b { color: #e2e8f0; }
        .description-prose a { color: #2563eb; text-decoration: underline; }
        .description-prose code {
          background: #f1f5f9; padding: 2px 6px;
          border-radius: 4px; font-size: 0.85em;
          font-family: monospace;
        }
        .dark .description-prose code { background: #1e293b; color: #e2e8f0; }
        .description-prose blockquote {
          border-left: 3px solid #2563eb;
          padding-left: 1rem; color: #64748b;
          font-style: italic; margin: 0.5rem 0;
        }
        .description-prose hr { border-color: #e2e8f0; margin: 1rem 0; }
      `}</style>
    </section>
  );
};

export default Description;
