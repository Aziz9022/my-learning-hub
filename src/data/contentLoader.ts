import catalogRaw from './generated/catalog.json';
import formulasRaw from './generated/formulas.json';
import appendicesRaw from './generated/appendices.json';
import quickRevisionRaw from './generated/quickRevision.json';
import type {
  AppendixEntry,
  CatalogData,
  FormulaRecord,
  ModuleData,
  PartId,
  QuickRevisionData,
} from '../types/content';

export const catalog = catalogRaw as unknown as CatalogData;
export const allFormulas = formulasRaw as unknown as FormulaRecord[];
export const appendicesData = appendicesRaw as unknown as Record<
  'A' | 'B' | 'C' | 'D' | 'E' | 'F',
  AppendixEntry
>;
export const quickRevisionData = quickRevisionRaw as unknown as QuickRevisionData;

const partCache: Partial<Record<PartId, ModuleData[]>> = {};

export async function loadPartModules(partId: PartId): Promise<ModuleData[]> {
  if (partCache[partId]) return partCache[partId]!;
  let mod: { default: unknown };
  switch (partId) {
    case 'A':
      mod = await import('./generated/partA.json');
      break;
    case 'B':
      mod = await import('./generated/partB.json');
      break;
    case 'C':
      mod = await import('./generated/partC.json');
      break;
    case 'D':
      mod = await import('./generated/partD.json');
      break;
  }
  const data = mod.default as ModuleData[];
  partCache[partId] = data;
  return data;
}

export async function loadModuleByNumber(moduleNumber: number): Promise<ModuleData | null> {
  const meta = catalog.modules.find((m) => m.number === moduleNumber);
  if (!meta) return null;
  const partMods = await loadPartModules(meta.partId);
  return partMods.find((m) => m.number === moduleNumber) ?? null;
}

export function getPartBySlug(slug: string) {
  return catalog.parts.find((p) => p.slug === slug);
}

export function getPartById(partId: PartId) {
  return catalog.parts.find((p) => p.id === partId);
}

export function getModuleMeta(moduleNumber: number) {
  return catalog.modules.find((m) => m.number === moduleNumber);
}
