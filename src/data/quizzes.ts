import type { QuizQuestion } from '../types/content';

/**
 * Supplementary AI-Generated Practice Questions.
 * Derived strictly from verified concepts and formulas in the reference document.
 * Clearly labeled in the UI as "AI-Generated Practice (Supplementary)".
 */
export const PRACTICE_QUIZZES: QuizQuestion[] = [
  // PART A — MATHEMATICS
  {
    id: 'Q-M1-1',
    moduleId: 1,
    partId: 'A',
    sectionRef: '1.2 (F1.1, F1.2)',
    type: 'mcq',
    question: 'What is the exact solution set of the inequality |2x - 3| < 7?',
    options: ['(-2, 5)', '[-2, 5]', '(-inf, -2) U (5, inf)', '(2, 5)'],
    correctIndex: 0,
    explanation:
      'By F1.2, |2x - 3| < 7 <=> -7 < 2x - 3 < 7. Adding 3 gives -4 < 2x < 10, and dividing by 2 gives -2 < x < 5, i.e. (-2, 5).',
  },
  {
    id: 'Q-M2-1',
    moduleId: 2,
    partId: 'A',
    sectionRef: '2.4–2.5 (F2.4, F2.5)',
    type: 'numeric',
    question: 'Evaluate lim[x -> 0] (sin(5x) / x). Enter a numeric value.',
    correctNumber: 5,
    tolerance: 0.01,
    explanation:
      'Using the standard limit lim[u -> 0] sin(u)/u = 1 (F2.4), write sin(5x)/x = 5 * (sin(5x)/(5x)) -> 5 * 1 = 5 (or apply L\'Hopital\'s rule F2.5: 5 cos(0)/1 = 5).',
  },
  {
    id: 'Q-M3-1',
    moduleId: 3,
    partId: 'A',
    sectionRef: '3.3–3.4 (F3.7, F3.8)',
    type: 'mcq',
    question: 'What is the derivative d/dx [ ln(3x^2 + 1) ]?',
    options: [
      '6x / (3x^2 + 1)',
      '1 / (3x^2 + 1)',
      '3x / (3x^2 + 1)',
      '6x * ln(3x^2 + 1)',
    ],
    correctIndex: 0,
    explanation:
      'By the chain rule (F3.7) and d/du ln(u) = 1/u (F3.8), d/dx ln(g(x)) = g\'(x)/g(x) = 6x / (3x^2 + 1).',
  },
  {
    id: 'Q-M4-1',
    moduleId: 4,
    partId: 'A',
    sectionRef: '4.8 (F4.8)',
    type: 'mcq',
    question: 'For which values of p does the improper integral int[1..inf] (1 / x^p) dx converge?',
    options: ['p > 1', 'p >= 1', 'p < 1', 'p > 0'],
    correctIndex: 0,
    explanation:
      'By the p-test (F4.8), int[1..inf] x^(-p) dx converges if and only if p > 1 (to value 1/(p - 1)). At p = 1, the antiderivative is ln(x) -> inf, which diverges.',
  },
  {
    id: 'Q-M5-1',
    moduleId: 5,
    partId: 'A',
    sectionRef: '5.2 (F5.3)',
    type: 'numeric',
    question: 'Compute the sum of the infinite geometric series sum[k=0..inf] 3 * (1/4)^k.',
    correctNumber: 4,
    tolerance: 0.01,
    explanation:
      'By F5.3, since |r| = 1/4 < 1, the sum is a / (1 - r) = 3 / (1 - 0.25) = 3 / 0.75 = 4.',
  },
  {
    id: 'Q-M6-1',
    moduleId: 6,
    partId: 'A',
    sectionRef: '6.5 (F6.9)',
    type: 'numeric',
    question: 'Compute the determinant det(A) for A = [3  2 ; 1  4].',
    correctNumber: 10,
    tolerance: 0.01,
    explanation:
      'For a 2x2 matrix [a b ; c d], det(A) = ad - bc = (3)(4) - (2)(1) = 12 - 2 = 10.',
  },
  {
    id: 'Q-M8-1',
    moduleId: 8,
    partId: 'A',
    sectionRef: '8.5 (F8.7)',
    type: 'numeric',
    question:
      'A 5 x 8 matrix A has rank 3. By the Rank-Nullity Theorem (F8.7), what is the dimension of its null space (nullity)?',
    correctNumber: 5,
    tolerance: 0.01,
    explanation:
      'Rank-Nullity (F8.7) states rank(A) + nullity(A) = n (number of columns). Here n = 8 and rank = 3, so nullity = 8 - 3 = 5.',
  },
  {
    id: 'Q-M9-1',
    moduleId: 9,
    partId: 'A',
    sectionRef: '9.5 (F9.4)',
    type: 'mcq',
    question: 'Which property is guaranteed by the Spectral Theorem (F9.4) for every real symmetric matrix A = A^T?',
    options: [
      'All eigenvalues are real and A has an orthonormal basis of eigenvectors',
      'All eigenvalues are strictly positive',
      'A is always invertible (det A != 0)',
      'All eigenvalues are distinct',
    ],
    correctIndex: 0,
    explanation:
      'Every real symmetric matrix has real eigenvalues and can be orthogonally diagonalized as A = Q Lambda Q^T. Eigenvalues can be zero or negative or repeated.',
  },
  {
    id: 'Q-M10-1',
    moduleId: 10,
    partId: 'A',
    sectionRef: '10.6 (F10.6)',
    type: 'mcq',
    question: 'In the SVD A = U Sigma V^T, what are the singular values sigma_i equal to?',
    options: [
      'The square roots of the non-zero eigenvalues of A^T A',
      'The eigenvalues of A itself',
      'The diagonal entries of A',
      'The squared eigenvalues of A^T A',
    ],
    correctIndex: 0,
    explanation:
      'By F10.6, A^T A = V (Sigma^T Sigma) V^T, so the singular values satisfy sigma_i = sqrt(lambda_i(A^T A)) >= 0.',
  },
  {
    id: 'Q-M12-1',
    moduleId: 12,
    partId: 'A',
    sectionRef: '12.6 (F12.6 — Corrected)',
    type: 'mcq',
    question:
      'At a critical point of f(x, y, z), the symmetric Hessian has eigenvalues 2, -2, and 0. What is the critical point?',
    options: [
      'A saddle point (indefinite despite having a zero eigenvalue)',
      'Inconclusive solely because det(H) = 0',
      'A local minimum',
      'A local maximum',
    ],
    correctIndex: 0,
    explanation:
      'Because H has both a positive eigenvalue (+2) and a negative eigenvalue (-2), f increases in one direction and decreases in another, proving it is a saddle point (see CORR-01).',
  },
  {
    id: 'Q-M16-1',
    moduleId: 16,
    partId: 'A',
    sectionRef: '16.5 (F16.5)',
    type: 'numeric',
    question:
      'Apply one step of Euler\'s method (F16.5) to y\' = 2y with y(0) = 3 and step size h = 0.1. What is y_1?',
    correctNumber: 3.6,
    tolerance: 0.01,
    explanation:
      'y_1 = y_0 + h * f(t_0, y_0) = 3 + 0.1 * (2 * 3) = 3 + 0.6 = 3.6.',
  },

  // PART B — COMPUTER SCIENCE
  {
    id: 'Q-M17-1',
    moduleId: 17,
    partId: 'B',
    sectionRef: '17.3 (F17.1)',
    type: 'mcq',
    question: 'Which Big-Theta class simplifies 5n^2 + 100n log n + 40?',
    options: ['Theta(n^2)', 'Theta(n^2 log n)', 'Theta(n log n)', 'Theta(n^3)'],
    correctIndex: 0,
    explanation:
      'Drop constant factors and lower-order terms: n^2 dominates n log n and constants as n -> inf, giving Theta(n^2).',
  },
  {
    id: 'Q-M18-1',
    moduleId: 18,
    partId: 'B',
    sectionRef: '18.6 (F18.2)',
    type: 'mcq',
    question: 'Which traversal of a valid Binary Search Tree (BST) always visits keys in sorted ascending order?',
    options: ['In-order (Left, Node, Right)', 'Pre-order (Node, Left, Right)', 'Post-order (Left, Right, Node)', 'Level-order (BFS)'],
    correctIndex: 0,
    explanation:
      'Because all left-subtree keys are < node.key < all right-subtree keys (F18.2), an In-order traversal produces sorted output.',
  },
  {
    id: 'Q-M19-1',
    moduleId: 19,
    partId: 'B',
    sectionRef: '19.2 (F19.2)',
    type: 'numeric',
    question: 'In a 0-indexed binary heap stored in an array, what is the array index of the right child of node index 3?',
    correctNumber: 8,
    tolerance: 0.01,
    explanation:
      'By F19.2 (0-based indexing), left child = 2i + 1 = 7, and right child = 2i + 2 = 2(3) + 2 = 8.',
  },
  {
    id: 'Q-M20-1',
    moduleId: 20,
    partId: 'B',
    sectionRef: '20.1–20.4 (F20.1, F20.2)',
    type: 'mcq',
    question: 'Which sorting algorithm guarantees O(n log n) worst-case time AND is stable?',
    options: ['Merge Sort', 'Quick Sort', 'Heap Sort', 'Selection Sort'],
    correctIndex: 0,
    explanation:
      'Merge Sort always runs in Theta(n log n) time and preserves relative order of equal keys when using <= in the merge step. Quick Sort is O(n^2) worst-case and unstable; Heap Sort is unstable.',
  },
  {
    id: 'Q-M23-1',
    moduleId: 23,
    partId: 'B',
    sectionRef: '23.2 (F23.2)',
    type: 'mcq',
    question: 'By De Morgan\'s Law (F23.2), NOT (A AND B) is logically equivalent to:',
    options: ['(NOT A) OR (NOT B)', '(NOT A) AND (NOT B)', 'A OR (NOT B)', 'NOT (A OR B)'],
    correctIndex: 0,
    explanation:
      'De Morgan\'s law states !(A && B) = (!A) || (!B), flipping AND to OR while negating each operand.',
  },
  {
    id: 'Q-M26-1',
    moduleId: 26,
    partId: 'B',
    sectionRef: '26.4 (F26.4)',
    type: 'mcq',
    question: 'Why does taking the simple average of partition variances underestimate the global variance across sharded data?',
    options: [
      'It omits the between-partition scatter term proportional to (mean_A - mean_B)^2',
      'It double-counts the sample size n',
      'Variance is distributive like SUM and COUNT',
      'Bessel\'s correction always makes local variances too large',
    ],
    correctIndex: 0,
    explanation:
      'By Chan et al.\'s parallel merge formula (F26.4), total M2 = M2_A + M2_B + delta^2 * n_A * n_B / (n_A + n_B). Ignoring the between-group delta^2 term misses how far apart the partition means lie.',
  },
  {
    id: 'Q-M28-1',
    moduleId: 28,
    partId: 'B',
    sectionRef: '28.4 (F28.1)',
    type: 'numeric',
    question:
      'A program has parallelizable fraction f = 0.80 (20% serial). By Amdahl\'s Law (F28.1), what is the theoretical maximum speedup S_max as processors p -> infinity?',
    correctNumber: 5,
    tolerance: 0.01,
    explanation:
      'S_max = 1 / (1 - f) = 1 / (1 - 0.80) = 1 / 0.20 = 5.',
  },

  // PART C — STATISTICS
  {
    id: 'Q-M31-1',
    moduleId: 31,
    partId: 'C',
    sectionRef: '31.3–31.4 (F31.3, F31.4)',
    type: 'mcq',
    question: 'In Python, what is the default denominator convention for NumPy np.var(x) vs. pandas Series.var()?',
    options: [
      'NumPy defaults to ddof=0 (population, /n); pandas defaults to ddof=1 (sample, /(n-1))',
      'Both default to ddof=1 (sample)',
      'Both default to ddof=0 (population)',
      'NumPy defaults to ddof=1; pandas defaults to ddof=0',
    ],
    correctIndex: 0,
    explanation:
      'As highlighted in the Notation Conventions and Module 31/41, np.var defaults to ddof=0 (dividing by n), while pandas .var() defaults to ddof=1 (Bessel\'s correction, dividing by n-1).',
  },
  {
    id: 'Q-M34-1',
    moduleId: 34,
    partId: 'C',
    sectionRef: '34.5 (F34.6)',
    type: 'numeric',
    question:
      'A screening test has sensitivity 95%, specificity 90%, and disease prevalence 1%. What is the Positive Predictive Value (PPV) as a percentage (e.g., enter 8.76 for 8.76%)?',
    correctNumber: 8.76,
    tolerance: 0.1,
    unitHint: '%',
    explanation:
      'Out of 10,000 people: 100 are sick (95 test +), 9,900 are healthy (990 test +). PPV = 95 / (95 + 990) = 95 / 1085 = 0.08756 = 8.76%.',
  },
  {
    id: 'Q-M35-1',
    moduleId: 35,
    partId: 'C',
    sectionRef: '35.7 (F35.7)',
    type: 'numeric',
    question: 'If X ~ Binomial(n = 20, p = 0.3), what is the variance Var(X)?',
    correctNumber: 4.2,
    tolerance: 0.01,
    explanation:
      'By F35.7, Var(X) = n * p * (1 - p) = 20 * 0.3 * 0.7 = 4.2.',
  },
  {
    id: 'Q-M37-1',
    moduleId: 37,
    partId: 'C',
    sectionRef: '37.2 (F37.2, F37.8)',
    type: 'mcq',
    question: 'To cut the standard error of the sample mean SE = sigma / sqrt(n) in HALF, by what factor must you increase sample size n?',
    options: ['4x (quadruple n)', '2x (double n)', '8x', 'sqrt(2)x'],
    correctIndex: 0,
    explanation:
      'Because SE scales as 1 / sqrt(n), multiplying n by 4 divides SE by sqrt(4) = 2.',
  },
  {
    id: 'Q-M39-1',
    moduleId: 39,
    partId: 'C',
    sectionRef: '39.4 (F39.5)',
    type: 'mcq',
    question: 'Which statement correctly defines a p-value?',
    options: [
      'The probability, assuming H0 is true, of observing a test statistic at least as extreme as the observed one',
      'The probability that the null hypothesis H0 is true',
      'The probability that the result occurred purely by chance regardless of H0',
      '1 minus the probability that H1 is true',
    ],
    correctIndex: 0,
    explanation:
      'A p-value is P(data as or more extreme | H0 is true), NOT P(H0 is true | data) (prosecutor\'s fallacy).',
  },
  {
    id: 'Q-M40-1',
    moduleId: 40,
    partId: 'C',
    sectionRef: '40.6 (F40.8)',
    type: 'mcq',
    question: 'What is the primary statistical consequence of strong multicollinearity among predictors in OLS regression?',
    options: [
      'OLS coefficients remain unbiased, but their standard errors become greatly inflated and unstable',
      'OLS coefficients become severely biased',
      'Overall R^2 drops to zero',
      'Residuals automatically become non-normal',
    ],
    correctIndex: 0,
    explanation:
      'Multicollinearity does NOT bias OLS estimates (as long as X has full rank); it inflates coefficient variances by the Variance Inflation Factor (VIF).',
  },

  // PART D — DATA SCIENCE
  {
    id: 'Q-M43-1',
    moduleId: 43,
    partId: 'D',
    sectionRef: '43.2 (F43.2)',
    type: 'mcq',
    question: 'In Gradient Descent theta_(t+1) = theta_t - eta * grad f(theta_t), what typically happens if the learning rate eta is much too large?',
    options: [
      'The iterates overshoot the minimum, oscillate, and can diverge to infinity',
      'Convergence always becomes exponentially faster with no instability',
      'The gradient automatically rescales eta using the Hessian',
      'The algorithm becomes identical to Newton\'s method',
    ],
    correctIndex: 0,
    explanation:
      'For a quadratic with curvature L, gradient descent requires eta < 2/L for stability; larger eta causes overshooting and divergence.',
  },
  {
    id: 'Q-M44-1',
    moduleId: 44,
    partId: 'D',
    sectionRef: '44.2 (F44.2)',
    type: 'numeric',
    question: 'A binary classification node has 6 positive and 4 negative examples. Compute its Gini impurity G.',
    correctNumber: 0.48,
    tolerance: 0.005,
    explanation:
      'With p = (0.6, 0.4), G = 1 - (0.6^2 + 0.4^2) = 1 - (0.36 + 0.16) = 0.48 (or 2 * 0.6 * 0.4 = 0.48).',
  },
  {
    id: 'Q-M45-1',
    moduleId: 45,
    partId: 'D',
    sectionRef: '45.2–45.3 (F45.3)',
    type: 'mcq',
    question: 'According to F45.3, Var(average of B trees) = rho * sigma^2 + (1 - rho) * sigma^2 / B. Why does Random Forest sample a random subset of m features at each split?',
    options: [
      'To reduce pairwise tree correlation rho, lowering the variance floor rho * sigma^2',
      'To drive the bias of each individual tree to zero',
      'To eliminate the need for bootstrap sampling',
      'To guarantee 0% out-of-bag error',
    ],
    correctIndex: 0,
    explanation:
      'Adding more trees B only shrinks the (1 - rho) sigma^2 / B term. Random feature selection decorrelates trees, directly shrinking the irreducible floor rho * sigma^2.',
  },
  {
    id: 'Q-M46-1',
    moduleId: 46,
    partId: 'D',
    sectionRef: '46.2 (F46.2)',
    type: 'mcq',
    question: 'When performing k-fold cross-validation with feature scaling (e.g., StandardScaler), where must the scaler be fitted to avoid data leakage?',
    options: [
      'Inside each CV fold, fitted ONLY on that fold\'s training split (e.g. inside a scikit-learn Pipeline)',
      'Once on the entire dataset before splitting into folds',
      'Only on the test fold',
      'Scaling never causes data leakage so order does not matter',
    ],
    correctIndex: 0,
    explanation:
      'Fitting a scaler on the full dataset leaks validation-fold mean/variance into training, yielding optimistically biased CV scores.',
  },
  {
    id: 'Q-M48-1',
    moduleId: 48,
    partId: 'D',
    sectionRef: '48.5–48.6 (F48.6, F48.7)',
    type: 'mcq',
    question: 'In a Soft-Margin SVM (F48.7), what is the geometric width of the margin between w^T x + b = +1 and w^T x + b = -1?',
    options: ['2 / ||w||', '1 / ||w||', '||w|| / 2', '2 * C / ||w||'],
    correctIndex: 0,
    explanation:
      'Each margin hyperplane lies at perpendicular distance 1 / ||w|| from the decision boundary w^T x + b = 0, so the total street width is 2 / ||w||.',
  },
];

export function getQuizForModule(moduleId: number): QuizQuestion[] {
  return PRACTICE_QUIZZES.filter((q) => q.moduleId === moduleId);
}
