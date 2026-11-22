import React, { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';

type LinOdeMode = 'matrix' | 'ode';

interface LinearAlgebraODEVizProps {
  defaultMode?: LinOdeMode;
}

const MATRIX_PRESETS = [
  { name: 'Shear', m: [1, 0.8, 0, 1] as const },
  { name: 'Anisotropic Scale', m: [1.8, 0, 0, 0.6] as const },
  { name: 'Rotation 45°', m: [0.71, -0.71, 0.71, 0.71] as const },
  { name: 'Symmetric (Real Eigen)', m: [1.5, 0.7, 0.7, 1.0] as const },
  { name: 'Rank-1 Projection', m: [1, 1, 0.5, 0.5] as const },
];

const ODES = [
  {
    id: 'growth',
    label: "y' = 0.6y  (Exponential Growth)",
    f: (_t: number, y: number) => 0.6 * y,
    exact: (t: number, y0: number) => y0 * Math.exp(0.6 * t),
  },
  {
    id: 'decay',
    label: "y' = -0.8y  (Exponential Decay)",
    f: (_t: number, y: number) => -0.8 * y,
    exact: (t: number, y0: number) => y0 * Math.exp(-0.8 * t),
  },
  {
    id: 'logistic',
    label: "y' = y(1 - y/3)  (Logistic, K = 3)",
    f: (_t: number, y: number) => y * (1 - y / 3),
    exact: (t: number, y0: number) =>
      Math.abs(y0) < 1e-6 ? 0 : (3 * y0) / (y0 + (3 - y0) * Math.exp(-t)),
  },
];

export const LinearAlgebraODEViz: React.FC<LinearAlgebraODEVizProps> = ({
  defaultMode = 'matrix',
}) => {
  const [mode, setMode] = useState<LinOdeMode>(defaultMode);

  // 2x2 Matrix [a b ; c d]
  const [a, setA] = useState(1.5);
  const [b, setB] = useState(0.7);
  const [c, setC] = useState(0.7);
  const [d, setD] = useState(1.0);

  // ODE controls
  const [odeIdx, setOdeIdx] = useState(2);
  const [stepH, setStepH] = useState(0.5);
  const [y0, setY0] = useState(0.5);

  const W = 520;
  const H = 300;

  // Matrix eigen calculations
  const det = a * d - b * c;
  const trace = a + d;
  const disc = trace * trace - 4 * det;
  const realEigen = useMemo(() => {
    if (disc < -1e-6) return null;
    const sqrtD = Math.sqrt(Math.max(0, disc));
    const l1 = (trace + sqrtD) / 2;
    const l2 = (trace - sqrtD) / 2;
    const getVec = (lam: number): [number, number] => {
      if (Math.abs(b) > 1e-4) {
        const vx = b;
        const vy = lam - a;
        const norm = Math.hypot(vx, vy) || 1;
        return [vx / norm, vy / norm];
      }
      if (Math.abs(c) > 1e-4) {
        const vx = lam - d;
        const vy = c;
        const norm = Math.hypot(vx, vy) || 1;
        return [vx / norm, vy / norm];
      }
      return Math.abs(lam - a) < Math.abs(lam - d) ? [1, 0] : [0, 1];
    };
    return { l1, l2, v1: getVec(l1), v2: getVec(l2) };
  }, [a, b, c, d, trace, disc]);

  const toMX = (x: number) => W / 2 + x * 52;
  const toMY = (y: number) => H / 2 - y * 52;

  // ODE helpers
  const ode = ODES[odeIdx];
  const tMax = 4.0;
  const oyMin = -0.5;
  const oyMax = 4.0;
  const toOX = (t: number) => 42 + (t / tMax) * (W - 60);
  const toOY = (y: number) => H - 28 - ((y - oyMin) / (oyMax - oyMin)) * (H - 46);

  const eulerPts = useMemo(() => {
    const pts: Array<{ t: number; y: number }> = [{ t: 0, y: y0 }];
    let t = 0;
    let y = y0;
    let guard = 0;
    while (t < tMax - 1e-6 && guard < 120) {
      const hCur = Math.min(stepH, tMax - t);
      y = y + hCur * ode.f(t, y);
      t = t + hCur;
      pts.push({ t, y });
      guard++;
    }
    return pts;
  }, [ode, y0, stepH]);

  const exactPath = useMemo(() => {
    const segs: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const t = (tMax * i) / 120;
      const y = ode.exact(t, y0);
      if (y > oyMax + 2 || y < oyMin - 2) continue;
      segs.push(`${segs.length === 0 ? 'M' : 'L'} ${toOX(t).toFixed(1)} ${toOY(y).toFixed(1)}`);
    }
    return segs.join(' ');
  }, [ode, y0]);

  const finalEuler = eulerPts[eulerPts.length - 1];
  const finalExact = ode.exact(tMax, y0);

  return (
    <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5EFE7] dark:border-[#1E2E24] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#17211B] dark:text-[#ECF2EE]">
            {mode === 'matrix'
              ? '2D Linear Transformation, Determinant & Eigenvectors'
              : "ODE Direction Field & Euler's Method Explorer"}
          </h3>
          <p className="text-xs text-[#647067] dark:text-[#93A89B]">
            {mode === 'matrix'
              ? 'Modify matrix A = [a b ; c d] to watch unit square area (|det A|), transformed basis, and eigendirections.'
              : "Compare forward Euler polygonal steps (F16.5) against the exact solution across the slope field."}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
              mode === 'matrix'
                ? 'bg-[#15803D] text-white'
                : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5]'
            }`}
          >
            Linear Algebra (2×2)
          </button>
          <button
            type="button"
            onClick={() => setMode('ode')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
              mode === 'ode'
                ? 'bg-[#15803D] text-white'
                : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5]'
            }`}
          >
            ODE & Euler Method
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 p-4 bg-[#F8FAF8] dark:bg-[#0E1712] border-b lg:border-b-0 lg:border-r border-[#E5EFE7] dark:border-[#1E2E24]">
          {mode === 'matrix' ? (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto rounded-lg bg-white dark:bg-[#101914] border border-[#E2ECE4] dark:border-[#203026]"
              role="img"
              aria-label="2D Matrix Transformation plot"
            >
              {/* Background reference grid */}
              {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => (
                <g key={k}>
                  <line
                    x1={toMX(k)}
                    y1={0}
                    x2={toMX(k)}
                    y2={H}
                    className={
                      k === 0
                        ? 'stroke-[#647067] dark:stroke-[#7F9788]'
                        : 'stroke-[#EDF3EE] dark:stroke-[#18241C]'
                    }
                    strokeWidth={k === 0 ? 1.3 : 1}
                  />
                  <line
                    x1={0}
                    y1={toMY(k)}
                    x2={W}
                    y2={toMY(k)}
                    className={
                      k === 0
                        ? 'stroke-[#647067] dark:stroke-[#7F9788]'
                        : 'stroke-[#EDF3EE] dark:stroke-[#18241C]'
                    }
                    strokeWidth={k === 0 ? 1.3 : 1}
                  />
                </g>
              ))}

              {/* Transformed grid lines */}
              {[-2, -1, 1, 2].map((k) => (
                <g key={`t-${k}`} opacity={0.35}>
                  <line
                    x1={toMX(a * k + b * -3)}
                    y1={toMY(c * k + d * -3)}
                    x2={toMX(a * k + b * 3)}
                    y2={toMY(c * k + d * 3)}
                    className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                    strokeWidth={1}
                  />
                  <line
                    x1={toMX(a * -3 + b * k)}
                    y1={toMY(c * -3 + d * k)}
                    x2={toMX(a * 3 + b * k)}
                    y2={toMY(c * 3 + d * k)}
                    className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                    strokeWidth={1}
                  />
                </g>
              ))}

              {/* Transformed Unit Square (Determinant Area) */}
              <polygon
                points={`${toMX(0)},${toMY(0)} ${toMX(a)},${toMY(c)} ${toMX(a + b)},${toMY(c + d)} ${toMX(b)},${toMY(d)}`}
                className={
                  det >= 0
                    ? 'fill-[#15803D]/20 stroke-[#15803D] dark:fill-[#4ADE80]/20 dark:stroke-[#4ADE80]'
                    : 'fill-rose-500/20 stroke-rose-600 dark:fill-rose-400/20 dark:stroke-rose-400'
                }
                strokeWidth={1.5}
              />

              {/* Eigenvector lines (if real) */}
              {realEigen && (
                <>
                  <line
                    x1={toMX(-realEigen.v1[0] * 3.5)}
                    y1={toMY(-realEigen.v1[1] * 3.5)}
                    x2={toMX(realEigen.v1[0] * 3.5)}
                    y2={toMY(realEigen.v1[1] * 3.5)}
                    className="stroke-amber-600 dark:stroke-amber-400"
                    strokeWidth={1.6}
                    strokeDasharray="6 4"
                  />
                  <line
                    x1={toMX(-realEigen.v2[0] * 3.5)}
                    y1={toMY(-realEigen.v2[1] * 3.5)}
                    x2={toMX(realEigen.v2[0] * 3.5)}
                    y2={toMY(realEigen.v2[1] * 3.5)}
                    className="stroke-purple-600 dark:stroke-purple-400"
                    strokeWidth={1.6}
                    strokeDasharray="6 4"
                  />
                </>
              )}

              {/* Basis vectors A*e1 and A*e2 */}
              <line
                x1={toMX(0)}
                y1={toMY(0)}
                x2={toMX(a)}
                y2={toMY(c)}
                className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                strokeWidth={3}
              />
              <circle cx={toMX(a)} cy={toMY(c)} r={4.5} className="fill-[#15803D] dark:fill-[#4ADE80]" />
              <text
                x={toMX(a) + 7}
                y={toMY(c) - 4}
                className="fill-[#14532D] dark:fill-[#86EFAC] text-[11px] font-mono font-bold"
              >
                Ae₁ ({a.toFixed(1)}, {c.toFixed(1)})
              </text>

              <line
                x1={toMX(0)}
                y1={toMY(0)}
                x2={toMX(b)}
                y2={toMY(d)}
                className="stroke-[#0284C7] dark:stroke-[#38BDF8]"
                strokeWidth={3}
              />
              <circle cx={toMX(b)} cy={toMY(d)} r={4.5} className="fill-[#0284C7] dark:fill-[#38BDF8]" />
              <text
                x={toMX(b) + 7}
                y={toMY(d) + 12}
                className="fill-[#0369A1] dark:fill-[#7DD3FC] text-[11px] font-mono font-bold"
              >
                Ae₂ ({b.toFixed(1)}, {d.toFixed(1)})
              </text>
            </svg>
          ) : (
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto rounded-lg bg-white dark:bg-[#101914] border border-[#E2ECE4] dark:border-[#203026]"
              role="img"
              aria-label="ODE direction field and Euler method"
            >
              {/* Axes */}
              <line x1={toOX(0)} y1={14} x2={toOX(0)} y2={H - 22} className="stroke-[#647067]" strokeWidth={1.3} />
              <line x1={36} y1={toOY(0)} x2={W - 14} y2={toOY(0)} className="stroke-[#647067]" strokeWidth={1.3} />
              {[0, 1, 2, 3, 4].map((tk) => (
                <text key={`ot-${tk}`} x={toOX(tk) - 3} y={H - 10} className="fill-[#647067] dark:fill-[#8DA295] text-[10px] font-mono">
                  {tk}
                </text>
              ))}
              {[0, 1, 2, 3].map((yk) => (
                <text key={`oy-${yk}`} x={18} y={toOY(yk) + 3} className="fill-[#647067] dark:fill-[#8DA295] text-[10px] font-mono">
                  {yk}
                </text>
              ))}
              <text x={W - 16} y={toOY(0) - 5} className="fill-[#4B5850] dark:fill-[#A7BBB0] text-[11px] font-semibold">t</text>
              <text x={toOX(0) + 6} y={18} className="fill-[#4B5850] dark:fill-[#A7BBB0] text-[11px] font-semibold">y(t)</text>

              {/* Slope Field */}
              {Array.from({ length: 13 }).map((_, ti) =>
                Array.from({ length: 9 }).map((__, yi) => {
                  const t = (tMax * ti) / 12;
                  const y = oyMin + ((oyMax - oyMin) * yi) / 8;
                  const slope = ode.f(t, y);
                  const angle = Math.atan(slope);
                  const seg = 9;
                  const dxPx = Math.cos(angle) * seg;
                  const dyPx = -Math.sin(angle) * seg;
                  const cx = toOX(t);
                  const cy = toOY(y);
                  return (
                    <line
                      key={`${ti}-${yi}`}
                      x1={cx - dxPx}
                      y1={cy - dyPx}
                      x2={cx + dxPx}
                      y2={cy + dyPx}
                      className="stroke-[#B7C9BC] dark:stroke-[#2D4436]"
                      strokeWidth={1.2}
                    />
                  );
                })
              )}

              {/* Exact Analytical Solution */}
              <path
                d={exactPath}
                fill="none"
                className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                strokeWidth={2.5}
              />

              {/* Euler Approximation Polyline */}
              <polyline
                fill="none"
                points={eulerPts
                  .filter((p) => p.y <= oyMax + 2 && p.y >= oyMin - 2)
                  .map((p) => `${toOX(p.t).toFixed(1)},${toOY(p.y).toFixed(1)}`)
                  .join(' ')}
                className="stroke-amber-600 dark:stroke-amber-400"
                strokeWidth={2}
              />
              {eulerPts
                .filter((p) => p.y <= oyMax + 1 && p.y >= oyMin - 1)
                .map((p, idx) => (
                  <circle
                    key={idx}
                    cx={toOX(p.t)}
                    cy={toOY(p.y)}
                    r={3.2}
                    className="fill-amber-600 dark:fill-amber-400"
                  />
                ))}
            </svg>
          )}
        </div>

        <div className="lg:col-span-4 p-4 space-y-4">
          {mode === 'matrix' ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                {MATRIX_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setA(p.m[0]);
                      setB(p.m[1]);
                      setC(p.m[2]);
                      setD(p.m[3]);
                    }}
                    className="px-2 py-1 rounded text-[11px] font-medium bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#2C3A31] dark:text-[#C8DACF] hover:bg-[#DCFCE7] dark:hover:bg-[#23382C] cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'a (row 1, col 1)', val: a, set: setA },
                  { label: 'b (row 1, col 2)', val: b, set: setB },
                  { label: 'c (row 2, col 1)', val: c, set: setC },
                  { label: 'd (row 2, col 2)', val: d, set: setD },
                ].map((ctrl) => (
                  <div key={ctrl.label}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-[#647067] dark:text-[#93A89B]">{ctrl.label.split(' ')[0]}</span>
                      <span className="font-mono tabular-nums font-semibold">{ctrl.val.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={-2}
                      max={2}
                      step={0.1}
                      value={ctrl.val}
                      onChange={(e) => ctrl.set(Number(e.target.value))}
                      className="w-full accent-[#15803D]"
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-3 space-y-1.5 text-xs font-mono tabular-nums">
                <div className="flex justify-between">
                  <span className="text-[#647067] dark:text-[#93A89B]">det(A) = ad - bc</span>
                  <span className={`font-semibold ${Math.abs(det) < 0.05 ? 'text-rose-600 dark:text-rose-400' : 'text-[#15803D] dark:text-[#4ADE80]'}`}>
                    {det.toFixed(2)} {Math.abs(det) < 0.05 ? '(Singular!)' : det < 0 ? '(Flips orientation)' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647067] dark:text-[#93A89B]">tr(A) = a + d</span>
                  <span>{trace.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E5EFE7] dark:border-[#1E2E24]">
                  <span className="text-[#647067] dark:text-[#93A89B]">Eigenvalues</span>
                  <span className="text-right">
                    {realEigen
                      ? `λ₁=${realEigen.l1.toFixed(2)}, λ₂=${realEigen.l2.toFixed(2)}`
                      : `Complex (${(trace / 2).toFixed(2)} ± ${(Math.sqrt(-disc) / 2).toFixed(2)}i)`}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#647067] dark:text-[#93A89B] mb-1.5">
                  First-Order ODE
                </label>
                <select
                  value={odeIdx}
                  onChange={(e) => setOdeIdx(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#D7E3DA] dark:border-[#293D31] bg-[#F8FAF8] dark:bg-[#0E1712] px-3 py-2 text-xs font-mono text-[#17211B] dark:text-[#ECF2EE]"
                >
                  {ODES.map((o, idx) => (
                    <option key={o.id} value={idx}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">Step size h</span>
                  <span className="font-mono tabular-nums text-amber-700 dark:text-amber-400">
                    h = {stepH.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.2}
                  step={0.05}
                  value={stepH}
                  onChange={(e) => setStepH(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">Initial value y(0)</span>
                  <span className="font-mono tabular-nums text-[#15803D] dark:text-[#4ADE80]">
                    y₀ = {y0.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={3.5}
                  step={0.1}
                  value={y0}
                  onChange={(e) => setY0(Number(e.target.value))}
                  className="w-full accent-[#15803D]"
                />
              </div>

              <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-3 space-y-1.5 text-xs font-mono tabular-nums">
                <div className="flex justify-between">
                  <span className="text-[#647067] dark:text-[#93A89B]">Exact y(4)</span>
                  <span className="font-semibold text-[#15803D] dark:text-[#4ADE80]">{finalExact.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647067] dark:text-[#93A89B]">Euler y_N(4)</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-400">{finalEuler.y.toFixed(4)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E5EFE7] dark:border-[#1E2E24]">
                  <span className="text-[#647067] dark:text-[#93A89B]">Global Error at t = 4</span>
                  <span>{Math.abs(finalEuler.y - finalExact).toFixed(4)}</span>
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setA(1.5);
              setB(0.7);
              setC(0.7);
              setD(1.0);
              setStepH(0.5);
              setY0(0.5);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#647067] hover:text-[#15803D] dark:text-[#93A89B] dark:hover:text-[#4ADE80] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset defaults
          </button>
        </div>
      </div>
    </div>
  );
};
