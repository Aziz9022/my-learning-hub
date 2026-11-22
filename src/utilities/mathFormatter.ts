import katex from 'katex';

/**
 * Carefully converts plain-text mathematical expressions from the reference
 * document into KaTeX-compatible LaTeX.
 *
 * Conservative by design: if a line is predominantly English prose or fails
 * KaTeX parsing, returns null so the renderer preserves the exact original
 * plain-text notation without garbling anything.
 */
export function isLikelyMathLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 210) return false;
  // Reject obvious English prose sentences (more than 7 plain 4+-letter words)
  const longWords = trimmed.match(/\b[a-zA-Z]{4,}\b/g) || [];
  const mathKeywords = new Set([
    'sqrt', 'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'arctan', 'arcsin', 'arccos',
    'exp', 'log', 'ln', 'lim', 'sum', 'prod', 'int', 'det', 'diag', 'rank', 'cond',
    'Var', 'Cov', 'Corr', 'arg', 'argmax', 'argmin', 'min', 'max', 'floor', 'ceil',
    'sigma', 'Sigma', 'mu', 'lambda', 'Lambda', 'theta', 'Theta', 'alpha', 'beta',
    'gamma', 'Gamma', 'delta', 'Delta', 'epsilon', 'eps', 'rho', 'phi', 'Phi', 'psi',
    'omega', 'Omega', 'pi', 'inf', 'infty', 'partial', 'PARTIAL', 'grad', 'span',
    'null', 'true', 'false', 'with', 'for', 'all', 'and', 'then', 'iff', 'where',
    'else', 'when', 'such', 'that', 'from', 'both', 'each', 'mean', 'median', 'bias',
    'Bias', 'Noise', 'Gain', 'Impurity', 'child', 'parent', 'loss', 'score', 'error',
    'Precision', 'Recall', 'Accuracy', 'Sens', 'Spec', 'PPV', 'NPV', 'SST', 'SSR', 'SSE',
    'MSE', 'RMSE', 'MAE', 'VIF', 'IQR', 'ECDF', 'PDF', 'PMF', 'CDF', 'OOB', 'AUC', 'ROC',
  ]);
  const proseWords = longWords.filter((w) => !mathKeywords.has(w));
  if (proseWords.length > 5) return false;

  // Must contain clear math operators or notation
  return /[=<>^_]|\\|\b(sum|prod|int|lim|sqrt|det|grad|PARTIAL|partial|sigma|lambda|mu|theta|alpha|beta|inf)\b/.test(
    trimmed
  );
}

export function plainMathToLatex(expr: string): string {
  let s = expr.trim();

  // Protect trailing parenthetical short notes like "(a > 0)" or "(for n != -1)"
  let trailingNote = '';
  const noteMatch = s.match(/\s{2,}(\([^()]{2,55}\))$/);
  if (noteMatch) {
    trailingNote = noteMatch[1];
    s = s.slice(0, noteMatch.index).trim();
  }

  // Handle common text operators & arrows
  s = s.replace(/<=>/g, ' \\iff ');
  s = s.replace(/=>/g, ' \\implies ');
  s = s.replace(/->/g, ' \\to ');
  s = s.replace(/<=/g, ' \\le ');
  s = s.replace(/>=/g, ' \\ge ');
  s = s.replace(/!=/g, ' \\ne ');
  s = s.replace(/\+\/-/g, ' \\pm ');
  s = s.replace(/\bapprox\b/g, ' \\approx ');
  s = s.replace(/\binf\b/g, ' \\infty ');
  s = s.replace(/\bsubset\b/g, ' \\subset ');
  s = s.replace(/\bin\b(?=\s*[A-Z{])/g, ' \\in ');
  s = s.replace(/\bOR\b/g, ' \\text{ or } ');
  s = s.replace(/\bAND\b/g, ' \\text{ and } ');
  s = s.replace(/\bif\b/g, ' \\text{ if } ');
  s = s.replace(/\bfor all\b/g, ' \\text{ for all } ');
  s = s.replace(/\bsubject to\b/g, ' \\quad \\text{s.t. } ');
  s = s.replace(/\bminimize\b/g, ' \\min ');
  s = s.replace(/\bmaximize\b/g, ' \\max ');

  // sum[i=1..n], prod[i=1..n], int[a..b], lim[x -> a]
  s = s.replace(/sum\[([^\]]+?)\.\.([^\]]+?)\]/g, '\\sum_{$1}^{$2}');
  s = s.replace(/sum\[([^\]]+?)\]/g, '\\sum_{$1}');
  s = s.replace(/prod\[([^\]]+?)\.\.([^\]]+?)\]/g, '\\prod_{$1}^{$2}');
  s = s.replace(/int\[([^\]]+?)\.\.([^\]]+?)\]/g, '\\int_{$1}^{$2}');
  s = s.replace(/\bint\b/g, '\\int ');
  s = s.replace(/lim\[([^\]]+?)\]/g, '\\lim_{$1}');
  s = s.replace(/\blim\b/g, '\\lim ');

  // Partial derivative & gradient
  s = s.replace(/\bPARTIAL\b/g, '\\partial ');
  s = s.replace(/\bpartial\b/g, '\\partial ');
  s = s.replace(/\bgrad\b/g, '\\nabla ');

  // Common decorated statistical symbols
  s = s.replace(/\bx_bar\b/g, '\\bar{x}');
  s = s.replace(/\by_bar\b/g, '\\bar{y}');
  s = s.replace(/\bd_bar\b/g, '\\bar{d}');
  s = s.replace(/\by_hat\b/g, '\\hat{y}');
  s = s.replace(/\bp_hat\b/g, '\\hat{p}');
  s = s.replace(/\bx_hat\b/g, '\\hat{x}');
  s = s.replace(/\bbeta_hat\b/g, '\\hat{\\beta}');
  s = s.replace(/\btheta_hat\b/g, '\\hat{\\theta}');
  s = s.replace(/\bsigma_hat\b/g, '\\hat{\\sigma}');
  s = s.replace(/\bmu_hat\b/g, '\\hat{\\mu}');

  // sqrt(...) -> \sqrt{...}
  s = s.replace(/sqrt\(([^()]+)\)/g, '\\sqrt{$1}');

  // Parenthesized exponents/subscripts: x^(n-1) -> x^{n-1}, a_(n+1) -> a_{n+1}
  s = s.replace(/\^\(([^()]+)\)/g, '^{$1}');
  s = s.replace(/_\(([^()]+)\)/g, '_{$1}');

  // Multi-char subscripts like x_ij, mu_0, sigma_1, log_2, log_b
  s = s.replace(/_([a-zA-Z0-9]+)/g, '_{$1}');
  s = s.replace(/\^([a-zA-Z0-9]+)/g, '^{$1}');

  // Greek letters (word boundary)
  const greek = [
    'alpha', 'beta', 'gamma', 'Gamma', 'delta', 'Delta', 'epsilon',
    'theta', 'Theta', 'lambda', 'Lambda', 'mu', 'pi', 'rho',
    'sigma', 'Sigma', 'phi', 'Phi', 'psi', 'omega', 'Omega',
  ];
  for (const g of greek) {
    s = s.replace(new RegExp(`\\b${g}\\b`, 'g'), `\\${g}`);
  }
  s = s.replace(/\beps\b/g, '\\varepsilon');

  // Named math functions
  s = s.replace(/\blog2\b/g, '\\log_2');
  s = s.replace(/\blog10\b/g, '\\log_{10}');
  for (const fn of ['sin', 'cos', 'tan', 'sec', 'arctan', 'arcsin', 'arccos', 'ln', 'log', 'exp', 'det', 'argmax', 'argmin', 'Var', 'Cov']) {
    s = s.replace(new RegExp(`(?<!\\\\)\\b${fn}\\b`, 'g'), fn === 'Var' || fn === 'Cov' ? `\\operatorname{${fn}}` : `\\${fn}`);
  }

  // Clean multiplication star
  s = s.replace(/\s*\*\s*/g, ' \\cdot ');

  // Append protected trailing note
  if (trailingNote) {
    s += ` \\quad \\text{${trailingNote}}`;
  }

  return s;
}

export function renderKatexSafe(plainExpr: string, displayMode = true): string | null {
  try {
    const latex = plainMathToLatex(plainExpr);
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: true,
      strict: false,
      trust: false,
    });
  } catch {
    return null;
  }
}

export function renderDirectLatex(latex: string, displayMode = false): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
    });
  } catch {
    return latex;
  }
}
