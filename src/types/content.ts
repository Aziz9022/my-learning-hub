export type PartId = 'A' | 'B' | 'C' | 'D';

export type VerificationStatus =
  | 'Verified'
  | 'Correction made'
  | 'Needs verification'
  | 'Not independently checked';

export interface SubPartMeta {
  code: string;
  title: string;
  moduleNumbers: number[];
}

export interface PartMeta {
  id: PartId;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  moduleRange: [number, number];
  subParts: SubPartMeta[];
}

export interface SectionMeta {
  id: string;
  title: string;
  slug: string;
  wordCount: number;
  formulaIds: string[];
}

export interface ModuleMeta {
  number: number;
  partId: PartId;
  subPartCode: string;
  subPartTitle: string;
  title: string;
  slug: string;
  wordCount: number;
  formulaCount: number;
  formulaIds: string[];
  sections: SectionMeta[];
}

export interface CatalogData {
  meta: {
    sourceFile: string;
    totalLines: number;
    totalWords: number;
    totalModules: number;
    totalSections: number;
    totalFormulas: number;
    totalModuleFormulas: number;
    totalChecklistBullets: number;
    totalAppendices: number;
  };
  frontMatterIntro: string;
  parts: PartMeta[];
  modules: ModuleMeta[];
}

export interface FormulaBlockData {
  type: 'formula';
  formulaId: string;
  title: string;
  formulaBody: string;
  preamble: string;
  parts: Record<string, string>;
  rawText: string;
}

export interface TextBlockData {
  type: 'text';
  rawText: string;
}

export interface CodeBlockData {
  type: 'code';
  rawText: string;
}

export interface TableBlockData {
  type: 'table';
  title: string;
  rawText: string;
  fullRawText: string;
}

export interface CalloutBlockData {
  type: 'warning' | 'mistake' | 'ds-link';
  text: string;
  rawText: string;
}

export type ContentBlock =
  | FormulaBlockData
  | TextBlockData
  | CodeBlockData
  | TableBlockData
  | CalloutBlockData;

export interface SectionData {
  id: string;
  title: string;
  slug: string;
  wordCount: number;
  formulaIds: string[];
  blocks: ContentBlock[];
  rawText: string;
}

export interface ModuleData {
  number: number;
  partId: PartId;
  subPartCode: string;
  subPartTitle: string;
  title: string;
  slug: string;
  introRaw: string;
  introBlocks: ContentBlock[];
  sections: SectionData[];
  wordCount: number;
  formulaIds: string[];
}

export interface FormulaRecord {
  id: string;
  title: string;
  moduleId: number;
  partId: PartId;
  sectionId: string;
  rawText: string;
  preamble: string;
  formulaBody: string;
  parts: Record<string, string>;
}

export interface ChecklistItem {
  id: number;
  moduleId: number;
  moduleTitle: string;
  partId: PartId;
  topic: string;
  refText: string;
  sectionRefs: string[];
}

export interface GlossaryItem {
  category: string;
  symbol: string;
  meaning: string;
}

export interface AppendixEntry {
  letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  title: string;
  rawText: string;
  wordCount: number;
  checklist?: ChecklistItem[];
  glossary?: GlossaryItem[];
}

export interface QuickRevisionData {
  definitions: Array<{
    moduleId: number;
    partId: PartId;
    sectionId: string;
    title: string;
    text: string;
  }>;
  conditions: Array<{
    moduleId: number;
    partId: PartId;
    sectionId: string;
    formulaId: string;
    title: string;
    text: string;
  }>;
  mistakes: Array<{
    moduleId: number;
    partId: PartId;
    sectionId: string;
    source: string;
    text: string;
  }>;
  tables: Array<{
    moduleId: number;
    partId: PartId;
    sectionId: string;
    title: string;
    rawText: string;
  }>;
}

export interface CorrectionEntry {
  id: string;
  moduleId: number; // 0 for Appendices
  sectionId: string;
  formulaId?: string;
  partId: PartId | 'Appendix';
  category:
    | 'Mathematical Accuracy'
    | 'Algorithm & Complexity'
    | 'Cross-Reference'
    | 'Notation & Consistency'
    | 'Metadata & Indexing'
    | 'Numerical Verification'
    | 'Software & Environment';
  originalStatement: string;
  correctedStatement: string;
  explanation: string;
  reasonForCorrection: string;
  referenceTitle: string;
  referenceUrl: string;
  status: VerificationStatus;
}

export interface ExternalReference {
  id: string;
  title: string;
  creator: string;
  url: string;
  type: 'Textbook' | 'Lecture Series' | 'Documentation' | 'Visual Intuition';
  topic: string;
  partId: PartId;
  moduleIds: number[];
}

export interface QuizQuestion {
  id: string;
  moduleId: number;
  partId: PartId;
  sectionRef: string;
  type: 'mcq' | 'numeric';
  question: string;
  options?: string[];
  correctIndex?: number;
  correctNumber?: number;
  tolerance?: number;
  unitHint?: string;
  explanation: string;
}
