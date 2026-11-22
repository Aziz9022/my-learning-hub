# Correction Log & Fact-Checking Audit

This log mirrors the searchable in-app **Correction Log** (`#/corrections`). Original source text is never silently modified: every correction preserves the original statement alongside the corrected version, explanation, and authoritative reference.

## Honest Audit Scope
- **100% Structural & Cross-Reference Audit**: All 48 modules, 277 numbered sections, 237 formula blocks, internal formula/section references, and 410 Appendix C syllabus checklist mappings were programmatically verified.
- **Direct Mathematical, Algorithmic & Numerical Audit**: 105+ core formula blocks and representative worked examples across Parts A–D were checked directly and recomputed independently.
- **Remaining Entries**: Formula blocks not individually audited are transparently marked **Not independently checked** in the application UI rather than falsely claiming universal manual proof.

---

## Corrections Made (10)

| ID | Location | Category | Original Statement | Corrected Statement | Status |
|---|---|---|---|---|---|
| **CORR-01** | Module 12, §12.6 (`F12.6`) | Mathematical Accuracy | `H singular (some eigenvalue 0) -> inconclusive.` | A singular Hessian that is also **indefinite** (both positive and negative eigenvalues alongside 0, e.g. `f(x,y,z)=x^2-y^2+z^4` with eigenvalues `2, -2, 0`) is strictly a **saddle point**. Only **semidefinite** singular Hessians are inconclusive. | Correction made |
| **CORR-02** | Module 19, §19.1 (`F19.1`) | Algorithm & Complexity | `n = 1,000,000: balanced height <= 19` | Inequality direction inverted: `floor(log2(1,000,000)) = 19` is the **minimum possible height** (`h >= 19` for any binary tree of 1,000,000 nodes; AVL balanced height is `19..28`). | Correction made |
| **CORR-03** | Module 10, §10.6–10.7 (`F10.6`/`F10.7`) | Notation & Consistency | `F10.6: cond(A) = sigma_1 / sigma_r` vs `F10.7: cond(A) = sigma_max / sigma_min` | Clarified that both agree for full-rank matrices, whereas for rank-deficient matrices (`sigma_min = 0`), standard `cond(A) = infinity` (`numpy.linalg.cond`), while `sigma_1 / sigma_r` is the finite Moore-Penrose pseudoinverse condition number. | Correction made |
| **CORR-04** | Module 20, §20.4 (Sorting Table) | Algorithm & Complexity | Quick Sort space listed unconditionally as `O(log n)` | Clarified: `O(log n)` average recursion stack, `O(n)` worst-case recursion stack for standard two-sided recursion (`O(log n)` worst-case requires recursing on the smaller partition first). | Correction made |
| **CORR-05** | Module 19, §19.2 (`F19.2`) | Algorithm & Complexity | `BUILD-HEAP: sift-down from index n/2 - 1 down to 0` | Requires integer floor: `floor(n/2) - 1` (`n // 2 - 1` in Python) so odd `n` yields a valid integer index. | Correction made |
| **CORR-06** | Module 1, §1.3 (`F1.7`, J) | Cross-Reference | `combinations (F33.x)` | Resolved unresolved placeholder to `combinations (F33.7)`. | Correction made |
| **CORR-07** | Module 1, §1.3 (`F1.8`, J) | Cross-Reference | `eigenvalues of 2x2 matrices solve a quadratic (F9.x)` | Resolved unresolved placeholder to `(F9.2)` (Characteristic Equation). | Correction made |
| **CORR-08** | Module 17, §17.3 (`F17.1`, J) | Cross-Reference | `limits (F2.x)` | Resolved unresolved placeholder to `(F2.2, F2.3, F2.5)` and noted `n -> inf`. | Correction made |
| **CORR-09** | Module 9, §9.4 (`F9.3`, E) | Cross-Reference | `defective matrices (F9 section 9.3)` | Corrected typo to `Module 9, section 9.3`. | Correction made |
| **CORR-10** | Appendix E & Appendix F | Metadata & Indexing | `236 formulas`, `15379 lines, 124034 words`, and claim that all formula IDs were verified | Exact totals are **237 formula blocks** (236 `Fm.k` + `F-D.1`), **15,461 lines / 124,750 words**, and 3 unresolved `.x` placeholders (`F33.x`, `F9.x`, `F2.x`) corrected above. | Correction made |

---

## Independently Verified Highlights (9 Logged Checks)
- **VER-01** (`F30.3`): Skewness dataset `[2,3,3,4,4,4,5,5,6,9]` recomputed (`g1 = 1.1236`, `G1 = 1.3324`).
- **VER-02** (`F39.8`): Welch two-sample (`T = 2.9474`, `df = 13.54`, `d = 1.474`) & Paired t-test (`T = -3.3483`) recomputed exact.
- **VER-03** (`F40.7`): OLS leverage & Cook's Distance with `(15, 3)` recomputed exact (`b0 = 3.9872`, `b1 = -0.0308`, `h66 = 0.9359`, `D6 = 18.756 -> 18.8`).
- **VER-04** (`F20.1`/`F20.2`): Comparison sort bounds (`log2(10!) = 21.79`, `log2(1000!) = 8529.40`) and merge sort worst case (`17` for `n=8`) verified exact.
- **VER-05** (`F26.4`): Chan et al. parallel variance merge worked example verified exact (`M2 = 40`, `s^2 = 10`, `sigma^2 = 8`).
- **VER-06** (`F44.2`–`F44.4`): `scikit-learn 1.9` release confirmed (v1.9.0 June 2026, v1.9.1 Sept 2026) and Gini/Entropy examples recomputed exact.
- **VER-07** (`F48.3`): Two-class LDA intercept identity verified algebraically using symmetry of `Sigma^(-1)`.
- **VER-08** (`F33.8`): Hypergeometric 5-card hand probabilities verified exact (`0.27428`, `0.01294`).
- **VER-09** (`F28.1`): Amdahl's Law worked examples (`S(8)=4.71`, `S(16)=9.14`, `S(64)=15.42`) verified exact.

## Needs Verification (2)
- **CHECK-01** (Module 40/41): `statsmodels` summary secondary diagnostics (not executed in original build environment, per Appendix F.3).
- **CHECK-02** (Modules 44–48): Exact synthetic decimal scores from scikit-learn experiments depend on local Python 3.12 / NumPy 2.x / scikit-learn 1.9 execution and seeds.
