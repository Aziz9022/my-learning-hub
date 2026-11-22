import React, { useEffect, useMemo, useState } from 'react';
import { Pause, Play, Plus, RotateCcw, Shuffle, StepForward, Trash2 } from 'lucide-react';

type CSMode = 'sorting' | 'heap' | 'amdahl' | 'dfa';

interface CSAlgorithmsVizProps {
  defaultMode?: CSMode;
}

interface SortStep {
  arr: number[];
  compare: [number, number] | null;
  sorted: number[];
  comparisons: number;
  swaps: number;
  note: string;
}

function generateSortSteps(initial: number[], algo: 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick'): SortStep[] {
  const a = [...initial];
  const steps: SortStep[] = [
    { arr: [...a], compare: null, sorted: [], comparisons: 0, swaps: 0, note: 'Initial unsorted array' },
  ];
  let comparisons = 0;
  let swaps = 0;
  const n = a.length;

  if (algo === 'bubble') {
    const sorted: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j++) {
        comparisons++;
        steps.push({
          arr: [...a],
          compare: [j, j + 1],
          sorted: [...sorted],
          comparisons,
          swaps,
          note: `Compare a[${j}]=${a[j]} and a[${j + 1}]=${a[j + 1]}`,
        });
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          swaps++;
          swapped = true;
          steps.push({
            arr: [...a],
            compare: [j, j + 1],
            sorted: [...sorted],
            comparisons,
            swaps,
            note: `Swapped -> ${a[j]} before ${a[j + 1]}`,
          });
        }
      }
      sorted.push(n - 1 - i);
      if (!swapped) break;
    }
    steps.push({
      arr: [...a],
      compare: null,
      sorted: a.map((_, idx) => idx),
      comparisons,
      swaps,
      note: 'Sorted! (Bubble Sort complete)',
    });
  } else if (algo === 'selection') {
    const sorted: number[] = [];
    for (let i = 0; i < n; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        comparisons++;
        steps.push({
          arr: [...a],
          compare: [minIdx, j],
          sorted: [...sorted],
          comparisons,
          swaps,
          note: `Check if a[${j}]=${a[j]} < current min a[${minIdx}]=${a[minIdx]}`,
        });
        if (a[j] < a[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        swaps++;
      }
      sorted.push(i);
      steps.push({
        arr: [...a],
        compare: null,
        sorted: [...sorted],
        comparisons,
        swaps,
        note: `Placed minimum ${a[i]} at index ${i}`,
      });
    }
  } else if (algo === 'insertion') {
    for (let i = 1; i < n; i++) {
      const key = a[i];
      let j = i - 1;
      while (j >= 0) {
        comparisons++;
        steps.push({
          arr: [...a],
          compare: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => k),
          comparisons,
          swaps,
          note: `Compare key ${key} with a[${j}]=${a[j]}`,
        });
        if (a[j] > key) {
          a[j + 1] = a[j];
          swaps++;
          j--;
        } else {
          break;
        }
      }
      a[j + 1] = key;
      steps.push({
        arr: [...a],
        compare: null,
        sorted: Array.from({ length: i + 1 }, (_, k) => k),
        comparisons,
        swaps,
        note: `Inserted key ${key} at index ${j + 1}`,
      });
    }
  } else if (algo === 'merge') {
    const mergeSort = (l: number, r: number) => {
      if (r - l <= 1) return;
      const m = Math.floor((l + r) / 2);
      mergeSort(l, m);
      mergeSort(m, r);
      const left = a.slice(l, m);
      const right = a.slice(m, r);
      let i = 0;
      let j = 0;
      let k = l;
      while (i < left.length && j < right.length) {
        comparisons++;
        if (left[i] <= right[j]) {
          a[k++] = left[i++];
        } else {
          a[k++] = right[j++];
          swaps++;
        }
        steps.push({
          arr: [...a],
          compare: [l + i, m + j < r ? m + j : r - 1],
          sorted: [],
          comparisons,
          swaps,
          note: `Merging range [${l}..${r - 1}]`,
        });
      }
      while (i < left.length) a[k++] = left[i++];
      while (j < right.length) a[k++] = right[j++];
      steps.push({
        arr: [...a],
        compare: null,
        sorted: Array.from({ length: r - l }, (_, idx) => l + idx),
        comparisons,
        swaps,
        note: `Merged sorted subarray [${l}..${r - 1}]`,
      });
    };
    mergeSort(0, n);
  } else {
    // Quick sort (Lomuto)
    const qs = (lo: number, hi: number) => {
      if (lo >= hi) return;
      const pivot = a[hi];
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        comparisons++;
        steps.push({
          arr: [...a],
          compare: [j, hi],
          sorted: [],
          comparisons,
          swaps,
          note: `Pivot=${pivot}: compare a[${j}]=${a[j]}`,
        });
        if (a[j] <= pivot) {
          i++;
          if (i !== j) {
            [a[i], a[j]] = [a[j], a[i]];
            swaps++;
          }
        }
      }
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      swaps++;
      const p = i + 1;
      steps.push({
        arr: [...a],
        compare: null,
        sorted: [p],
        comparisons,
        swaps,
        note: `Pivot ${pivot} locked at final index ${p}`,
      });
      qs(lo, p - 1);
      qs(p + 1, hi);
    };
    qs(0, n - 1);
    steps.push({
      arr: [...a],
      compare: null,
      sorted: a.map((_, idx) => idx),
      comparisons,
      swaps,
      note: 'Sorted! (Quicksort complete)',
    });
  }
  return steps;
}

export const CSAlgorithmsViz: React.FC<CSAlgorithmsVizProps> = ({
  defaultMode = 'sorting',
}) => {
  const [mode, setMode] = useState<CSMode>(defaultMode);

  // Sorting state
  const [baseArr, setBaseArr] = useState<number[]>([38, 27, 43, 12, 9, 52, 19, 31]);
  const [algo, setAlgo] = useState<'bubble' | 'selection' | 'insertion' | 'merge' | 'quick'>('merge');
  const steps = useMemo(() => generateSortSteps(baseArr, algo), [baseArr, algo]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [algo, baseArr]);

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setStepIdx((s) => Math.min(s + 1, steps.length - 1)), 380);
    return () => window.clearTimeout(id);
  }, [playing, stepIdx, steps.length]);

  const currentStep = steps[Math.min(stepIdx, steps.length - 1)];

  // Binary Max-Heap state
  const [heap, setHeap] = useState<number[]>([40, 30, 15, 10, 20]);
  const [heapInput, setHeapInput] = useState('35');
  const [heapLog, setHeapLog] = useState('Max-heap property: parent >= children (F19.2).');

  const insertHeap = () => {
    const val = Number(heapInput);
    if (Number.isNaN(val) || heap.length >= 15) return;
    const next = [...heap, val];
    let i = next.length - 1;
    let swaps = 0;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (next[i] > next[p]) {
        [next[i], next[p]] = [next[p], next[i]];
        i = p;
        swaps++;
      } else break;
    }
    setHeap(next);
    setHeapLog(`Inserted ${val}: sifted up ${swaps} level(s) to index ${i}.`);
    setHeapInput(String(Math.floor(Math.random() * 55) + 5));
  };

  const extractMax = () => {
    if (heap.length === 0) return;
    const maxVal = heap[0];
    if (heap.length === 1) {
      setHeap([]);
      setHeapLog(`Extracted max ${maxVal}; heap is now empty.`);
      return;
    }
    const next = [...heap];
    next[0] = next.pop()!;
    let i = 0;
    let swaps = 0;
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let largest = i;
      if (l < next.length && next[l] > next[largest]) largest = l;
      if (r < next.length && next[r] > next[largest]) largest = r;
      if (largest !== i) {
        [next[i], next[largest]] = [next[largest], next[i]];
        i = largest;
        swaps++;
      } else break;
    }
    setHeap(next);
    setHeapLog(`Extracted max ${maxVal}, moved last element to root, sifted down ${swaps} step(s).`);
  };

  // Amdahl's Law state
  const [parallelFrac, setParallelFrac] = useState(0.9);
  const [procs, setProcs] = useState(8);
  const speedup = 1 / (1 - parallelFrac + parallelFrac / procs);
  const sMax = parallelFrac >= 0.999 ? Infinity : 1 / (1 - parallelFrac);

  // DFA simulator (accepts strings over {a, b} ending in "ab")
  const [dfaStr, setDfaStr] = useState('baab');
  const dfaTrace = useMemo(() => {
    const clean = dfaStr.toLowerCase().replace(/[^ab]/g, '');
    const states: Array<{ state: 'q0' | 'q1' | 'q2'; ch: string }> = [];
    let cur: 'q0' | 'q1' | 'q2' = 'q0';
    for (const ch of clean) {
      if (cur === 'q0') cur = ch === 'a' ? 'q1' : 'q0';
      else if (cur === 'q1') cur = ch === 'a' ? 'q1' : 'q2';
      else cur = ch === 'a' ? 'q1' : 'q0';
      states.push({ state: cur, ch });
    }
    return { clean, states, finalState: cur, accepted: cur === 'q2' };
  }, [dfaStr]);

  return (
    <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5EFE7] dark:border-[#1E2E24] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#17211B] dark:text-[#ECF2EE]">
            Interactive Computer Science Lab
          </h3>
          <p className="text-xs text-[#647067] dark:text-[#93A89B]">
            Step through sorting algorithms, manipulate a 0-indexed binary max-heap, explore Amdahl&apos;s Law, or simulate a DFA.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {([
            ['sorting', 'Sorting'],
            ['heap', 'Binary Heap'],
            ['amdahl', "Amdahl's Law"],
            ['dfa', 'DFA Automaton'],
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

      {mode === 'sorting' && (
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(['bubble', 'selection', 'insertion', 'merge', 'quick'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAlgo(a)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize cursor-pointer ${
                    algo === a
                      ? 'bg-[#14532D] text-white dark:bg-[#22C55E] dark:text-[#0C130F]'
                      : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5]'
                  }`}
                >
                  {a} Sort
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-medium cursor-pointer"
              >
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {playing ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                onClick={() => setStepIdx((s) => Math.min(s + 1, steps.length - 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D7E3DA] dark:border-[#293D31] text-xs font-medium cursor-pointer"
              >
                <StepForward className="w-3.5 h-3.5" /> Step
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setStepIdx(0);
                }}
                className="p-1.5 rounded-lg border border-[#D7E3DA] dark:border-[#293D31] text-[#647067] hover:text-[#17211B] dark:text-[#93A89B] cursor-pointer"
                aria-label="Reset sort"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setBaseArr(Array.from({ length: 8 }, () => Math.floor(Math.random() * 52) + 8))
                }
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D7E3DA] dark:border-[#293D31] text-xs font-medium cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" /> New Array
              </button>
            </div>
          </div>

          {/* Bar Chart Stage */}
          <div className="h-52 rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-4 flex items-end justify-center gap-3">
            {currentStep.arr.map((v, idx) => {
              const isComparing = currentStep.compare?.includes(idx);
              const isSorted = currentStep.sorted.includes(idx);
              const maxV = Math.max(...currentStep.arr, 60);
              return (
                <div key={idx} className="flex flex-col items-center flex-1 max-w-[54px] h-full justify-end">
                  <span className="text-[11px] font-mono tabular-nums font-semibold mb-1 text-[#17211B] dark:text-[#ECF2EE]">
                    {v}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all duration-200 ${
                      isComparing
                        ? 'bg-amber-500 dark:bg-amber-400'
                        : isSorted
                        ? 'bg-[#15803D] dark:bg-[#4ADE80]'
                        : 'bg-[#86B89A] dark:bg-[#2F5940]'
                    }`}
                    style={{ height: `${Math.max(14, (v / maxV) * 140)}px` }}
                  />
                  <span className="text-[10px] font-mono text-[#647067] dark:text-[#8DA295] mt-1">
                    [{idx}]
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#F8FAF8] dark:bg-[#0E1712] rounded-lg px-4 py-2.5 border border-[#E2ECE4] dark:border-[#203026]">
            <span className="font-medium text-[#17211B] dark:text-[#ECF2EE]">{currentStep.note}</span>
            <div className="flex items-center gap-4 font-mono tabular-nums text-[#4B5850] dark:text-[#A8BCB0]">
              <span>Step {stepIdx}/{steps.length - 1}</span>
              <span>Comparisons: <strong>{currentStep.comparisons}</strong></span>
              <span>Swaps/Writes: <strong>{currentStep.swaps}</strong></span>
            </div>
          </div>
        </div>
      )}

      {mode === 'heap' && (
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              value={heapInput}
              onChange={(e) => setHeapInput(e.target.value)}
              className="w-24 rounded-lg border border-[#D7E3DA] dark:border-[#293D31] bg-[#F8FAF8] dark:bg-[#0E1712] px-3 py-1.5 text-xs font-mono"
            />
            <button
              type="button"
              onClick={insertHeap}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#15803D] text-white text-xs font-medium cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Insert & Sift-Up
            </button>
            <button
              type="button"
              onClick={extractMax}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D7E3DA] dark:border-[#293D31] text-xs font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Extract Max
            </button>
            <button
              type="button"
              onClick={() => {
                setHeap([40, 30, 15, 10, 20]);
                setHeapLog('Reset to F19.2 worked example array [40, 30, 15, 10, 20].');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-[#647067] hover:text-[#15803D] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset F19.2 Example
            </button>
          </div>

          <svg viewBox="0 0 520 210" className="w-full h-auto rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026]">
            {heap.map((val, i) => {
              const level = Math.floor(Math.log2(i + 1));
              const posInLevel = i - (2 ** level - 1);
              const countInLevel = 2 ** level;
              const x = ((posInLevel + 0.5) / countInLevel) * 500 + 10;
              const y = 34 + level * 54;
              const parentIdx = Math.floor((i - 1) / 2);
              let parentLine = null;
              if (i > 0) {
                const pLevel = Math.floor(Math.log2(parentIdx + 1));
                const pPos = parentIdx - (2 ** pLevel - 1);
                const px = ((pPos + 0.5) / 2 ** pLevel) * 500 + 10;
                const py = 34 + pLevel * 54;
                parentLine = (
                  <line
                    x1={px}
                    y1={py}
                    x2={x}
                    y2={y}
                    className="stroke-[#9BB0A3] dark:stroke-[#385242]"
                    strokeWidth={1.6}
                  />
                );
              }
              return (
                <g key={i}>
                  {parentLine}
                  <circle
                    cx={x}
                    cy={y}
                    r={17}
                    className={
                      i === 0
                        ? 'fill-[#15803D] stroke-[#14532D]'
                        : 'fill-white dark:fill-[#19261E] stroke-[#15803D] dark:stroke-[#4ADE80]'
                    }
                    strokeWidth={2}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    className={`text-xs font-mono font-bold ${
                      i === 0 ? 'fill-white' : 'fill-[#17211B] dark:fill-[#ECF2EE]'
                    }`}
                  >
                    {val}
                  </text>
                  <text
                    x={x}
                    y={y + 29}
                    textAnchor="middle"
                    className="fill-[#647067] dark:fill-[#8DA295] text-[9px] font-mono"
                  >
                    i={i}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="space-y-2 text-xs">
            <div className="font-mono bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] rounded-lg px-3 py-2 overflow-x-auto">
              0-indexed Array: [{heap.join(', ')}] · Last internal node = floor({heap.length}/2) - 1 ={' '}
              {Math.floor(heap.length / 2) - 1}
            </div>
            <p className="text-[#4B5850] dark:text-[#A8BCB0]">{heapLog}</p>
          </div>
        </div>
      )}

      {mode === 'amdahl' && (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 p-4 bg-[#F8FAF8] dark:bg-[#0E1712] border-b lg:border-b-0 lg:border-r border-[#E5EFE7] dark:border-[#1E2E24]">
            <svg viewBox="0 0 520 260" className="w-full h-auto rounded-lg bg-white dark:bg-[#101914] border border-[#E2ECE4] dark:border-[#203026]">
              {/* Axes */}
              <line x1={48} y1={220} x2={496} y2={220} className="stroke-[#647067]" strokeWidth={1.3} />
              <line x1={48} y1={20} x2={48} y2={220} className="stroke-[#647067]" strokeWidth={1.3} />
              {[1, 16, 32, 48, 64].map((p) => (
                <text key={p} x={48 + ((p - 1) / 63) * 440 - 6} y={238} className="fill-[#647067] dark:fill-[#8DA295] text-[10px] font-mono">
                  p={p}
                </text>
              ))}
              {[0, 5, 10, 15, 20].map((s) => (
                <text key={s} x={14} y={224 - (s / 22) * 195} className="fill-[#647067] dark:fill-[#8DA295] text-[10px] font-mono">
                  {s}x
                </text>
              ))}

              {/* Asymptote S_max */}
              {sMax <= 22 && (
                <>
                  <line
                    x1={48}
                    y1={220 - (sMax / 22) * 195}
                    x2={496}
                    y2={220 - (sMax / 22) * 195}
                    className="stroke-amber-600 dark:stroke-amber-400"
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                  />
                  <text
                    x={330}
                    y={214 - (sMax / 22) * 195}
                    className="fill-amber-700 dark:fill-amber-400 text-[11px] font-mono font-semibold"
                  >
                    Ceiling S_max = {sMax.toFixed(1)}x
                  </text>
                </>
              )}

              {/* Speedup curve */}
              <polyline
                fill="none"
                className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                strokeWidth={2.5}
                points={Array.from({ length: 64 }, (_, i) => {
                  const p = i + 1;
                  const s = Math.min(22, 1 / (1 - parallelFrac + parallelFrac / p));
                  return `${(48 + ((p - 1) / 63) * 440).toFixed(1)},${(220 - (s / 22) * 195).toFixed(1)}`;
                }).join(' ')}
              />

              {/* Highlighted current p */}
              <circle
                cx={48 + ((procs - 1) / 63) * 440}
                cy={220 - (Math.min(22, speedup) / 22) * 195}
                r={5.5}
                className="fill-[#15803D] dark:fill-[#4ADE80] stroke-white dark:stroke-[#101914]"
                strokeWidth={2}
              />
            </svg>
          </div>
          <div className="lg:col-span-4 p-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Parallel fraction f</span>
                <span className="font-mono tabular-nums text-[#15803D] dark:text-[#4ADE80]">
                  {(parallelFrac * 100).toFixed(0)}% (serial {((1 - parallelFrac) * 100).toFixed(0)}%)
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={0.98}
                step={0.01}
                value={parallelFrac}
                onChange={(e) => setParallelFrac(Number(e.target.value))}
                className="w-full accent-[#15803D]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Processors p</span>
                <span className="font-mono tabular-nums">{procs} cores</span>
              </div>
              <input
                type="range"
                min={1}
                max={64}
                step={1}
                value={procs}
                onChange={(e) => setProcs(Number(e.target.value))}
                className="w-full accent-[#15803D]"
              />
            </div>

            <div className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] p-3 space-y-1.5 text-xs font-mono tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#647067] dark:text-[#93A89B]">Speedup S({procs})</span>
                <span className="font-semibold text-[#15803D] dark:text-[#4ADE80]">{speedup.toFixed(2)}×</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#647067] dark:text-[#93A89B]">Efficiency S(p)/p</span>
                <span>{((speedup / procs) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E5EFE7] dark:border-[#1E2E24]">
                <span className="text-[#647067] dark:text-[#93A89B]">Max Speedup (p→∞)</span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">
                  {Number.isFinite(sMax) ? `${sMax.toFixed(2)}×` : '∞'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'dfa' && (
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-[#17211B] dark:text-[#ECF2EE]">
                Input string over {'{a, b}'}:
              </label>
              <input
                type="text"
                value={dfaStr}
                onChange={(e) => setDfaStr(e.target.value)}
                placeholder="e.g. baab"
                className="w-40 rounded-lg border border-[#D7E3DA] dark:border-[#293D31] bg-[#F8FAF8] dark:bg-[#0E1712] px-3 py-1.5 text-xs font-mono"
              />
            </div>
            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                dfaTrace.accepted
                  ? 'bg-[#DCFCE7] text-[#14532D] dark:bg-[#14532D] dark:text-[#DCFCE7]'
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              {dfaTrace.accepted ? '✓ ACCEPTED (ends in "ab")' : '✕ REJECTED (does not end in "ab")'}
            </div>
          </div>

          <svg viewBox="0 0 520 150" className="w-full h-auto rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026]">
            {/* Edges */}
            <line x1={115} y1={75} x2={228} y2={75} className="stroke-[#647067]" strokeWidth={1.8} />
            <text x={165} y={67} className="fill-[#17211B] dark:fill-[#ECF2EE] text-xs font-mono">a</text>
            <line x1={288} y1={75} x2={398} y2={75} className="stroke-[#647067]" strokeWidth={1.8} />
            <text x={340} y={67} className="fill-[#17211B] dark:fill-[#ECF2EE] text-xs font-mono">b</text>
            {/* q2 back to q0 on b */}
            <path d="M 425 103 Q 260 142 95 103" fill="none" className="stroke-[#647067]" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={256} y={136} className="fill-[#647067] dark:fill-[#93A89B] text-[11px] font-mono">b</text>
            {/* q2 back to q1 on a */}
            <path d="M 410 52 Q 340 20 278 52" fill="none" className="stroke-[#647067]" strokeWidth={1.5} />
            <text x={340} y={32} className="fill-[#647067] dark:fill-[#93A89B] text-[11px] font-mono">a</text>

            {/* States */}
            {([
              { id: 'q0', x: 85, label: 'q0 (start)' },
              { id: 'q1', x: 258, label: 'q1 (saw a)' },
              { id: 'q2', x: 428, label: 'q2 (accept)' },
            ] as const).map((st) => {
              const active = dfaTrace.finalState === st.id;
              return (
                <g key={st.id}>
                  {st.id === 'q2' && (
                    <circle
                      cx={st.x}
                      cy={75}
                      r={31}
                      fill="none"
                      className="stroke-[#15803D] dark:stroke-[#4ADE80]"
                      strokeWidth={1.8}
                    />
                  )}
                  <circle
                    cx={st.x}
                    cy={75}
                    r={25}
                    className={
                      active
                        ? 'fill-[#15803D] stroke-[#14532D]'
                        : 'fill-white dark:fill-[#19261E] stroke-[#647067] dark:stroke-[#556B5E]'
                    }
                    strokeWidth={2}
                  />
                  <text
                    x={st.x}
                    y={79}
                    textAnchor="middle"
                    className={`text-xs font-mono font-bold ${
                      active ? 'fill-white' : 'fill-[#17211B] dark:fill-[#ECF2EE]'
                    }`}
                  >
                    {st.id}
                  </text>
                  <text
                    x={st.x}
                    y={118}
                    textAnchor="middle"
                    className="fill-[#647067] dark:fill-[#93A89B] text-[10px]"
                  >
                    {st.label}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="text-xs font-mono bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#203026] rounded-lg px-3 py-2 overflow-x-auto">
            State trace: q0{' '}
            {dfaTrace.states.map((s, idx) => (
              <span key={idx}>
                —({s.ch})→ <strong>{s.state}</strong>{' '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
