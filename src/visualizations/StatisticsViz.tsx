import React, { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';

type StatsMode = 'descriptive' | 'bayes' | 'distributions' | 'regression';

interface StatisticsVizProps {
  defaultMode?: StatsMode;
}

function nChooseK(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - i + 1)) / i;
  return r;
}

export const StatisticsViz: React.FC<StatisticsVizProps> = ({
  defaultMode = 'descriptive',
}) => {
  const [mode, setMode] = useState<StatsMode>(defaultMode);

  // Descriptive stats: drag an outlier on a base dataset
  const [outlierVal, setOutlierVal] = useState(9);
  const descData = useMemo(() => {
    const arr = [2, 3, 3, 4, 4, 4, 5, 5, 6, outlierVal].sort((a, b) => a - b);
    const n = arr.length;
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const median = (arr[4] + arr[5]) / 2;
    const m2 = arr.reduce((a, x) => a + (x - mean) ** 2, 0) / n;
    const m3 = arr.reduce((a, x) => a + (x - mean) ** 3, 0) / n;
    const popSd = Math.sqrt(m2);
    const sampleSd = Math.sqrt((m2 * n) / (n - 1));
    const g1 = popSd > 0 ? m3 / popSd ** 3 : 0;
    const q1 = arr[2] + 0.25 * (arr[3] - arr[2]);
    const q3 = arr[6] + 0.75 * (arr[7] - arr[6]);
    return { arr, mean, median, popSd, sampleSd, g1, q1, q3, iqr: q3 - q1 };
  }, [outlierVal]);

  // Bayes Diagnostic Test (F34.6 default: Se=0.95, Sp=0.90, Pr=0.01)
  const [prevalence, setPrevalence] = useState(1.0); // %
  const [sensitivity, setSensitivity] = useState(95.0); // %
  const [specificity, setSpecificity] = useState(90.0); // %
  const bayes = useMemo(() => {
    const pr = prevalence / 100;
    const se = sensitivity / 100;
    const sp = specificity / 100;
    const pop = 10000;
    const sick = pop * pr;
    const healthy = pop * (1 - pr);
    const tp = sick * se;
    const fn = sick * (1 - se);
    const tn = healthy * sp;
    const fp = healthy * (1 - sp);
    const ppv = tp + fp > 0 ? tp / (tp + fp) : 0;
    const npv = tn + fn > 0 ? tn / (tn + fn) : 0;
    return { tp, fn, tn, fp, ppv, npv };
  }, [prevalence, sensitivity, specificity]);

  // Distributions explorer
  const [distType, setDistType] = useState<'normal' | 'binomial' | 'exponential'>('normal');
  const [normMu, setNormMu] = useState(0);
  const [normSigma, setNormSigma] = useState(1.0);
  const [binN, setBinN] = useState(16);
  const [binP, setBinP] = useState(0.35);
  const [expLambda, setExpLambda] = useState(1.0);

  // OLS Regression & Leverage / Cook's D (F40.7 worked example!)
  const [includeOutlier, setIncludeOutlier] = useState(true);
  const [levX, setLevX] = useState(15);
  const [levY, setLevY] = useState(3);

  const ols = useMemo(() => {
    const pts = [
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 5 },
    ];
    if (includeOutlier) pts.push({ x: levX, y: levY });
    const n = pts.length;
    const xm = pts.reduce((a, p) => a + p.x, 0) / n;
    const ym = pts.reduce((a, p) => a + p.y, 0) / n;
    const sxx = pts.reduce((a, p) => a + (p.x - xm) ** 2, 0) || 1e-9;
    const syy = pts.reduce((a, p) => a + (p.y - ym) ** 2, 0) || 1e-9;
    const sxy = pts.reduce((a, p) => a + (p.x - xm) * (p.y - ym), 0);
    const b1 = sxy / sxx;
    const b0 = ym - b1 * xm;
    const r = sxy / Math.sqrt(sxx * syy);
    const res = pts.map((p) => p.y - (b0 + b1 * p.x));
    const sse = res.reduce((a, e) => a + e * e, 0);
    const mse = n > 2 ? sse / (n - 2) : 0;
    const r2 = Math.max(0, 1 - sse / syy);
    const last = pts[n - 1];
    const hLast = 1 / n + (last.x - xm) ** 2 / sxx;
    const cookLast =
      mse > 0 && hLast < 0.9999
        ? (res[n - 1] ** 2 / (2 * mse)) * (hLast / (1 - hLast) ** 2)
        : 0;
    return { pts, b0, b1, r, r2, hLast, cookLast };
  }, [includeOutlier, levX, levY]);

  return (
    <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5EFE7] dark:border-[#1E2E24] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#17211B] dark:text-[#ECF2EE]">
            Interactive Statistics & Probability Lab
          </h3>
          <p className="text-xs text-[#647067] dark:text-[#93A89B]">
            Test outlier effects on mean/median, Bayes diagnostic screening, probability distributions, and OLS leverage/Cook&apos;s D.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {([
            ['descriptive', 'Mean & Outliers'],
            ['bayes', "Bayes' Test"],
            ['distributions', 'Distributions'],
            ['regression', 'OLS & Leverage'],
          ] as const).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
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

      {mode === 'descriptive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 p-5 bg-[#F8FAF8] dark:bg-[#0E1712] border-b lg:border-b-0 lg:border-r border-[#E5EFE7] dark:border-[#1E2E24]">
            <svg viewBox="0 0 520 200" className="w-full h-auto rounded-lg bg-white dark:bg-[#101914] border border-[#E2ECE4] dark:border-[#203026]">
              {/* Number line 0..25 */}
              <line x1={30} y1={150} x2={495} y2={150} className="stroke-[#647067]" strokeWidth={1.3} />
              {[0, 5, 10, 15, 20, 25].map((tick) => {
                const tx = 30 + (tick / 25) * 465;
                return (
                  <g key={tick}>
                    <line x1={tx} y1={146} x2={tx} y2={155} className="stroke-[#647067]" />
                    <text x={tx - 4} y={170} className="fill-[#647067] dark:fill-[#8DA295] text-[10px] font-mono">
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Boxplot IQR band */}
              <rect
                x={30 + (descData.q1 / 25) * 465}
                y={58}
                width={Math.max(4, ((descData.q3 - descData.q1) / 25) * 465)}
                height={26}
                rx={3}
                className="fill-[#15803D]/15 stroke-[#15803D] dark:fill-[#4ADE80]/15 dark:stroke-[#4ADE80]"
                strokeWidth={1.6}
              />
              {/* Median vertical marker */}
              <line
                x1={30 + (descData.median / 25) * 465}
                y1={46}
                x2={30 + (descData.median / 25) * 465}
                y2={145}
                className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                strokeWidth={2.4}
              />
              <text
                x={30 + (descData.median / 25) * 465 - 24}
                y={38}
                className="fill-[#14532D] dark:fill-[#86EFAC] text-[10px] font-mono font-bold"
              >
                Median {descData.median.toFixed(1)}
              </text>

              {/* Mean vertical marker */}
              <line
                x1={30 + (descData.mean / 25) * 465}
                y1={88}
                x2={30 + (descData.mean / 25) * 465}
                y2={150}
                className="stroke-amber-600 dark:stroke-amber-400"
                strokeWidth={2.2}
                strokeDasharray="4 3"
              />
              <text
                x={30 + (descData.mean / 25) * 465 + 5}
                y={102}
                className="fill-amber-700 dark:fill-amber-400 text-[10px] font-mono font-bold"
              >
                Mean {descData.mean.toFixed(2)}
              </text>

              {/* Data points */}
              {descData.arr.map((v, i) => {
                const sameBefore = descData.arr.slice(0, i).filter((x) => x === v).length;
                const cx = 30 + (v / 25) * 465;
                const cy = 136 - sameBefore * 13;
                const isOutlier = i === descData.arr.length - 1;
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={isOutlier ? 6 : 4.8}
                    className={
                      isOutlier
                        ? 'fill-amber-500 stroke-white dark:stroke-[#101914]'
                        : 'fill-[#15803D] dark:fill-[#4ADE80]'
                    }
                    strokeWidth={1.5}
                  />
                );
              })}
            </svg>
          </div>
          <div className="lg:col-span-4 p-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">10th Observation (Outlier)</span>
                <span className="font-mono tabular-nums text-amber-700 dark:text-amber-400 font-semibold">
                  x₁₀ = {outlierVal}
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={24}
                step={0.5}
                value={outlierVal}
                onChange={(e) => setOutlierVal(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
              <p className="text-[11px] text-[#647067] dark:text-[#93A89B] mt-1">
                Starts at F30.3 dataset [2,3,3,4,4,4,5,5,6,9]. Drag x₁₀ right to see Mean &amp; SD jump while Median &amp; IQR resist!
              </p>
            </div>
            <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-3 space-y-1.5 text-xs font-mono tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#647067] dark:text-[#93A89B]">Mean (x̄)</span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">{descData.mean.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#647067] dark:text-[#93A89B]">Median</span>
                <span className="font-semibold text-[#15803D] dark:text-[#4ADE80]">{descData.median.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#647067] dark:text-[#93A89B]">Sample SD (s, ddof=1)</span>
                <span>{descData.sampleSd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#647067] dark:text-[#93A89B]">IQR (Q3 - Q1)</span>
                <span>{descData.iqr.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E5EFE7] dark:border-[#1E2E24]">
                <span className="text-[#647067] dark:text-[#93A89B]">Skewness g₁ (F30.3)</span>
                <span className="font-semibold">{descData.g1.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'bayes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-5 bg-[#F8FAF8] dark:bg-[#0E1712] border-b lg:border-b-0 lg:border-r border-[#E5EFE7] dark:border-[#1E2E24] space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#647067] dark:text-[#93A89B]">
              Natural Frequencies out of 10,000 People (F34.6)
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono tabular-nums">
              <div className="rounded-lg bg-[#DCFCE7] dark:bg-[#143321] border border-[#15803D]/30 p-3.5">
                <div className="text-[11px] text-[#14532D] dark:text-[#86EFAC] font-sans font-semibold">
                  True Positives (TP)
                </div>
                <div className="text-2xl font-bold text-[#14532D] dark:text-[#ECF2EE] mt-1">
                  {Math.round(bayes.tp).toLocaleString()}
                </div>
                <div className="text-[11px] text-[#355E44] dark:text-[#9CC8AD]">Has condition &amp; tests +</div>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 p-3.5">
                <div className="text-[11px] text-amber-800 dark:text-amber-300 font-sans font-semibold">
                  False Positives (FP)
                </div>
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">
                  {Math.round(bayes.fp).toLocaleString()}
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-300/80">Healthy &amp; tests +</div>
              </div>
              <div className="rounded-lg bg-white dark:bg-[#131D17] border border-[#D7E3DA] dark:border-[#24362B] p-3.5">
                <div className="text-[11px] text-[#647067] dark:text-[#93A89B] font-sans font-semibold">
                  False Negatives (FN)
                </div>
                <div className="text-xl font-bold mt-1">{Math.round(bayes.fn).toLocaleString()}</div>
              </div>
              <div className="rounded-lg bg-white dark:bg-[#131D17] border border-[#D7E3DA] dark:border-[#24362B] p-3.5">
                <div className="text-[11px] text-[#647067] dark:text-[#93A89B] font-sans font-semibold">
                  True Negatives (TN)
                </div>
                <div className="text-xl font-bold mt-1">{Math.round(bayes.tn).toLocaleString()}</div>
              </div>
            </div>

            <div className="rounded-lg bg-white dark:bg-[#131D17] border border-[#D7E3DA] dark:border-[#24362B] p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-[#647067] dark:text-[#93A89B]">Positive Predictive Value P(Disease | +)</div>
                <div className="text-2xl font-mono font-bold tabular-nums text-[#15803D] dark:text-[#4ADE80]">
                  {(bayes.ppv * 100).toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-[#647067] dark:text-[#93A89B]">Negative Predictive Value P(Healthy | -)</div>
                <div className="text-2xl font-mono font-bold tabular-nums text-[#17211B] dark:text-[#ECF2EE]">
                  {(bayes.npv * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Prevalence P(D)</span>
                <span className="font-mono tabular-nums font-semibold text-[#15803D] dark:text-[#4ADE80]">
                  {prevalence.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={40}
                step={0.5}
                value={prevalence}
                onChange={(e) => setPrevalence(Number(e.target.value))}
                className="w-full accent-[#15803D]"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Sensitivity P(+ | D)</span>
                <span className="font-mono tabular-nums">{sensitivity.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={99}
                step={1}
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-full accent-[#15803D]"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Specificity P(- | not D)</span>
                <span className="font-mono tabular-nums">{specificity.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={99}
                step={1}
                value={specificity}
                onChange={(e) => setSpecificity(Number(e.target.value))}
                className="w-full accent-[#15803D]"
              />
            </div>
            <p className="text-xs leading-relaxed text-[#4B5850] dark:text-[#A8BCB0]">
              Base-rate fallacy check: even with 95% sensitivity and 90% specificity, at 1% prevalence false positives (990) vastly outnumber true positives (95), yielding PPV = 8.76%.
            </p>
          </div>
        </div>
      )}

      {mode === 'distributions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 p-4 bg-[#F8FAF8] dark:bg-[#0E1712] border-b lg:border-b-0 lg:border-r border-[#E5EFE7] dark:border-[#1E2E24]">
            <svg viewBox="0 0 520 250" className="w-full h-auto rounded-lg bg-white dark:bg-[#101914] border border-[#E2ECE4] dark:border-[#203026]">
              <line x1={38} y1={215} x2={495} y2={215} className="stroke-[#647067]" strokeWidth={1.3} />
              <line x1={38} y1={18} x2={38} y2={215} className="stroke-[#647067]" strokeWidth={1.3} />

              {distType === 'normal' && (() => {
                const pts: string[] = [];
                for (let i = 0; i <= 140; i++) {
                  const x = -6 + (12 * i) / 140;
                  const y =
                    (1 / (normSigma * Math.sqrt(2 * Math.PI))) *
                    Math.exp(-0.5 * ((x - normMu) / normSigma) ** 2);
                  const px = 38 + ((x + 6) / 12) * 452;
                  const py = 215 - (Math.min(0.85, y) / 0.85) * 185;
                  pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
                }
                const meanPx = 38 + ((normMu + 6) / 12) * 452;
                return (
                  <>
                    <path d={pts.join(' ')} fill="none" className="stroke-[#15803D] dark:stroke-[#4ADE80]" strokeWidth={2.5} />
                    <line x1={meanPx} y1={25} x2={meanPx} y2={215} className="stroke-amber-600 dark:stroke-amber-400" strokeDasharray="5 4" strokeWidth={1.6} />
                    {[-4, -2, 0, 2, 4].map((t) => (
                      <text key={t} x={38 + ((t + 6) / 12) * 452 - 5} y={232} className="fill-[#647067] dark:fill-[#8DA295] text-[10px] font-mono">
                        {t}
                      </text>
                    ))}
                  </>
                );
              })()}

              {distType === 'binomial' && (() => {
                const probs = Array.from({ length: binN + 1 }, (_, k) =>
                  nChooseK(binN, k) * binP ** k * (1 - binP) ** (binN - k)
                );
                const maxP = Math.max(...probs, 0.25);
                const bw = Math.max(8, 430 / (binN + 1) - 4);
                return probs.map((p, k) => {
                  const bx = 46 + (k / (binN + 1)) * 435;
                  const bh = (p / maxP) * 180;
                  return (
                    <g key={k}>
                      <rect
                        x={bx}
                        y={215 - bh}
                        width={bw}
                        height={bh}
                        rx={2}
                        className="fill-[#15803D]/80 dark:fill-[#4ADE80]/80"
                      />
                      {k % Math.max(1, Math.floor(binN / 8)) === 0 && (
                        <text x={bx + bw / 2 - 3} y={232} className="fill-[#647067] dark:fill-[#8DA295] text-[10px] font-mono">
                          {k}
                        </text>
                      )}
                    </g>
                  );
                });
              })()}

              {distType === 'exponential' && (() => {
                const pts: string[] = [];
                for (let i = 0; i <= 120; i++) {
                  const x = (6 * i) / 120;
                  const y = expLambda * Math.exp(-expLambda * x);
                  const px = 38 + (x / 6) * 452;
                  const py = 215 - (Math.min(2.6, y) / 2.6) * 185;
                  pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
                }
                return (
                  <>
                    <path d={pts.join(' ')} fill="none" className="stroke-[#15803D] dark:stroke-[#4ADE80]" strokeWidth={2.5} />
                    {[0, 1, 2, 3, 4, 5, 6].map((t) => (
                      <text key={t} x={38 + (t / 6) * 452 - 3} y={232} className="fill-[#647067] dark:fill-[#8DA295] text-[10px] font-mono">
                        {t}
                      </text>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="lg:col-span-4 p-4 space-y-4">
            <div className="grid grid-cols-3 gap-1.5">
              {(['normal', 'binomial', 'exponential'] as const).map((dt) => (
                <button
                  key={dt}
                  type="button"
                  onClick={() => setDistType(dt)}
                  className={`py-1.5 rounded-lg text-xs font-medium capitalize cursor-pointer ${
                    distType === dt
                      ? 'bg-[#15803D] text-white'
                      : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5]'
                  }`}
                >
                  {dt}
                </button>
              ))}
            </div>

            {distType === 'normal' && (
              <>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Mean μ</span>
                    <span className="font-mono tabular-nums">{normMu.toFixed(1)}</span>
                  </div>
                  <input type="range" min={-3} max={3} step={0.2} value={normMu} onChange={(e) => setNormMu(Number(e.target.value))} className="w-full accent-[#15803D]" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Std Dev σ</span>
                    <span className="font-mono tabular-nums">{normSigma.toFixed(2)}</span>
                  </div>
                  <input type="range" min={0.5} max={2.5} step={0.1} value={normSigma} onChange={(e) => setNormSigma(Number(e.target.value))} className="w-full accent-[#15803D]" />
                </div>
                <div className="text-xs font-mono bg-[#F8FAF8] dark:bg-[#0E1712] p-3 rounded-lg border border-[#E2ECE4] dark:border-[#203026] space-y-1">
                  <div>E[X] = {normMu.toFixed(2)}</div>
                  <div>Var(X) = σ² = {(normSigma ** 2).toFixed(2)}</div>
                  <div>68% range: [{(normMu - normSigma).toFixed(2)}, {(normMu + normSigma).toFixed(2)}]</div>
                </div>
              </>
            )}

            {distType === 'binomial' && (
              <>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Trials n</span>
                    <span className="font-mono tabular-nums">{binN}</span>
                  </div>
                  <input type="range" min={4} max={28} step={1} value={binN} onChange={(e) => setBinN(Number(e.target.value))} className="w-full accent-[#15803D]" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Success prob p</span>
                    <span className="font-mono tabular-nums">{binP.toFixed(2)}</span>
                  </div>
                  <input type="range" min={0.05} max={0.95} step={0.05} value={binP} onChange={(e) => setBinP(Number(e.target.value))} className="w-full accent-[#15803D]" />
                </div>
                <div className="text-xs font-mono bg-[#F8FAF8] dark:bg-[#0E1712] p-3 rounded-lg border border-[#E2ECE4] dark:border-[#203026] space-y-1">
                  <div>E[X] = np = {(binN * binP).toFixed(2)}</div>
                  <div>Var(X) = np(1-p) = {(binN * binP * (1 - binP)).toFixed(2)}</div>
                </div>
              </>
            )}

            {distType === 'exponential' && (
              <>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Rate λ</span>
                    <span className="font-mono tabular-nums">{expLambda.toFixed(2)}</span>
                  </div>
                  <input type="range" min={0.3} max={2.5} step={0.1} value={expLambda} onChange={(e) => setExpLambda(Number(e.target.value))} className="w-full accent-[#15803D]" />
                </div>
                <div className="text-xs font-mono bg-[#F8FAF8] dark:bg-[#0E1712] p-3 rounded-lg border border-[#E2ECE4] dark:border-[#203026] space-y-1">
                  <div>Mean 1/λ = {(1 / expLambda).toFixed(3)}</div>
                  <div>Median ln(2)/λ = {(Math.LN2 / expLambda).toFixed(3)}</div>
                  <div>Var(X) = 1/λ² = {(1 / expLambda ** 2).toFixed(3)}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {mode === 'regression' && (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 p-4 bg-[#F8FAF8] dark:bg-[#0E1712] border-b lg:border-b-0 lg:border-r border-[#E5EFE7] dark:border-[#1E2E24]">
            <svg viewBox="0 0 520 260" className="w-full h-auto rounded-lg bg-white dark:bg-[#101914] border border-[#E2ECE4] dark:border-[#203026]">
              {/* Axes x in [0,18], y in [0,10] */}
              <line x1={38} y1={225} x2={498} y2={225} className="stroke-[#647067]" strokeWidth={1.3} />
              <line x1={38} y1={18} x2={38} y2={225} className="stroke-[#647067]" strokeWidth={1.3} />
              {[0, 5, 10, 15].map((tx) => (
                <text key={tx} x={38 + (tx / 18) * 450 - 4} y={242} className="fill-[#647067] dark:fill-[#8DA295] text-[10px] font-mono">
                  {tx}
                </text>
              ))}
              {[0, 2, 4, 6, 8, 10].map((ty) => (
                <text key={ty} x={14} y={229 - (ty / 10) * 200} className="fill-[#647067] dark:fill-[#8DA295] text-[10px] font-mono">
                  {ty}
                </text>
              ))}

              {/* Fitted OLS line */}
              <line
                x1={38}
                y1={225 - ((ols.b0 + ols.b1 * 0) / 10) * 200}
                x2={38 + (17 / 18) * 450}
                y2={225 - ((ols.b0 + ols.b1 * 17) / 10) * 200}
                className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                strokeWidth={2.5}
              />

              {/* Residual lines and points */}
              {ols.pts.map((p, idx) => {
                const px = 38 + (p.x / 18) * 450;
                const py = 225 - (p.y / 10) * 200;
                const yhat = ols.b0 + ols.b1 * p.x;
                const pyHat = 225 - (yhat / 10) * 200;
                const isExtra = includeOutlier && idx === ols.pts.length - 1;
                return (
                  <g key={idx}>
                    <line x1={px} y1={py} x2={px} y2={pyHat} className="stroke-amber-500/70" strokeDasharray="3 2" strokeWidth={1.4} />
                    <circle
                      cx={px}
                      cy={py}
                      r={isExtra ? 6.5 : 5}
                      className={
                        isExtra
                          ? 'fill-amber-500 stroke-white dark:stroke-[#101914]'
                          : 'fill-[#15803D] dark:fill-[#4ADE80]'
                      }
                      strokeWidth={1.8}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="lg:col-span-4 p-4 space-y-3.5">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={includeOutlier}
                onChange={(e) => setIncludeOutlier(e.target.checked)}
                className="accent-[#15803D] w-4 h-4"
              />
              Include high-leverage point ({levX}, {levY})
            </label>

            {includeOutlier && (
              <>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Leverage point x₆</span>
                    <span className="font-mono tabular-nums">{levX}</span>
                  </div>
                  <input type="range" min={6} max={17} step={0.5} value={levX} onChange={(e) => setLevX(Number(e.target.value))} className="w-full accent-amber-600" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Leverage point y₆</span>
                    <span className="font-mono tabular-nums">{levY}</span>
                  </div>
                  <input type="range" min={1} max={9.5} step={0.5} value={levY} onChange={(e) => setLevY(Number(e.target.value))} className="w-full accent-amber-600" />
                </div>
              </>
            )}

            <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-3 space-y-1.5 text-xs font-mono tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#647067] dark:text-[#93A89B]">OLS Fit</span>
                <span className="font-semibold text-[#15803D] dark:text-[#4ADE80]">
                  ŷ = {ols.b0.toFixed(3)} {ols.b1 >= 0 ? '+' : '-'} {Math.abs(ols.b1).toFixed(3)}x
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#647067] dark:text-[#93A89B]">Correlation r / R²</span>
                <span>{ols.r.toFixed(3)} / {ols.r2.toFixed(3)}</span>
              </div>
              {includeOutlier && (
                <>
                  <div className="flex justify-between pt-1 border-t border-[#E5EFE7] dark:border-[#1E2E24]">
                    <span className="text-[#647067] dark:text-[#93A89B]">Leverage h₆₆</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">{ols.hLast.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#647067] dark:text-[#93A89B]">Cook&apos;s Distance D₆</span>
                    <span className={`font-semibold ${ols.cookLast > 1 ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                      {ols.cookLast.toFixed(2)} {ols.cookLast > 1 ? '(Influential!)' : ''}
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setIncludeOutlier(true);
                setLevX(15);
                setLevY(3);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#647067] hover:text-[#15803D] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restore F40.7 worked example (15, 3)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
