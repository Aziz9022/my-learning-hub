import React, { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';

type CalcMode = 'derivative' | 'integral' | 'taylor';

interface CalculusSuiteVizProps {
  defaultMode?: CalcMode;
}

const FUNCTIONS = [
  {
    id: 'quad',
    label: 'f(x) = 0.4x² - 0.5x',
    fn: (x: number) => 0.4 * x * x - 0.5 * x,
    df: (x: number) => 0.8 * x - 0.5,
    integral: (a: number, b: number) =>
      (0.4 / 3) * (b ** 3 - a ** 3) - 0.25 * (b ** 2 - a ** 2),
  },
  {
    id: 'cubic',
    label: 'f(x) = 0.2x³ - 0.8x',
    fn: (x: number) => 0.2 * x ** 3 - 0.8 * x,
    df: (x: number) => 0.6 * x ** 2 - 0.8,
    integral: (a: number, b: number) =>
      0.05 * (b ** 4 - a ** 4) - 0.4 * (b ** 2 - a ** 2),
  },
  {
    id: 'sin',
    label: 'f(x) = 1.6 sin(x)',
    fn: (x: number) => 1.6 * Math.sin(x),
    df: (x: number) => 1.6 * Math.cos(x),
    integral: (a: number, b: number) => 1.6 * (-Math.cos(b) + Math.cos(a)),
  },
  {
    id: 'exp',
    label: 'f(x) = 0.7 e^(0.4x)',
    fn: (x: number) => 0.7 * Math.exp(0.4 * x),
    df: (x: number) => 0.28 * Math.exp(0.4 * x),
    integral: (a: number, b: number) =>
      (0.7 / 0.4) * (Math.exp(0.4 * b) - Math.exp(0.4 * a)),
  },
];

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export const CalculusSuiteViz: React.FC<CalculusSuiteVizProps> = ({
  defaultMode = 'derivative',
}) => {
  const [mode, setMode] = useState<CalcMode>(defaultMode);
  const [fnIdx, setFnIdx] = useState(0);

  // Derivative controls
  const [x0, setX0] = useState(1.2);
  const [h, setH] = useState(1.0);

  // Integral controls
  const [nRects, setNRects] = useState(8);
  const [rule, setRule] = useState<'left' | 'midpoint' | 'right'>('midpoint');
  const aBound = -2;
  const bBound = 2.5;

  // Taylor controls
  const [taylorFn, setTaylorFn] = useState<'sin' | 'cos' | 'exp'>('sin');
  const [degree, setDegree] = useState(3);

  const selectedFn = FUNCTIONS[fnIdx];

  // SVG coordinate helpers
  const W = 560;
  const H = 300;
  const xMin = -4;
  const xMax = 4;
  const yMin = -3.2;
  const yMax = 3.2;
  const toX = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  const toY = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;

  const curvePath = useMemo(() => {
    const pts: string[] = [];
    const evalFn =
      mode === 'taylor'
        ? taylorFn === 'sin'
          ? Math.sin
          : taylorFn === 'cos'
          ? Math.cos
          : Math.exp
        : selectedFn.fn;
    for (let i = 0; i <= 180; i++) {
      const x = xMin + ((xMax - xMin) * i) / 180;
      const y = evalFn(x);
      if (y > yMax + 4 || y < yMin - 4) continue;
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${toX(x).toFixed(1)} ${toY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  }, [mode, selectedFn, taylorFn]);

  const taylorEval = (x: number) => {
    let sum = 0;
    for (let k = 0; k <= degree; k++) {
      if (taylorFn === 'exp') {
        sum += Math.pow(x, k) / factorial(k);
      } else if (taylorFn === 'sin' && k % 2 === 1) {
        sum += (Math.pow(-1, (k - 1) / 2) * Math.pow(x, k)) / factorial(k);
      } else if (taylorFn === 'cos' && k % 2 === 0) {
        sum += (Math.pow(-1, k / 2) * Math.pow(x, k)) / factorial(k);
      }
    }
    return sum;
  };

  const taylorPath = useMemo(() => {
    if (mode !== 'taylor') return '';
    const pts: string[] = [];
    for (let i = 0; i <= 180; i++) {
      const x = xMin + ((xMax - xMin) * i) / 180;
      const y = taylorEval(x);
      if (y > yMax + 4 || y < yMin - 4) continue;
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${toX(x).toFixed(1)} ${toY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  }, [mode, taylorFn, degree]);

  // Derivative calculations
  const y0 = selectedFn.fn(x0);
  const exactSlope = selectedFn.df(x0);
  const x1 = x0 + h;
  const y1 = selectedFn.fn(x1);
  const secantSlope = Math.abs(h) > 1e-4 ? (y1 - y0) / h : exactSlope;

  // Integral calculations
  const dx = (bBound - aBound) / nRects;
  const rects = useMemo(() => {
    const out: Array<{ x: number; sampleX: number; val: number }> = [];
    for (let i = 0; i < nRects; i++) {
      const leftX = aBound + i * dx;
      const sampleX =
        rule === 'left' ? leftX : rule === 'right' ? leftX + dx : leftX + dx / 2;
      out.push({ x: leftX, sampleX, val: selectedFn.fn(sampleX) });
    }
    return out;
  }, [nRects, rule, selectedFn, dx]);

  const riemannSum = rects.reduce((acc, r) => acc + r.val * dx, 0);
  const exactIntegral = selectedFn.integral(aBound, bBound);

  return (
    <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] overflow-hidden">
      {/* Header & Mode Switch */}
      <div className="px-5 py-4 border-b border-[#E5EFE7] dark:border-[#1E2E24] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#17211B] dark:text-[#ECF2EE]">
            Interactive Calculus Explorer
          </h3>
          <p className="text-xs text-[#647067] dark:text-[#93A89B]">
            Explore limits & tangent slopes, Riemann sum integration, and Taylor series convergence.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {([
            ['derivative', 'Tangent & Limit'],
            ['integral', 'Riemann Integral'],
            ['taylor', 'Taylor Series'],
          ] as const).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                mode === m
                  ? 'bg-[#15803D] text-white'
                  : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5] hover:bg-[#DCFCE7] dark:hover:bg-[#23382C]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-zone sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Visual Canvas Stage */}
        <div className="lg:col-span-8 p-4 bg-[#F8FAF8] dark:bg-[#0E1712] border-b lg:border-b-0 lg:border-r border-[#E5EFE7] dark:border-[#1E2E24]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto rounded-lg bg-white dark:bg-[#101914] border border-[#E2ECE4] dark:border-[#203026]"
            role="img"
            aria-label="Calculus interactive coordinate plot"
          >
            {/* Grid lines */}
            {[-3, -2, -1, 0, 1, 2, 3].map((gx) => (
              <g key={`gx-${gx}`}>
                <line
                  x1={toX(gx)}
                  y1={0}
                  x2={toX(gx)}
                  y2={H}
                  className={
                    gx === 0
                      ? 'stroke-[#647067] dark:stroke-[#7F9788]'
                      : 'stroke-[#E8EFE9] dark:stroke-[#1B2920]'
                  }
                  strokeWidth={gx === 0 ? 1.4 : 1}
                />
                {gx !== 0 && (
                  <text
                    x={toX(gx) + 3}
                    y={toY(0) + 13}
                    className="fill-[#647067] dark:fill-[#8DA295] text-[10px] font-mono"
                  >
                    {gx}
                  </text>
                )}
              </g>
            ))}
            {[-3, -2, -1, 0, 1, 2, 3].map((gy) => (
              <g key={`gy-${gy}`}>
                <line
                  x1={0}
                  y1={toY(gy)}
                  x2={W}
                  y2={toY(gy)}
                  className={
                    gy === 0
                      ? 'stroke-[#647067] dark:stroke-[#7F9788]'
                      : 'stroke-[#E8EFE9] dark:stroke-[#1B2920]'
                  }
                  strokeWidth={gy === 0 ? 1.4 : 1}
                />
                {gy !== 0 && (
                  <text
                    x={toX(0) + 5}
                    y={toY(gy) + 3}
                    className="fill-[#647067] dark:fill-[#8DA295] text-[10px] font-mono"
                  >
                    {gy}
                  </text>
                )}
              </g>
            ))}

            {/* Axis labels */}
            <text x={W - 14} y={toY(0) - 6} className="fill-[#4B5850] dark:fill-[#A7BBB0] text-[11px] font-semibold">
              x
            </text>
            <text x={toX(0) + 8} y={14} className="fill-[#4B5850] dark:fill-[#A7BBB0] text-[11px] font-semibold">
              y
            </text>

            {/* Riemann Rectangles */}
            {mode === 'integral' &&
              rects.map((r, i) => {
                const topY = r.val >= 0 ? toY(r.val) : toY(0);
                const rectH = Math.abs(toY(r.val) - toY(0));
                return (
                  <rect
                    key={i}
                    x={toX(r.x)}
                    y={topY}
                    width={Math.max(1, toX(r.x + dx) - toX(r.x) - 0.5)}
                    height={rectH}
                    className={
                      r.val >= 0
                        ? 'fill-[#15803D]/25 stroke-[#15803D] dark:fill-[#4ADE80]/25 dark:stroke-[#4ADE80]'
                        : 'fill-amber-500/25 stroke-amber-600 dark:fill-amber-400/25 dark:stroke-amber-400'
                    }
                    strokeWidth={1}
                  />
                );
              })}

            {/* Primary Function Curve */}
            <path
              d={curvePath}
              fill="none"
              className="stroke-[#15803D] dark:stroke-[#4ADE80]"
              strokeWidth={2.5}
            />

            {/* Taylor Polynomial Curve */}
            {mode === 'taylor' && (
              <path
                d={taylorPath}
                fill="none"
                className="stroke-amber-600 dark:stroke-amber-400"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            )}

            {/* Derivative Tangent & Secant Lines */}
            {mode === 'derivative' && (
              <>
                {/* Exact Tangent Line */}
                <line
                  x1={toX(x0 - 2.5)}
                  y1={toY(y0 - 2.5 * exactSlope)}
                  x2={toX(x0 + 2.5)}
                  y2={toY(y0 + 2.5 * exactSlope)}
                  className="stroke-[#0284C7] dark:stroke-[#38BDF8]"
                  strokeWidth={2}
                />
                {/* Secant Line */}
                {Math.abs(h) > 0.02 && (
                  <>
                    <line
                      x1={toX(x0 - 1.5)}
                      y1={toY(y0 - 1.5 * secantSlope)}
                      x2={toX(x1 + 1.5)}
                      y2={toY(y1 + 1.5 * secantSlope)}
                      className="stroke-amber-600 dark:stroke-amber-400"
                      strokeWidth={1.6}
                      strokeDasharray="5 4"
                    />
                    <circle
                      cx={toX(x1)}
                      cy={toY(y1)}
                      r={4.5}
                      className="fill-amber-500 stroke-white dark:stroke-[#101914]"
                      strokeWidth={1.5}
                    />
                  </>
                )}
                {/* Point (x0, f(x0)) */}
                <circle
                  cx={toX(x0)}
                  cy={toY(y0)}
                  r={5.5}
                  className="fill-[#0284C7] dark:fill-[#38BDF8] stroke-white dark:stroke-[#101914]"
                  strokeWidth={2}
                />
              </>
            )}
          </svg>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#4B5850] dark:text-[#A8BCB0]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#15803D] dark:bg-[#4ADE80] inline-block" />
              Original function f(x)
            </span>
            {mode === 'derivative' && (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#0284C7] dark:bg-[#38BDF8] inline-block" />
                  Tangent line (exact slope f&apos;(x₀))
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-600 dark:bg-amber-400 inline-block" />
                  Secant line (step h)
                </span>
              </>
            )}
            {mode === 'taylor' && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-600 dark:bg-amber-400 inline-block" />
                Maclaurin polynomial T_{degree}(x)
              </span>
            )}
            {mode === 'integral' && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#15803D]/25 border border-[#15803D] inline-block" />
                Positive area (amber = negative signed area)
              </span>
            )}
          </div>
        </div>

        {/* Control & Concept Deck */}
        <div className="lg:col-span-4 p-4 space-y-4">
          {mode !== 'taylor' ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#647067] dark:text-[#93A89B] mb-1.5">
                Function
              </label>
              <select
                value={fnIdx}
                onChange={(e) => setFnIdx(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D7E3DA] dark:border-[#293D31] bg-[#F8FAF8] dark:bg-[#0E1712] px-3 py-2 text-xs font-mono text-[#17211B] dark:text-[#ECF2EE]"
              >
                {FUNCTIONS.map((f, idx) => (
                  <option key={f.id} value={idx}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#647067] dark:text-[#93A89B] mb-1.5">
                Target Function (centered at a = 0)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['sin', 'cos', 'exp'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTaylorFn(tf)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-medium cursor-pointer ${
                      taylorFn === tf
                        ? 'bg-[#15803D] text-white'
                        : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5]'
                    }`}
                  >
                    {tf === 'exp' ? 'e^x' : `${tf}(x)`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'derivative' && (
            <>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#17211B] dark:text-[#ECF2EE]">Point x₀</span>
                  <span className="font-mono tabular-nums text-[#15803D] dark:text-[#4ADE80]">
                    {x0.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={-2.8}
                  max={2.8}
                  step={0.05}
                  value={x0}
                  onChange={(e) => setX0(Number(e.target.value))}
                  className="w-full accent-[#15803D]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#17211B] dark:text-[#ECF2EE]">
                    Secant step h → 0
                  </span>
                  <span className="font-mono tabular-nums text-amber-700 dark:text-amber-400">
                    h = {h.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={2.0}
                  step={0.01}
                  value={h}
                  onChange={(e) => setH(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-3 space-y-1.5 text-xs font-mono tabular-nums">
                <div className="flex justify-between">
                  <span className="text-[#647067] dark:text-[#93A89B]">f(x₀)</span>
                  <span className="font-semibold text-[#17211B] dark:text-[#ECF2EE]">{y0.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647067] dark:text-[#93A89B]">Secant [f(x₀+h)-f(x₀)]/h</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-400">{secantSlope.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647067] dark:text-[#93A89B]">Exact Derivative f&apos;(x₀)</span>
                  <span className="font-semibold text-[#0284C7] dark:text-[#38BDF8]">{exactSlope.toFixed(3)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E5EFE7] dark:border-[#1E2E24]">
                  <span className="text-[#647067] dark:text-[#93A89B]">Approximation Error</span>
                  <span>{Math.abs(secantSlope - exactSlope).toFixed(4)}</span>
                </div>
              </div>
            </>
          )}

          {mode === 'integral' && (
            <>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#17211B] dark:text-[#ECF2EE]">
                    Subintervals n (on [{aBound}, {bBound}])
                  </span>
                  <span className="font-mono tabular-nums text-[#15803D] dark:text-[#4ADE80]">
                    n = {nRects} (Δx = {dx.toFixed(2)})
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={40}
                  step={1}
                  value={nRects}
                  onChange={(e) => setNRects(Number(e.target.value))}
                  className="w-full accent-[#15803D]"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {(['left', 'midpoint', 'right'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRule(r)}
                    className={`py-1.5 rounded-lg text-xs font-medium capitalize cursor-pointer ${
                      rule === r
                        ? 'bg-[#15803D] text-white'
                        : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-3 space-y-1.5 text-xs font-mono tabular-nums">
                <div className="flex justify-between">
                  <span className="text-[#647067] dark:text-[#93A89B]">Riemann Sum S_n</span>
                  <span className="font-semibold text-[#15803D] dark:text-[#4ADE80]">
                    {riemannSum.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647067] dark:text-[#93A89B]">Exact Integral (FTC)</span>
                  <span className="font-semibold text-[#17211B] dark:text-[#ECF2EE]">
                    {exactIntegral.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E5EFE7] dark:border-[#1E2E24]">
                  <span className="text-[#647067] dark:text-[#93A89B]">|Error|</span>
                  <span>{Math.abs(riemannSum - exactIntegral).toFixed(4)}</span>
                </div>
              </div>
            </>
          )}

          {mode === 'taylor' && (
            <>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#17211B] dark:text-[#ECF2EE]">
                    Polynomial Degree N
                  </span>
                  <span className="font-mono tabular-nums text-[#15803D] dark:text-[#4ADE80]">
                    N = {degree}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={11}
                  step={1}
                  value={degree}
                  onChange={(e) => setDegree(Number(e.target.value))}
                  className="w-full accent-[#15803D]"
                />
              </div>

              <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-3 space-y-1.5 text-xs font-mono tabular-nums">
                <div className="flex justify-between">
                  <span className="text-[#647067] dark:text-[#93A89B]">True f(2.0)</span>
                  <span>
                    {(taylorFn === 'sin'
                      ? Math.sin(2)
                      : taylorFn === 'cos'
                      ? Math.cos(2)
                      : Math.exp(2)
                    ).toFixed(5)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647067] dark:text-[#93A89B]">Taylor T_{degree}(2.0)</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    {taylorEval(2).toFixed(5)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E5EFE7] dark:border-[#1E2E24]">
                  <span className="text-[#647067] dark:text-[#93A89B]">Error at x = 2.0</span>
                  <span>
                    {Math.abs(
                      taylorEval(2) -
                        (taylorFn === 'sin'
                          ? Math.sin(2)
                          : taylorFn === 'cos'
                          ? Math.cos(2)
                          : Math.exp(2))
                    ).toFixed(5)}
                  </span>
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setX0(1.2);
              setH(1.0);
              setNRects(8);
              setDegree(3);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#647067] hover:text-[#15803D] dark:text-[#93A89B] dark:hover:text-[#4ADE80] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset parameters
          </button>
        </div>
      </div>
    </div>
  );
};
