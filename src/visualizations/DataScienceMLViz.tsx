import React, { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';

type DSMode = 'gd' | 'tree' | 'rf' | 'roc' | 'boundary';

interface DataScienceMLVizProps {
  defaultMode?: DSMode;
}

// Exact Module 44.4 dataset: x = 1..10, labels 1,1,1,1,0,1,0,0,0,1
const TREE_DATA = [
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 3, y: 1 },
  { x: 4, y: 1 },
  { x: 5, y: 0 },
  { x: 6, y: 1 },
  { x: 7, y: 0 },
  { x: 8, y: 0 },
  { x: 9, y: 0 },
  { x: 10, y: 1 },
];

// Synthetic binary classifier predicted probabilities & true labels for ROC/Threshold
const ROC_CASES = [
  { p: 0.96, y: 1 },
  { p: 0.91, y: 1 },
  { p: 0.84, y: 1 },
  { p: 0.78, y: 0 },
  { p: 0.72, y: 1 },
  { p: 0.65, y: 1 },
  { p: 0.58, y: 0 },
  { p: 0.51, y: 1 },
  { p: 0.44, y: 0 },
  { p: 0.37, y: 0 },
  { p: 0.28, y: 1 },
  { p: 0.22, y: 0 },
  { p: 0.14, y: 0 },
  { p: 0.08, y: 0 },
];

function gini(ys: number[]): number {
  if (ys.length === 0) return 0;
  const p1 = ys.filter((v) => v === 1).length / ys.length;
  const p0 = 1 - p1;
  return 1 - (p1 * p1 + p0 * p0);
}

function entropy(ys: number[]): number {
  if (ys.length === 0) return 0;
  const p1 = ys.filter((v) => v === 1).length / ys.length;
  const p0 = 1 - p1;
  let h = 0;
  if (p1 > 0) h -= p1 * Math.log2(p1);
  if (p0 > 0) h -= p0 * Math.log2(p0);
  return h;
}

export const DataScienceMLViz: React.FC<DataScienceMLVizProps> = ({
  defaultMode = 'gd',
}) => {
  const [mode, setMode] = useState<DSMode>(defaultMode);

  // Gradient Descent state (on f(x) = 0.5 x^2, f'(x) = x => converges iff 0 < eta < 2)
  const [eta, setEta] = useState(0.35);
  const [startX, setStartX] = useState(3.2);
  const gdSteps = useMemo(() => {
    const pts: Array<{ step: number; x: number; fx: number }> = [];
    let x = startX;
    for (let t = 0; t <= 12; t++) {
      pts.push({ step: t, x, fx: 0.5 * x * x });
      x = x - eta * x;
      if (Math.abs(x) > 12) break;
    }
    return pts;
  }, [eta, startX]);

  // Decision Tree Split state (F44.4)
  const [splitThresh, setSplitThresh] = useState(4.5);
  const treeSplit = useMemo(() => {
    const allY = TREE_DATA.map((d) => d.y);
    const leftY = TREE_DATA.filter((d) => d.x <= splitThresh).map((d) => d.y);
    const rightY = TREE_DATA.filter((d) => d.x > splitThresh).map((d) => d.y);
    const n = allY.length;
    const gParent = gini(allY);
    const hParent = entropy(allY);
    const gWeighted = (leftY.length / n) * gini(leftY) + (rightY.length / n) * gini(rightY);
    const hWeighted = (leftY.length / n) * entropy(leftY) + (rightY.length / n) * entropy(rightY);
    return {
      leftY,
      rightY,
      gParent,
      gGain: gParent - gWeighted,
      hParent,
      hGain: hParent - hWeighted,
    };
  }, [splitThresh]);

  // Random Forest Variance state (F45.3)
  const [rho, setRho] = useState(0.3);
  const [numTrees, setNumTrees] = useState(50);
  const rfVar = rho + (1 - rho) / numTrees;

  // ROC / Confusion Matrix state (F46.3, F46.4)
  const [threshold, setThreshold] = useState(0.5);
  const metrics = useMemo(() => {
    let tp = 0, fp = 0, fn = 0, tn = 0;
    for (const c of ROC_CASES) {
      const pred = c.p >= threshold ? 1 : 0;
      if (pred === 1 && c.y === 1) tp++;
      else if (pred === 1 && c.y === 0) fp++;
      else if (pred === 0 && c.y === 1) fn++;
      else tn++;
    }
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    return { tp, fp, fn, tn, precision, recall, fpr, f1 };
  }, [threshold]);

  // Boundary Explorer: XOR Linear vs RBF Kernel (F48.2, F48.5)
  const [kernelType, setKernelType] = useState<'linear' | 'rbf'>('rbf');
  const [rbfGamma, setRbfGamma] = useState(1.2);

  const xorPoints = [
    { x: -1, y: -1, cls: 0 },
    { x: 1, y: 1, cls: 0 },
    { x: -1, y: 1, cls: 1 },
    { x: 1, y: -1, cls: 1 },
  ];

  const predictBoundary = (x: number, y: number) => {
    if (kernelType === 'linear') {
      return x + y > 0 ? 1 : 0;
    }
    // RBF score weighted by XOR labels (+1 for cls=1, -1 for cls=0)
    let score = 0;
    for (const pt of xorPoints) {
      const d2 = (x - pt.x) ** 2 + (y - pt.y) ** 2;
      const weight = pt.cls === 1 ? 1 : -1;
      score += weight * Math.exp(-rbfGamma * d2);
    }
    return score > 0 ? 1 : 0;
  };

  return (
    <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5EFE7] dark:border-[#1E2E24] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#17211B] dark:text-[#ECF2EE]">
            Interactive Data Science & Machine Learning Lab
          </h3>
          <p className="text-xs text-[#647067] dark:text-[#93A89B]">
            Visualize Gradient Descent convergence, Tree Gini/Entropy splits, Random Forest correlation floors, ROC thresholds, and Kernel boundaries.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {([
            ['gd', 'Gradient Descent'],
            ['tree', 'Tree Split'],
            ['rf', 'Random Forest'],
            ['roc', 'Threshold & ROC'],
            ['boundary', 'XOR & RBF Kernel'],
          ] as const).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                mode === m
                  ? 'bg-[#15803D] text-white'
                  : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'gd' && (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 p-4 bg-[#F8FAF8] dark:bg-[#0E1712] border-b lg:border-b-0 lg:border-r border-[#E5EFE7] dark:border-[#1E2E24]">
            <svg viewBox="0 0 520 260" className="w-full h-auto rounded-lg bg-white dark:bg-[#101914] border border-[#E2ECE4] dark:border-[#203026]">
              {/* Axes x in [-4.5, 4.5], y in [0, 8] */}
              <line x1={260} y1={14} x2={260} y2={232} className="stroke-[#647067]" strokeWidth={1.2} />
              <line x1={20} y1={232} x2={500} y2={232} className="stroke-[#647067]" strokeWidth={1.2} />
              {/* Parabola f(x) = 0.5 x^2 */}
              <path
                d={Array.from({ length: 120 }, (_, i) => {
                  const x = -4.2 + (8.4 * i) / 119;
                  const y = 0.5 * x * x;
                  const px = 260 + (x / 4.5) * 230;
                  const py = 232 - (y / 8.5) * 210;
                  return `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
                }).join(' ')}
                fill="none"
                className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                strokeWidth={2.5}
              />
              {/* GD trajectory */}
              <polyline
                fill="none"
                className="stroke-amber-600 dark:stroke-amber-400"
                strokeWidth={1.8}
                strokeDasharray="4 3"
                points={gdSteps
                  .filter((p) => Math.abs(p.x) <= 4.5)
                  .map((p) => `${(260 + (p.x / 4.5) * 230).toFixed(1)},${(232 - (Math.min(8.5, p.fx) / 8.5) * 210).toFixed(1)}`)
                  .join(' ')}
              />
              {gdSteps
                .filter((p) => Math.abs(p.x) <= 4.5)
                .map((p) => (
                  <circle
                    key={p.step}
                    cx={260 + (p.x / 4.5) * 230}
                    cy={232 - (Math.min(8.5, p.fx) / 8.5) * 210}
                    r={p.step === 0 ? 5.5 : 4}
                    className={
                      p.step === 0
                        ? 'fill-[#0284C7] dark:fill-[#38BDF8]'
                        : 'fill-amber-600 dark:fill-amber-400'
                    }
                  />
                ))}
            </svg>
          </div>
          <div className="lg:col-span-4 p-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Learning Rate η</span>
                <span className="font-mono tabular-nums font-semibold text-amber-700 dark:text-amber-400">
                  η = {eta.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.05}
                max={2.15}
                step={0.05}
                value={eta}
                onChange={(e) => setEta(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <div className="text-[11px] mt-1 font-medium">
                {eta < 0.2 && <span className="text-[#647067] dark:text-[#93A89B]">● Slow steady convergence</span>}
                {eta >= 0.2 && eta <= 1.0 && <span className="text-[#15803D] dark:text-[#4ADE80]">● Fast monotone convergence (η=1 hits min in 1 step!)</span>}
                {eta > 1.0 && eta < 2.0 && <span className="text-amber-700 dark:text-amber-400">▲ Overshooting oscillation (still converges)</span>}
                {eta >= 2.0 && <span className="text-rose-600 dark:text-rose-400">✕ Divergent! (η ≥ 2/L)</span>}
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Initial Point θ₀</span>
                <span className="font-mono tabular-nums">{startX.toFixed(1)}</span>
              </div>
              <input type="range" min={-3.8} max={3.8} step={0.2} value={startX} onChange={(e) => setStartX(Number(e.target.value))} className="w-full accent-[#15803D]" />
            </div>
            <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-3 text-xs font-mono tabular-nums space-y-1">
              <div>Loss: f(θ) = ½θ², ∇f(θ) = θ</div>
              <div>Step {gdSteps.length - 1} value: θ = {gdSteps[gdSteps.length - 1].x.toFixed(4)}</div>
              <div>Loss f(θ) = {gdSteps[gdSteps.length - 1].fx.toFixed(5)}</div>
            </div>
            <button type="button" onClick={() => { setEta(0.35); setStartX(3.2); }} className="inline-flex items-center gap-1 text-xs text-[#647067] hover:text-[#15803D] cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      )}

      {mode === 'tree' && (
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#4B5850] dark:text-[#A8BCB0]">
              Module 44.4 dataset (x = 1..10): move the threshold to maximize Gini Decrease &amp; Information Gain.
            </div>
            <div className="text-xs font-mono font-semibold text-[#15803D] dark:text-[#4ADE80]">
              Split rule: x ≤ {splitThresh.toFixed(1)}
            </div>
          </div>

          <input
            type="range"
            min={1.5}
            max={9.5}
            step={1}
            value={splitThresh}
            onChange={(e) => setSplitThresh(Number(e.target.value))}
            className="w-full accent-[#15803D]"
          />

          <div className="grid grid-cols-10 gap-2">
            {TREE_DATA.map((pt) => {
              const isLeft = pt.x <= splitThresh;
              return (
                <div
                  key={pt.x}
                  className={`rounded-lg p-2 text-center border text-xs font-mono ${
                    isLeft
                      ? 'border-[#15803D] bg-[#DCFCE7]/60 dark:bg-[#143321]'
                      : 'border-[#D7E3DA] dark:border-[#24362B] bg-[#F8FAF8] dark:bg-[#0E1712]'
                  }`}
                >
                  <div className="text-[10px] text-[#647067] dark:text-[#93A89B]">x={pt.x}</div>
                  <div className={`font-bold mt-0.5 ${pt.y === 1 ? 'text-[#15803D] dark:text-[#4ADE80]' : 'text-amber-700 dark:text-amber-400'}`}>
                    y={pt.y}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono tabular-nums">
            <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-3">
              <div className="text-[#647067] dark:text-[#93A89B] font-sans mb-1">Left Child (n={treeSplit.leftY.length})</div>
              <div>Gini = {gini(treeSplit.leftY).toFixed(4)}</div>
              <div>Entropy = {entropy(treeSplit.leftY).toFixed(4)} bits</div>
            </div>
            <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-3">
              <div className="text-[#647067] dark:text-[#93A89B] font-sans mb-1">Right Child (n={treeSplit.rightY.length})</div>
              <div>Gini = {gini(treeSplit.rightY).toFixed(4)}</div>
              <div>Entropy = {entropy(treeSplit.rightY).toFixed(4)} bits</div>
            </div>
            <div className="rounded-lg bg-[#DCFCE7]/50 dark:bg-[#143321] border border-[#15803D]/30 p-3">
              <div className="text-[#14532D] dark:text-[#86EFAC] font-sans font-semibold mb-1">Impurity Reduction</div>
              <div className="font-bold">Gini Gain = {treeSplit.gGain.toFixed(4)}</div>
              <div className="font-bold">Info Gain = {treeSplit.hGain.toFixed(4)} bits</div>
            </div>
          </div>
        </div>
      )}

      {mode === 'rf' && (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 p-4 bg-[#F8FAF8] dark:bg-[#0E1712] border-b lg:border-b-0 lg:border-r border-[#E5EFE7] dark:border-[#1E2E24]">
            <svg viewBox="0 0 520 250" className="w-full h-auto rounded-lg bg-white dark:bg-[#101914] border border-[#E2ECE4] dark:border-[#203026]">
              <line x1={44} y1={215} x2={495} y2={215} className="stroke-[#647067]" strokeWidth={1.3} />
              <line x1={44} y1={20} x2={44} y2={215} className="stroke-[#647067]" strokeWidth={1.3} />
              {[0, 0.25, 0.5, 0.75, 1.0].map((v) => (
                <text key={v} x={10} y={219 - v * 185} className="fill-[#647067] dark:fill-[#8DA295] text-[10px] font-mono">
                  {v.toFixed(2)}
                </text>
              ))}
              {/* Correlation floor */}
              <line
                x1={44}
                y1={215 - rho * 185}
                x2={495}
                y2={215 - rho * 185}
                className="stroke-amber-600 dark:stroke-amber-400"
                strokeDasharray="6 4"
                strokeWidth={1.6}
              />
              <text x={315} y={209 - rho * 185} className="fill-amber-700 dark:fill-amber-400 text-[11px] font-mono font-semibold">
                Floor ρ·σ² = {rho.toFixed(2)}
              </text>
              {/* Variance curve */}
              <polyline
                fill="none"
                className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                strokeWidth={2.5}
                points={Array.from({ length: 100 }, (_, i) => {
                  const b = i + 1;
                  const v = rho + (1 - rho) / b;
                  return `${(44 + ((b - 1) / 99) * 445).toFixed(1)},${(215 - v * 185).toFixed(1)}`;
                }).join(' ')}
              />
              <circle
                cx={44 + ((Math.min(100, numTrees) - 1) / 99) * 445}
                cy={215 - rfVar * 185}
                r={5.5}
                className="fill-[#15803D] dark:fill-[#4ADE80] stroke-white dark:stroke-[#101914]"
                strokeWidth={2}
              />
            </svg>
          </div>
          <div className="lg:col-span-4 p-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Pairwise Tree Correlation ρ</span>
                <span className="font-mono tabular-nums text-amber-700 dark:text-amber-400">{rho.toFixed(2)}</span>
              </div>
              <input type="range" min={0} max={0.9} step={0.05} value={rho} onChange={(e) => setRho(Number(e.target.value))} className="w-full accent-amber-600" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Number of Trees B</span>
                <span className="font-mono tabular-nums">{numTrees}</span>
              </div>
              <input type="range" min={1} max={100} step={1} value={numTrees} onChange={(e) => setNumTrees(Number(e.target.value))} className="w-full accent-[#15803D]" />
            </div>
            <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-3 text-xs font-mono tabular-nums space-y-1.5">
              <div>Formula (F45.3, σ² = 1):</div>
              <div className="font-semibold text-[#15803D] dark:text-[#4ADE80]">
                Var = {rfVar.toFixed(4)}
              </div>
              <div className="text-[#647067] dark:text-[#93A89B]">
                Irreducible floor (B→∞): {rho.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'roc' && (
        <div className="p-5 space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">Classification Probability Threshold τ</span>
              <span className="font-mono tabular-nums font-semibold text-[#15803D] dark:text-[#4ADE80]">
                Predict Positive if p̂ ≥ {threshold.toFixed(2)}
              </span>
            </div>
            <input type="range" min={0.05} max={0.95} step={0.05} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-[#15803D]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums text-xs">
            <div className="rounded-lg bg-[#DCFCE7]/60 dark:bg-[#143321] p-3 border border-[#15803D]/30">
              <div className="font-sans text-[#14532D] dark:text-[#86EFAC]">True Pos (TP)</div>
              <div className="text-xl font-bold mt-0.5">{metrics.tp}</div>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-3 border border-amber-500/30">
              <div className="font-sans text-amber-800 dark:text-amber-300">False Pos (FP)</div>
              <div className="text-xl font-bold mt-0.5">{metrics.fp}</div>
            </div>
            <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] p-3 border border-[#E2ECE4] dark:border-[#203026]">
              <div className="font-sans text-[#647067] dark:text-[#93A89B]">False Neg (FN)</div>
              <div className="text-xl font-bold mt-0.5">{metrics.fn}</div>
            </div>
            <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] p-3 border border-[#E2ECE4] dark:border-[#203026]">
              <div className="font-sans text-[#647067] dark:text-[#93A89B]">True Neg (TN)</div>
              <div className="text-xl font-bold mt-0.5">{metrics.tn}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono tabular-nums bg-[#F8FAF8] dark:bg-[#0E1712] p-3.5 rounded-lg border border-[#E2ECE4] dark:border-[#203026]">
            <div>Precision: <strong className="text-[#15803D] dark:text-[#4ADE80]">{(metrics.precision * 100).toFixed(1)}%</strong></div>
            <div>Recall (TPR): <strong className="text-[#15803D] dark:text-[#4ADE80]">{(metrics.recall * 100).toFixed(1)}%</strong></div>
            <div>FPR: <strong>{(metrics.fpr * 100).toFixed(1)}%</strong></div>
            <div>F1 Score: <strong>{metrics.f1.toFixed(3)}</strong></div>
          </div>
        </div>
      )}

      {mode === 'boundary' && (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-4 bg-[#F8FAF8] dark:bg-[#0E1712] border-b lg:border-b-0 lg:border-r border-[#E5EFE7] dark:border-[#1E2E24]">
            <svg viewBox="0 0 320 260" className="w-full max-w-[360px] mx-auto h-auto rounded-lg bg-white dark:bg-[#101914] border border-[#E2ECE4] dark:border-[#203026]">
              {/* Decision region grid */}
              {Array.from({ length: 24 }).map((_, gx) =>
                Array.from({ length: 20 }).map((__, gy) => {
                  const x = -2 + (4 * (gx + 0.5)) / 24;
                  const y = 2 - (4 * (gy + 0.5)) / 20;
                  const pred = predictBoundary(x, y);
                  return (
                    <rect
                      key={`${gx}-${gy}`}
                      x={(gx * 320) / 24}
                      y={(gy * 260) / 20}
                      width={320 / 24 + 0.5}
                      height={260 / 20 + 0.5}
                      className={
                        pred === 1
                          ? 'fill-[#15803D]/22 dark:fill-[#4ADE80]/22'
                          : 'fill-amber-500/18 dark:fill-amber-400/15'
                      }
                    />
                  );
                })
              )}
              {/* XOR points */}
              {xorPoints.map((pt, i) => {
                const px = ((pt.x + 2) / 4) * 320;
                const py = ((2 - pt.y) / 4) * 260;
                return (
                  <g key={i}>
                    <circle
                      cx={px}
                      cy={py}
                      r={10}
                      className={
                        pt.cls === 1
                          ? 'fill-[#15803D] stroke-white'
                          : 'fill-amber-600 stroke-white'
                      }
                      strokeWidth={2.5}
                    />
                    <text x={px} y={py + 4} textAnchor="middle" className="fill-white text-[11px] font-mono font-bold">
                      {pt.cls === 1 ? '+' : '−'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="lg:col-span-5 p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKernelType('linear')}
                className={`py-2 rounded-lg text-xs font-medium cursor-pointer ${
                  kernelType === 'linear'
                    ? 'bg-[#15803D] text-white'
                    : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5]'
                }`}
              >
                Linear Classifier
              </button>
              <button
                type="button"
                onClick={() => setKernelType('rbf')}
                className={`py-2 rounded-lg text-xs font-medium cursor-pointer ${
                  kernelType === 'rbf'
                    ? 'bg-[#15803D] text-white'
                    : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5]'
                }`}
              >
                RBF Kernel (Nonlinear)
              </button>
            </div>
            {kernelType === 'rbf' && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">RBF Bandwidth γ</span>
                  <span className="font-mono tabular-nums">{rbfGamma.toFixed(2)}</span>
                </div>
                <input type="range" min={0.2} max={3.0} step={0.1} value={rbfGamma} onChange={(e) => setRbfGamma(Number(e.target.value))} className="w-full accent-[#15803D]" />
              </div>
            )}
            <p className="text-xs leading-relaxed text-[#4B5850] dark:text-[#A8BCB0]">
              {kernelType === 'linear'
                ? 'F48.2 XOR Problem: No single straight line can separate (+1, -1) and (-1, +1) from (-1, -1) and (+1, +1); linear accuracy caps at 50–75%.'
                : 'F48.5 Kernel Trick: The RBF kernel K(x, z) = exp(-γ ||x - z||²) effortlessly carves nonlinear islands around each class, achieving 100% separation on XOR.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
