# My Learning Library

An interactive, static, university-level personal learning platform covering **Mathematics**, **Computer Science**, **Statistics**, and **Data Science** — built from the complete 124,750-word `Math_Stats_CS_DS_Reference.txt` handbook and ready to host live on **GitHub Pages**.

---

## What Is Included (100% Lossless Source Preservation)

- **All 4 Parts & 20 Sub-Parts**:
  - **Part A — Mathematics** (Modules 1–16): Calculus, Linear Algebra, Analytic Geometry & Multivariable Calculus, Differential Equations
  - **Part B — Computer Science** (Modules 17–28): Data Structures, Algorithms & Programming, Logic & Databases, Theoretical CS, Computer Architecture
  - **Part C — Statistics** (Modules 29–41): Descriptive Statistics, Probability, Statistical Inference & Linear Models, Statistical Programming
  - **Part D — Data Science** (Modules 42–48): Data Manipulation, Numerical Optimization, Decision Trees, Ensemble Learning, Model Validation, Hyperparameter Tuning, Classification & Decision Boundaries
- **All 48 Modules & 277 Numbered Sections** (`1.1` through `48.7`) preserved verbatim.
- **All 237 Formula Blocks** (`F1.1`–`F48.7` plus `F-D.1` in Appendix D), rendered with **KaTeX** plus a one-click toggle to inspect the original plain-text notation and verbatim A–J blocks.
- **All 6 Appendices (A–F)**, including an interactive searchable **410-bullet Syllabus Coverage Checklist** (Appendix C) and searchable **Symbol & Notation Glossary** (Appendix B).
- **Interactive Visualizations** across all four disciplines: Calculus (Tangent/Limit, Riemann Sums, Taylor Series), Linear Algebra & ODEs (2×2 Matrix/Determinant/Eigenvectors, Direction Field & Euler's Method), Computer Science (Step-by-step Sorting, Binary Max-Heap, Amdahl's Law, DFA Simulator), Statistics (Mean/Median Outliers, Bayes Natural-Frequency Screening, Probability Distributions, OLS Regression & Cook's Distance), and Data Science (Gradient Descent learning rate, Decision Tree Gini/Entropy splits, Random Forest correlation floor, ROC/Confusion Matrix threshold, XOR Linear vs. RBF Kernel boundaries).
- **Transparent Three-Layer Fact-Checking**: Genuine errors are never silently overwritten. Every correction preserves Layer 1 (Original source verbatim), Layer 2 (Verified/corrected statement), and Layer 3 (Verification note & authoritative reference) — searchable in the in-app **Correction Log** and in `CORRECTION_LOG.md`.
- **Dual Theme (Light Green & White Default + Dark / Night Mode + System Auto)** persisted in `localStorage`.
- **Zero Backend, Zero API Keys**: 100% static build with browser `localStorage` tracking for section/module completion, bookmarks, recently viewed history, and optional clearly labeled supplementary practice checks.

---

## Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or v20+ (includes `npm`)

### Install & Run Locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### Build for Production (Static Output)
```bash
npm run build
```
The production static website is emitted into `dist/`.

### Re-parse the Source TXT File (Optional)
If you ever update `public/assets/aistudio/Math_Stats_CS_DS_Reference_9c56e49e.txt`, regenerate the structured JSON modules via:
```bash
node scripts/parse_source.mjs
```

---

## Deploying Live to GitHub Pages (Step-by-Step)

This project is pre-configured for GitHub Pages with:
- Relative asset paths (`base: './'` in `vite.config.ts`)
- Hash-based routing (`#/module/12`) so direct links and page refreshes never return 404
- An automated GitHub Actions deployment workflow (`.github/workflows/deploy.yml`)

### Step 1: Create a Public GitHub Repository
1. Sign in to [GitHub](https://github.com/) and click **New repository**.
2. Name it (for example, `my-learning-library`).
3. Set visibility to **Public** (required for free GitHub Pages hosting).
4. Click **Create repository** (do not initialize with a conflicting README).

### Step 2: Upload the Project Files
Unzip the downloaded project archive on your computer, open a terminal inside the project folder, and run:
```bash
git init
git branch -M main
git add .
git commit -m "Initial commit: My Learning Library"
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Open your repository on GitHub and go to **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Navigate to the **Actions** tab — the workflow **Deploy My Learning Library to GitHub Pages** will run automatically (or click **Run workflow**).
4. Once the green checkmark finishes (~1–2 minutes), your website will be live at:
   `https://<YOUR_USERNAME>.github.io/<YOUR_REPO_NAME>/`

### Step 4: Updating Later
Whenever you edit content or code locally, commit and push to `main`:
```bash
git add .
git commit -m "Update study notes"
git push
```
GitHub Actions automatically rebuilds and republishes the updated site.

---

## Documentation Files Included
- `CONTENT_COVERAGE_CHECKLIST.md` — Verification inventory of all 48 modules, 277 sections, 237 formulas, and 6 appendices.
- `CORRECTION_LOG.md` — Transparent record of audited corrections, independent numerical verifications, and honest verification scope.
