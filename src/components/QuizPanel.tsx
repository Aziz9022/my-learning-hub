import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, Sparkles, XCircle } from 'lucide-react';
import type { QuizQuestion } from '../types/content';

interface QuizPanelProps {
  questions: QuizQuestion[];
  quizCompleted: Record<string, boolean>;
  onMarkSolved: (questionId: string, correct: boolean) => void;
}

/**
 * Optional Practice Quiz Panel — clearly labeled as AI-Generated Supplementary
 * Practice, cleanly separated from original textbook content.
 */
export const QuizPanel: React.FC<QuizPanelProps> = ({
  questions,
  quizCompleted,
  onMarkSolved,
}) => {
  const [selectedMcq, setSelectedMcq] = useState<Record<string, number>>({});
  const [numericInputs, setNumericInputs] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  if (questions.length === 0) return null;

  const checkAnswer = (q: QuizQuestion) => {
    let isCorrect = false;
    if (q.type === 'mcq') {
      isCorrect = selectedMcq[q.id] === q.correctIndex;
    } else if (q.type === 'numeric') {
      const val = parseFloat((numericInputs[q.id] || '').trim());
      isCorrect =
        !Number.isNaN(val) &&
        q.correctNumber !== undefined &&
        Math.abs(val - q.correctNumber) <= (q.tolerance ?? 0.01);
    }
    setSubmitted((prev) => ({ ...prev, [q.id]: true }));
    onMarkSolved(q.id, isCorrect);
  };

  return (
    <div className="rounded-xl border border-[#D4E2D8] dark:border-[#24362B] bg-white dark:bg-[#131D17] overflow-hidden">
      <div className="px-5 py-4 bg-[#F4F9F5] dark:bg-[#16231B] border-b border-[#E2ECE4] dark:border-[#203026] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" />
          <h3 className="text-base font-semibold text-[#17211B] dark:text-[#ECF2EE]">
            Practice Check
          </h3>
        </div>
        <span className="text-xs font-medium text-[#647067] dark:text-[#93A89B]">
          AI-Generated Practice (Supplementary) · Not part of original source text
        </span>
      </div>

      <div className="p-5 space-y-6">
        {questions.map((q, idx) => {
          const isChecked = submitted[q.id];
          const wasCorrect = quizCompleted[q.id] === true;

          return (
            <div
              key={q.id}
              className="space-y-3 pb-5 border-b border-[#E8EFE9] dark:border-[#1E2E24] last:border-b-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#647067] dark:text-[#93A89B]">
                <span className="font-mono">
                  Question {idx + 1} · Section {q.sectionRef}
                </span>
                {wasCorrect && (
                  <span className="inline-flex items-center gap-1 text-[#15803D] dark:text-[#4ADE80] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                  </span>
                )}
              </div>

              <p className="text-sm font-medium text-[#17211B] dark:text-[#ECF2EE] leading-relaxed">
                {q.question}
              </p>

              {q.type === 'mcq' && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isPicked = selectedMcq[q.id] === optIdx;
                    const isRightOpt = optIdx === q.correctIndex;
                    let cls =
                      'border-[#D7E3DA] dark:border-[#293D31] hover:border-[#15803D] bg-[#F8FAF8] dark:bg-[#0E1712]';
                    if (isChecked) {
                      if (isRightOpt) {
                        cls =
                          'border-[#15803D] bg-[#DCFCE7]/70 dark:bg-[#143321] text-[#14532D] dark:text-[#DCFCE7]';
                      } else if (isPicked && !isRightOpt) {
                        cls =
                          'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200';
                      }
                    } else if (isPicked) {
                      cls =
                        'border-[#15803D] bg-[#DCFCE7]/50 dark:bg-[#163022] ring-1 ring-[#15803D]';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => {
                          setSelectedMcq((prev) => ({ ...prev, [q.id]: optIdx }));
                          setSubmitted((prev) => ({ ...prev, [q.id]: false }));
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-sm transition-colors cursor-pointer ${cls}`}
                      >
                        <span className="font-mono text-xs mr-2 opacity-70">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === 'numeric' && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={numericInputs[q.id] || ''}
                    onChange={(e) => {
                      setNumericInputs((prev) => ({ ...prev, [q.id]: e.target.value }));
                      setSubmitted((prev) => ({ ...prev, [q.id]: false }));
                    }}
                    placeholder="Enter number..."
                    className="w-44 rounded-lg border border-[#D7E3DA] dark:border-[#293D31] bg-[#F8FAF8] dark:bg-[#0E1712] px-3 py-2 text-sm font-mono"
                  />
                  {q.unitHint && (
                    <span className="text-xs font-mono text-[#647067] dark:text-[#93A89B]">
                      {q.unitHint}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => checkAnswer(q)}
                  className="px-4 py-1.5 rounded-lg bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Check Answer
                </button>
                {isChecked && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      wasCorrect
                        ? 'text-[#15803D] dark:text-[#4ADE80]'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {wasCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Correct!
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" /> Not quite — review the explanation below.
                      </>
                    )}
                  </span>
                )}
              </div>

              {isChecked && (
                <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-3 text-xs leading-relaxed text-[#2C3A31] dark:text-[#BFD1C5] flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#17211B] dark:text-[#ECF2EE]">Explanation:</strong>{' '}
                    {q.explanation}
                    {q.type === 'numeric' && q.correctNumber !== undefined && (
                      <span className="ml-1 font-mono font-semibold">
                        (Expected: {q.correctNumber}
                        {q.unitHint || ''})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
