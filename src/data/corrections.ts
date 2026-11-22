import type { CorrectionEntry, VerificationStatus } from '../types/content';

/**
 * Transparent Fact-Checking & Correction Log.
 * Every entry below was genuinely inspected against the source file
 * (Math_Stats_CS_DS_Reference.txt), independently recomputed where numerical,
 * and cross-checked against standard academic textbooks and official documentation.
 *
 * Original content is NEVER silently altered: every correction keeps three layers
 * (Original Source, Verified/Corrected Explanation, and Verification Note).
 */
export const CORRECTION_LOG: CorrectionEntry[] = [
  // ===================== CORRECTIONS MADE =====================
  {
    id: 'CORR-01',
    moduleId: 12,
    sectionId: '12.6',
    formulaId: 'F12.6',
    partId: 'A',
    category: 'Mathematical Accuracy',
    originalStatement:
      'General n-variable version (H symmetric at a critical point): H positive definite (all eigenvalues > 0) -> local minimum; H negative definite (all eigenvalues < 0) -> local maximum; H indefinite (eigenvalues of both signs) -> saddle; H singular (some eigenvalue 0) -> inconclusive.',
    correctedStatement:
      'General n-variable version (H symmetric at a critical point): H positive definite (all eigenvalues > 0) -> local minimum; H negative definite (all eigenvalues < 0) -> local maximum; H indefinite (at least one positive AND at least one negative eigenvalue, even if 0 is also an eigenvalue) -> saddle point; H positive semidefinite or negative semidefinite and singular (all eigenvalues >= 0 or all <= 0, with at least one 0) -> inconclusive.',
    explanation:
      'A singular Hessian can still be indefinite when n >= 3. For example, f(x, y, z) = x^2 - y^2 + z^4 has critical point (0, 0, 0) with diagonal Hessian diag(2, -2, 0). Even though one eigenvalue is 0 (making H singular), f increases along the x-axis and decreases along the y-axis, so the origin is strictly a saddle point, not inconclusive.',
    reasonForCorrection:
      'Logical overlap between "indefinite" and "singular" cases in dimensions n >= 3 caused singular-indefinite saddle points to be misclassified as inconclusive.',
    referenceTitle: 'Nocedal & Wright, Numerical Optimization (2nd ed., Theorem 2.2–2.4) / MIT OCW 18.02SC',
    referenceUrl: 'https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/',
    status: 'Correction made',
  },
  {
    id: 'CORR-02',
    moduleId: 19,
    sectionId: '19.1',
    formulaId: 'F19.1',
    partId: 'B',
    category: 'Algorithm & Complexity',
    originalStatement:
      'n = 1,000,000: balanced height <= 19, a chain would be 999,999 deep.',
    correctedStatement:
      'n = 1,000,000: minimum possible height = floor(log2(1,000,000)) = 19 (complete binary tree; every binary tree with 1,000,000 nodes has height h >= 19). A balanced AVL tree with 1,000,000 nodes has height between 19 and 28 (<= 1.44 log2(n + 2)), whereas a degenerate chain has height 999,999.',
    explanation:
      'Since 2^19 = 524,288 < 1,000,000 < 2^20 = 1,048,576, a binary tree of height h <= 18 can hold at most 2^19 - 1 = 524,287 nodes. Therefore, no binary tree with 1,000,000 nodes can have height less than 19; the inequality direction "<= 19" was inverted.',
    reasonForCorrection:
      'Reversing the inequality direction implied a binary tree of 1,000,000 nodes could have height strictly below 19, contradicting F19.1\'s own bound floor(log2 n) <= h <= n - 1.',
    referenceTitle: 'Cormen, Leiserson, Rivest & Stein (CLRS), Introduction to Algorithms, Ch. 12–13',
    referenceUrl: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/',
    status: 'Correction made',
  },
  {
    id: 'CORR-03',
    moduleId: 10,
    sectionId: '10.6',
    formulaId: 'F10.6',
    partId: 'A',
    category: 'Notation & Consistency',
    originalStatement:
      'F10.6: cond(A) = sigma_1 / sigma_r (where r = rank(A), sigma_r > 0). F10.7: Condition number cond(A) = sigma_max / sigma_min.',
    correctedStatement:
      'For a full-rank square (or full-column-rank) matrix, sigma_r = sigma_min > 0, so both expressions agree: cond(A) = sigma_max / sigma_min. For a rank-deficient matrix (sigma_min = 0), the standard matrix condition number is infinite (cond(A) = infinity, as returned by numpy.linalg.cond(A)), whereas sigma_1 / sigma_r = ||A||_2 ||A^+||_2 is the finite Moore-Penrose pseudoinverse (effective) condition number.',
    explanation:
      'Modules 10.6 and 10.7 write two different formulas under the same symbol cond(A). For rank-deficient matrices such as A = diag(2, 0), sigma_1 / sigma_r = 2/2 = 1 while sigma_max / sigma_min = 2/0 = infinity.',
    reasonForCorrection:
      'Inconsistent definition across adjacent sections F10.6 and F10.7 for rank-deficient matrices; clarified to match NumPy and standard numerical linear algebra conventions.',
    referenceTitle: 'NumPy Official Documentation — numpy.linalg.cond',
    referenceUrl: 'https://numpy.org/doc/stable/reference/generated/numpy.linalg.cond.html',
    status: 'Correction made',
  },
  {
    id: 'CORR-04',
    moduleId: 20,
    sectionId: '20.4',
    partId: 'B',
    category: 'Algorithm & Complexity',
    originalStatement:
      'COMPARISON TABLE: SORTING ALGORITHMS — Quick: Best O(n log n), Average O(n log n), Worst O(n^2), Space O(log n), Stable no, In-place yes.',
    correctedStatement:
      'Quick Sort extra space: O(log n) average recursion stack, O(n) worst-case recursion stack for naive two-sided recursion (as in the Module 20.3 Python implementation). Worst-case stack space is reduced to O(log n) only when recursing on the smaller partition first and converting the larger partition into a tail loop.',
    explanation:
      'The comparison table in Section 20.4 lists O(log n) space unconditionally, conflicting with Section 20.3\'s own prose ("Space: O(log n) average recursion stack, O(n) worst") and the naive recursive quicksort code shown immediately above.',
    reasonForCorrection:
      'Table compressed average and worst-case auxiliary space into a single O(log n) cell without noting the O(n) worst-case stack depth for standard recursion.',
    referenceTitle: 'CLRS, Introduction to Algorithms, Ch. 7 (Problem 7-4: Stack Depth for Quicksort)',
    referenceUrl: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/',
    status: 'Correction made',
  },
  {
    id: 'CORR-05',
    moduleId: 19,
    sectionId: '19.2',
    formulaId: 'F19.2',
    partId: 'B',
    category: 'Algorithm & Complexity',
    originalStatement:
      'BUILD-HEAP from an unsorted array: sift-down every internal node from index n/2 - 1 down to 0: O(n) (not n log n).',
    correctedStatement:
      'BUILD-HEAP from an unsorted 0-indexed array: sift-down every internal node from index floor(n/2) - 1 (in Python: n // 2 - 1) down to 0: O(n) time.',
    explanation:
      'For odd array lengths (e.g., n = 5), real division n/2 - 1 evaluates to 1.5, which is not a valid array index. Integer floor division floor(n/2) - 1 gives index 1, which is indeed the last internal node of a 5-element 0-indexed heap.',
    reasonForCorrection:
      'Missing floor operator in 0-indexed BUILD-HEAP starting index.',
    referenceTitle: 'CLRS, Introduction to Algorithms, Ch. 6.3 (Building a Heap)',
    referenceUrl: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/',
    status: 'Correction made',
  },
  {
    id: 'CORR-06',
    moduleId: 1,
    sectionId: '1.3',
    formulaId: 'F1.7',
    partId: 'A',
    category: 'Cross-Reference',
    originalStatement:
      'J. RELATED: combinations (F33.x), Taylor series (Module 5).',
    correctedStatement:
      'J. RELATED: combinations (F33.7), Taylor series (Module 5, F5.6).',
    explanation:
      'An unresolved placeholder reference "F33.x" remained in the published text. Combinations are formally defined in Formula F33.7 (Module 33, Section 33.4).',
    reasonForCorrection:
      'Unresolved placeholder formula ID left in final text.',
    referenceTitle: 'Internal Cross-Reference Audit (Appendix E — Formula F33.7)',
    referenceUrl: '#/formulas',
    status: 'Correction made',
  },
  {
    id: 'CORR-07',
    moduleId: 1,
    sectionId: '1.3',
    formulaId: 'F1.8',
    partId: 'A',
    category: 'Cross-Reference',
    originalStatement:
      'J. RELATED: completing the square also gives vertex form; polynomial factorization; eigenvalues of 2x2 matrices solve a quadratic (F9.x).',
    correctedStatement:
      'J. RELATED: completing the square also gives vertex form; polynomial factorization; eigenvalues of 2x2 matrices solve a quadratic characteristic equation (F9.2).',
    explanation:
      'An unresolved placeholder reference "F9.x" remained in the text. The characteristic equation for finding eigenvalues is Formula F9.2 (Module 9, Section 9.2).',
    reasonForCorrection:
      'Unresolved placeholder formula ID left in final text.',
    referenceTitle: 'Internal Cross-Reference Audit (Appendix E — Formula F9.2)',
    referenceUrl: '#/formulas',
    status: 'Correction made',
  },
  {
    id: 'CORR-08',
    moduleId: 17,
    sectionId: '17.3',
    formulaId: 'F17.1',
    partId: 'B',
    category: 'Cross-Reference',
    originalStatement:
      'J. RELATED: limits (F2.x): if lim f(n)/g(n) = L with 0 < L < inf then f = Theta(g); if L = 0, f = O(g) (and f != Theta(g)).',
    correctedStatement:
      'J. RELATED: limits (F2.2, F2.3, F2.5 — limit laws, squeeze theorem, L\'Hopital\'s rule): if lim[n -> inf] f(n)/g(n) = L with 0 < L < inf then f = Theta(g); if L = 0, f = o(g) (hence f = O(g) and f != Theta(g)).',
    explanation:
      'Unresolved placeholder "F2.x" replaced with exact Module 2 formula IDs, and explicitly noted the limit is as n -> inf.',
    reasonForCorrection:
      'Unresolved placeholder formula ID left in final text.',
    referenceTitle: 'Internal Cross-Reference Audit (Appendix E — Module 2)',
    referenceUrl: '#/formulas',
    status: 'Correction made',
  },
  {
    id: 'CORR-09',
    moduleId: 9,
    sectionId: '9.4',
    formulaId: 'F9.3',
    partId: 'A',
    category: 'Cross-Reference',
    originalStatement:
      'Not diagonalizable: defective matrices (F9 section 9.3).',
    correctedStatement:
      'Not diagonalizable: defective matrices (Module 9, section 9.3).',
    explanation:
      'Malformed label "F9 section 9.3" conflated formula prefix "F" with module numbering; Section 9.3 covers algebraic vs. geometric multiplicity and defective matrices.',
    reasonForCorrection:
      'Typographical cross-reference slip.',
    referenceTitle: 'Internal Cross-Reference Audit (Module 9, Section 9.3)',
    referenceUrl: '#/module/9',
    status: 'Correction made',
  },
  {
    id: 'CORR-10',
    moduleId: 0,
    sectionId: 'Appendix E / F',
    partId: 'Appendix',
    category: 'Metadata & Indexing',
    originalStatement:
      'Appendix E: "Total indexed formulas and rules: 236". Appendix F.1: "Approximate length: 15379 lines, 124034 words". Appendix F.2 item 10: "every formula ID mentioned in the text was checked automatically and exists in Appendix E."',
    correctedStatement:
      'There are 236 module formula blocks (F1.1–F48.7) plus 1 Appendix D formula block (F-D.1), totaling 237 formula blocks. Exact file metrics are 15,461 lines and 124,750 words (Appendix F itself added ~82 lines / 716 words after the count was recorded). Three wildcard formula references (F33.x, F9.x, F2.x) remained unresolved and are corrected in CORR-06 through CORR-08.',
    explanation:
      'Automated line/word counting and regex auditing over the entire 15,461-line source file revealed the exact totals and caught the three unresolved ".x" placeholders missed by a numeric-only regex check.',
    reasonForCorrection:
      'Ensure transparent, exact accounting of document size, formula totals, and cross-reference completeness.',
    referenceTitle: 'Automated Full-File Structural Audit Script (scripts/parse_source.mjs)',
    referenceUrl: '#/appendices',
    status: 'Correction made',
  },

  // ===================== INDEPENDENTLY VERIFIED =====================
  {
    id: 'VER-01',
    moduleId: 30,
    sectionId: '30.4',
    formulaId: 'F30.3',
    partId: 'C',
    category: 'Numerical Verification',
    originalStatement:
      'Data 2, 3, 3, 4, 4, 4, 5, 5, 6, 9: g1 = 1.12 (1/n moment form), G1 = 1.33 (adjusted).',
    correctedStatement:
      'Verified exact: mean = 4.5, m2 = 3.45, m3 = 7.20, g1 = m3 / m2^(3/2) = 1.1236 (1.12), G1 = sqrt(90)/8 * g1 = 1.3324 (1.33).',
    explanation:
      'Recomputed independently in IEEE-754 double precision. Both moment skewness g1 and adjusted Fisher-Pearson sample skewness G1 match the source text to two decimal places.',
    reasonForCorrection:
      'Independent numerical verification passed without error.',
    referenceTitle: 'SciPy Official Documentation — scipy.stats.skew',
    referenceUrl: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.skew.html',
    status: 'Verified',
  },
  {
    id: 'VER-02',
    moduleId: 39,
    sectionId: '39.7',
    formulaId: 'F39.8',
    partId: 'C',
    category: 'Numerical Verification',
    originalStatement:
      'Welch two-sample example (Group A mean 24.125, s^2 = 4.125; Group B mean 21.375, s^2 = 2.839): SE = 0.933, T = 2.947, Welch df = 13.5, Cohen\'s d = 1.47. Paired example: d_bar = -3.167, s_d = 2.317, SE = 0.946, T = -3.348.',
    correctedStatement:
      'Verified exact: Welch SE = 0.9330, T = 2.9474, Welch-Satterthwaite df = 13.5386, pooled s_p = 1.8661, Cohen\'s d = 1.4737. Paired d_bar = -3.1667, s_d = 2.3166, SE = 0.9458, T = -3.3483.',
    explanation:
      'All raw sample values from both worked examples in Section 39.7 were independently recomputed from scratch and match every reported statistic.',
    reasonForCorrection:
      'Independent numerical verification passed without error.',
    referenceTitle: 'SciPy Official Documentation — scipy.stats.ttest_ind / ttest_rel',
    referenceUrl: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html',
    status: 'Verified',
  },
  {
    id: 'VER-03',
    moduleId: 40,
    sectionId: '40.5',
    formulaId: 'F40.7',
    partId: 'C',
    category: 'Numerical Verification',
    originalStatement:
      'Adding (15, 3) to base data gives fit y = 3.987 - 0.031 x, R^2 = 0.018, leverage h_66 = 0.936, Cook\'s distance = 18.8.',
    correctedStatement:
      'Verified exact: b0 = 3.9872, b1 = -0.0308, R^2 = 0.0180, MSE = 1.6776, e_6 = -0.5256, h_66 = 0.9359, D_6 = 18.7563 (rounds to 18.8).',
    explanation:
      'Recomputed OLS normal equations, hat-matrix diagonal, residual MSE, and Cook\'s distance independently. Every figure matches within stated rounding.',
    reasonForCorrection:
      'Independent numerical verification passed without error.',
    referenceTitle: 'Cook (1977), Detection of Influential Observation in Linear Regression, Technometrics 19(1)',
    referenceUrl: 'https://www.jstor.org/stable/1268249',
    status: 'Verified',
  },
  {
    id: 'VER-04',
    moduleId: 20,
    sectionId: '20.1',
    formulaId: 'F20.1',
    partId: 'B',
    category: 'Numerical Verification',
    originalStatement:
      'n = 3: log2(6) = 2.58 -> at least 3 comparisons; n = 10: log2(10!) = 21.8 -> at least 22; n = 1000: about 8,530. Merge sort worst-case comparisons for n = 8: n log2 n - n + 1 = 17.',
    correctedStatement:
      'Verified exact: log2(3!) = 2.5850, log2(10!) = 21.7911, log2(1000!) = 8529.40, and 8 * 3 - 8 + 1 = 17.',
    explanation:
      'Recomputed factorial logarithms and merge-sort exact worst-case comparison bound for powers of 2.',
    reasonForCorrection:
      'Independent numerical verification passed without error.',
    referenceTitle: 'Knuth, The Art of Computer Programming, Vol. 3: Sorting and Searching',
    referenceUrl: 'https://www-cs-faculty.stanford.edu/~knuth/taocp.html',
    status: 'Verified',
  },
  {
    id: 'VER-05',
    moduleId: 26,
    sectionId: '26.4',
    formulaId: 'F26.4',
    partId: 'B',
    category: 'Numerical Verification',
    originalStatement:
      'Chan et al. merge of A = [2,4,6] and B = [8,10]: delta = 5, m = 6, M2 = 8 + 2 + 25*6/5 = 40, sample variance 40/4 = 10, population variance 40/5 = 8.',
    correctedStatement:
      'Verified exact: direct computation on [2,4,6,8,10] gives mean = 6, M2 = 40, s^2 = 10, sigma^2 = 8; Chan merge matches identically.',
    explanation:
      'Checked algebraic identity and worked example for parallel one-pass variance aggregation.',
    reasonForCorrection:
      'Independent numerical verification passed without error.',
    referenceTitle: 'Chan, Golub & LeVeque (1979), Updating Formulae and a Pairwise Algorithm for Computing Sample Variances',
    referenceUrl: 'https://i.stanford.edu/pub/cstr/reports/cs/tr/79/773/CS-TR-79-773.pdf',
    status: 'Verified',
  },
  {
    id: 'VER-06',
    moduleId: 44,
    sectionId: '44.2',
    formulaId: 'F44.2',
    partId: 'D',
    category: 'Software & Environment',
    originalStatement:
      'Modules 44 and 46 reference scikit-learn 1.9 for experimental runs; Gini/Entropy worked examples give (0.6, 0.4) -> Gini 0.48, Entropy 0.971 bits; (0.5, 0.3, 0.2) -> Gini 0.62, Entropy 1.485 bits.',
    correctedStatement:
      'Verified: scikit-learn 1.9.0 (June 2026) and 1.9.1 (September 2026) are official stable releases. Gini and Shannon entropy values verified exact: 1 - (0.36 + 0.16) = 0.48; -(0.6 log2 0.6 + 0.4 log2 0.4) = 0.97095 bits; -(0.5 log2 0.5 + 0.3 log2 0.3 + 0.2 log2 0.2) = 1.48548 bits.',
    explanation:
      'Cross-checked scikit-learn release history against official scikit-learn release notes and independently recomputed all node impurity calculations.',
    reasonForCorrection:
      'Independent verification of software version claim and impurity arithmetic passed.',
    referenceTitle: 'scikit-learn Official Release History & Decision Trees Documentation',
    referenceUrl: 'https://scikit-learn.org/stable/modules/tree.html',
    status: 'Verified',
  },
  {
    id: 'VER-07',
    moduleId: 48,
    sectionId: '48.3',
    formulaId: 'F48.3',
    partId: 'D',
    category: 'Mathematical Accuracy',
    originalStatement:
      'Two-class LDA linear boundary: w = Sigma^(-1)(mu_1 - mu_0), b = -(1/2)(mu_1 + mu_0)^T Sigma^(-1)(mu_1 - mu_0) + ln(pi_1 / pi_0).',
    correctedStatement:
      'Verified exact: because Sigma^(-1) is symmetric, (mu_1 + mu_0)^T Sigma^(-1)(mu_1 - mu_0) expands cleanly to mu_1^T Sigma^(-1) mu_1 - mu_0^T Sigma^(-1) mu_0, matching delta_1(x) - delta_0(x) = 0.',
    explanation:
      'Algebraic derivation checked directly against Bayes discriminant expansion under shared covariance Sigma.',
    reasonForCorrection:
      'Independent mathematical verification passed without error.',
    referenceTitle: 'Hastie, Tibshirani & Friedman, The Elements of Statistical Learning (2nd ed., Ch. 4.3)',
    referenceUrl: 'https://hastie.su.domains/ElemStatLearn/',
    status: 'Verified',
  },
  {
    id: 'VER-08',
    moduleId: 33,
    sectionId: '33.4',
    formulaId: 'F33.8',
    partId: 'C',
    category: 'Numerical Verification',
    originalStatement:
      '5-card hand from 52 cards: P(exactly 2 hearts) = C(13,2)C(39,3)/C(52,5) = 712,842 / 2,598,960 = 0.2743; P(three hearts in a row) = 1716 / 132,600 = 0.01294.',
    correctedStatement:
      'Verified exact: 78 * 9139 = 712,842; 712,842 / 2,598,960 = 0.274280; 13*12*11 / (52*51*50) = 1716 / 132,600 = 0.012941.',
    explanation:
      'Combinatorial counts and probabilities independently recomputed.',
    reasonForCorrection:
      'Independent numerical verification passed without error.',
    referenceTitle: 'Blitzstein & Hwang, Introduction to Probability (2nd ed., Ch. 1–3)',
    referenceUrl: 'https://projects.iq.harvard.edu/stat110/home',
    status: 'Verified',
  },
  {
    id: 'VER-09',
    moduleId: 28,
    sectionId: '28.4',
    formulaId: 'F28.1',
    partId: 'B',
    category: 'Numerical Verification',
    originalStatement:
      'Amdahl\'s Law: f = 0.9, p = 8 -> S = 4.71 (58.8% efficiency); f = 0.95, p = 16 -> S = 9.14; p = 64 -> S = 15.4.',
    correctedStatement:
      'Verified exact: 1/(0.1 + 0.9/8) = 4.7059 (eff. 58.82%); 1/(0.05 + 0.95/16) = 9.1429; 1/(0.05 + 0.95/64) = 15.4217.',
    explanation:
      'All Amdahl speedup and parallel efficiency numbers independently verified.',
    reasonForCorrection:
      'Independent numerical verification passed without error.',
    referenceTitle: 'Hennessy & Patterson, Computer Architecture: A Quantitative Approach',
    referenceUrl: 'https://www.elsevier.com/books/computer-architecture/hennessy/978-0-12-811905-1',
    status: 'Verified',
  },

  // ===================== NEEDS VERIFICATION =====================
  {
    id: 'CHECK-01',
    moduleId: 40,
    sectionId: '40.4',
    partId: 'C',
    category: 'Software & Environment',
    originalStatement:
      'Module 40 & 41 quote statsmodels OLS summary figures (coefficients, SEs, t-values, R^2). Appendix F.3 notes statsmodels was not installed in the original build environment.',
    correctedStatement:
      'Needs independent execution in a Python environment with statsmodels installed to confirm exact formatting and secondary diagnostics (Omnibus, Jarque-Bera, Durbin-Watson) alongside the verified core OLS coefficients.',
    explanation:
      'As transparently disclosed in Appendix F.3, the author computed core OLS coefficients via hand-written linear algebra rather than executing statsmodels.api.OLS().summary() directly.',
    reasonForCorrection:
      'Flagged honestly because external library execution was not performed in this static web environment.',
    referenceTitle: 'statsmodels Official Documentation — OLS Regression',
    referenceUrl: 'https://www.statsmodels.org/stable/regression.html',
    status: 'Needs verification',
  },
  {
    id: 'CHECK-02',
    moduleId: 46,
    sectionId: '46.2',
    partId: 'D',
    category: 'Software & Environment',
    originalStatement:
      'Synthetic machine-learning benchmark outputs across Modules 44–48 (trees, random forests, data-leakage CV demo, nested CV, SVM/LDA synthetic accuracy numbers).',
    correctedStatement:
      'Conceptual conclusions and formulas are verified; exact printed decimal accuracy scores depend on Python 3.12, NumPy 2.x, and scikit-learn 1.9 random seeds and should be reproduced locally if exact numbers are required.',
    explanation:
      'This static browser build cannot execute Python/scikit-learn natively; while the mathematical formulas behind every experiment were verified, the exact synthetic benchmark decimals are marked as needing local execution to reproduce verbatim.',
    reasonForCorrection:
      'Honest distinction between mathematically verified theory and runtime-dependent stochastic experiment numbers.',
    referenceTitle: 'scikit-learn Official Documentation — Cross-Validation & Model Evaluation',
    referenceUrl: 'https://scikit-learn.org/stable/modules/cross_validation.html',
    status: 'Needs verification',
  },
];

// Formulas explicitly verified during our automated + manual audit
const DIRECTLY_VERIFIED_FORMULAS = new Set<string>([
  'F1.1', 'F1.2', 'F1.3', 'F1.4', 'F1.6', 'F1.11', 'F1.12', 'F1.13', 'F1.14',
  'F2.2', 'F2.4', 'F2.5', 'F2.6', 'F2.7',
  'F3.1', 'F3.2', 'F3.4', 'F3.5', 'F3.6', 'F3.7', 'F3.8',
  'F4.1', 'F4.2', 'F4.3', 'F4.4', 'F4.6', 'F4.8',
  'F5.3', 'F5.4', 'F5.6',
  'F6.2', 'F6.3', 'F6.8', 'F6.9',
  'F8.7',
  'F9.1', 'F9.2', 'F9.4', 'F9.5',
  'F10.5', 'F10.8', 'F10.9',
  'F12.3', 'F12.4',
  'F13.2',
  'F14.3',
  'F15.2',
  'F16.1', 'F16.2', 'F16.3', 'F16.5',
  'F18.2',
  'F20.1', 'F20.2',
  'F23.2',
  'F24.1',
  'F26.4',
  'F27.5',
  'F28.1',
  'F29.1', 'F29.3',
  'F30.3',
  'F31.3', 'F31.4',
  'F32.1', 'F32.2',
  'F33.1', 'F33.6', 'F33.7', 'F33.8',
  'F34.5', 'F34.6',
  'F35.5', 'F35.6', 'F35.7', 'F35.8', 'F35.9',
  'F36.1', 'F36.2', 'F36.3', 'F36.5',
  'F37.2', 'F37.4', 'F37.6',
  'F38.3', 'F38.4',
  'F39.3', 'F39.4', 'F39.7', 'F39.8',
  'F40.2', 'F40.3', 'F40.6', 'F40.7', 'F40.8',
  'F42.1',
  'F43.2', 'F43.3', 'F43.4',
  'F44.2', 'F44.3', 'F44.4',
  'F45.3',
  'F46.1', 'F46.3', 'F46.5', 'F46.6',
  'F48.1', 'F48.3', 'F48.6', 'F48.7',
  'F-D.1',
]);

const CORRECTED_FORMULA_IDS = new Set<string>(
  CORRECTION_LOG.filter((c) => c.status === 'Correction made' && c.formulaId).map(
    (c) => c.formulaId as string
  )
);

export function getFormulaVerificationStatus(formulaId: string): VerificationStatus {
  if (CORRECTED_FORMULA_IDS.has(formulaId)) return 'Correction made';
  if (DIRECTLY_VERIFIED_FORMULAS.has(formulaId)) return 'Verified';
  return 'Not independently checked';
}

export function getCorrectionsForModule(moduleId: number): CorrectionEntry[] {
  return CORRECTION_LOG.filter((c) => c.moduleId === moduleId);
}

export function getCorrectionsForFormula(formulaId: string): CorrectionEntry[] {
  return CORRECTION_LOG.filter((c) => c.formulaId === formulaId);
}

export function getCorrectionsForSection(sectionId: string): CorrectionEntry[] {
  return CORRECTION_LOG.filter((c) => c.sectionId === sectionId);
}
