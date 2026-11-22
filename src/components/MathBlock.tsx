import React, { useMemo, useState } from 'react';
import { Code2, Sparkles } from 'lucide-react';
import { isLikelyMathLine, renderDirectLatex, renderKatexSafe } from '../utilities/mathFormatter';

interface MathBlockProps {
  /** Plain-text formula body from the original source document */
  plainText: string;
  /** Optional explicit LaTeX string (used by visualizations or curated blocks) */
  latex?: string;
  compact?: boolean;
}

/**
 * Renders mathematical expressions with KaTeX while preserving the exact
 * original plain-text formula accessible via a one-click toggle.
 * Any non-math prose lines or expressions that fail strict KaTeX parsing
 * remain intact in clean legible formatting.
 */
export const MathBlock: React.FC<MathBlockProps> = ({ plainText, latex, compact = false }) => {
  const [showRaw, setShowRaw] = useState(false);

  const renderedLines = useMemo(() => {
    if (latex) {
      return [{ kind: 'katex' as const, html: renderDirectLatex(latex, true), raw: plainText }];
    }
    const rawLines = plainText.split(/\r?\n/);
    return rawLines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return { kind: 'blank' as const, raw: line };
      if (isLikelyMathLine(trimmed)) {
        const html = renderKatexSafe(trimmed, true);
        if (html) {
          return { kind: 'katex' as const, html, raw: line };
        }
      }
      return { kind: 'prose' as const, raw: line };
    });
  }, [plainText, latex]);

  const hasAnyKatex = renderedLines.some((l) => l.kind === 'katex');

  return (
    <div
      className={`rounded-lg border border-[#D7E3DA] dark:border-[#24362B] bg-[#F8FAF8] dark:bg-[#0E1712] ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      {hasAnyKatex && !latex && (
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#E3ECE5] dark:border-[#1E2E24] text-xs text-[#647067] dark:text-[#93A89B]">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80]" />
            {showRaw ? 'Original Plain-Text Notation' : 'Typeset Mathematics (KaTeX)'}
          </span>
          <button
            type="button"
            onClick={() => setShowRaw((v) => !v)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-[#14532D] dark:text-[#86EFAC] hover:bg-[#DCFCE7] dark:hover:bg-[#192D21] transition-colors cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            {showRaw ? 'Show KaTeX' : 'Original text'}
          </button>
        </div>
      )}

      {showRaw || !hasAnyKatex ? (
        <pre className="font-mono text-xs sm:text-[13px] leading-relaxed text-[#17211B] dark:text-[#DCE8E0] whitespace-pre-wrap break-words overflow-x-auto">
          {plainText}
        </pre>
      ) : (
        <div className="space-y-1.5 overflow-x-auto">
          {renderedLines.map((item, idx) => {
            if (item.kind === 'blank') return <div key={idx} className="h-1.5" />;
            if (item.kind === 'katex') {
              return (
                <div
                  key={idx}
                  className="text-[#17211B] dark:text-[#ECF2EE]"
                  dangerouslySetInnerHTML={{ __html: item.html }}
                />
              );
            }
            return (
              <p
                key={idx}
                className="text-sm leading-relaxed text-[#2C3A31] dark:text-[#C5D6CB] font-sans whitespace-pre-wrap"
              >
                {item.raw.trim()}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const InlineLatex: React.FC<{ math: string; className?: string }> = ({ math, className = '' }) => {
  const html = useMemo(() => renderDirectLatex(math, false), [math]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};
