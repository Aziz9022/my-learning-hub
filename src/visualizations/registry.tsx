import React from 'react';
import { CalculusSuiteViz } from './CalculusSuiteViz';
import { LinearAlgebraODEViz } from './LinearAlgebraODEViz';
import { CSAlgorithmsViz } from './CSAlgorithmsViz';
import { StatisticsViz } from './StatisticsViz';
import { DataScienceMLViz } from './DataScienceMLViz';

/**
 * Returns a tailored, mathematically accurate interactive visualization for
 * each syllabus module across Parts A–D.
 */
export function renderModuleVisualizer(moduleNumber: number): React.ReactNode | null {
  // Part A: Mathematics
  if (moduleNumber >= 1 && moduleNumber <= 3) {
    return <CalculusSuiteViz defaultMode="derivative" />;
  }
  if (moduleNumber === 4) {
    return <CalculusSuiteViz defaultMode="integral" />;
  }
  if (moduleNumber === 5) {
    return <CalculusSuiteViz defaultMode="taylor" />;
  }
  if (moduleNumber >= 6 && moduleNumber <= 10) {
    return <LinearAlgebraODEViz defaultMode="matrix" />;
  }
  if (moduleNumber >= 11 && moduleNumber <= 16) {
    return <LinearAlgebraODEViz defaultMode="ode" />;
  }

  // Part B: Computer Science
  if (moduleNumber === 17 || moduleNumber === 20 || moduleNumber === 22) {
    return <CSAlgorithmsViz defaultMode="sorting" />;
  }
  if (moduleNumber === 18 || moduleNumber === 19) {
    return <CSAlgorithmsViz defaultMode="heap" />;
  }
  if (moduleNumber === 23 || moduleNumber === 27) {
    return <CSAlgorithmsViz defaultMode="dfa" />;
  }
  if (moduleNumber === 26 || moduleNumber === 28) {
    return <CSAlgorithmsViz defaultMode="amdahl" />;
  }

  // Part C: Statistics
  if (moduleNumber >= 29 && moduleNumber <= 31) {
    return <StatisticsViz defaultMode="descriptive" />;
  }
  if (moduleNumber === 32 || moduleNumber === 40) {
    return <StatisticsViz defaultMode="regression" />;
  }
  if (moduleNumber === 33 || moduleNumber === 34) {
    return <StatisticsViz defaultMode="bayes" />;
  }
  if (moduleNumber >= 35 && moduleNumber <= 39) {
    return <StatisticsViz defaultMode="distributions" />;
  }

  // Part D: Data Science
  if (moduleNumber === 43) {
    return <DataScienceMLViz defaultMode="gd" />;
  }
  if (moduleNumber === 44) {
    return <DataScienceMLViz defaultMode="tree" />;
  }
  if (moduleNumber === 45) {
    return <DataScienceMLViz defaultMode="rf" />;
  }
  if (moduleNumber === 46 || moduleNumber === 47) {
    return <DataScienceMLViz defaultMode="roc" />;
  }
  if (moduleNumber === 48) {
    return <DataScienceMLViz defaultMode="boundary" />;
  }

  return null;
}
