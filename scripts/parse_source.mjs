import fs from 'node:fs';
import path from 'node:path';

const SOURCE_PATH = path.resolve(
  'public/assets/aistudio/Math_Stats_CS_DS_Reference_9c56e49e.txt'
);
const OUT_DIR = path.resolve('src/data/generated');
fs.mkdirSync(OUT_DIR, { recursive: true });

const rawText = fs.readFileSync(SOURCE_PATH, 'utf8');
const lines = rawText.split(/\r?\n/);

const PARTS_META = [
  {
    id: 'A',
    slug: 'mathematics',
    title: 'Mathematics',
    shortTitle: 'Mathematics',
    description:
      'Foundations of calculus, linear algebra, analytic geometry, multivariable calculus, and ordinary differential equations.',
    moduleRange: [1, 16],
  },
  {
    id: 'B',
    slug: 'computer-science',
    title: 'Computer Science',
    shortTitle: 'Computer Science',
    description:
      'Algorithmic complexity, fundamental and tree data structures, sorting, OOP, recursion, Boolean logic, relational databases, distributed aggregation, computability, and parallel architecture.',
    moduleRange: [17, 28],
  },
  {
    id: 'C',
    slug: 'statistics',
    title: 'Statistics',
    shortTitle: 'Statistics',
    description:
      'Descriptive statistics, probability axioms, conditional probability, distributions, expectation, sampling theory, parameter estimation, hypothesis testing, linear regression, and statistical Python.',
    moduleRange: [29, 41],
  },
  {
    id: 'D',
    slug: 'data-science',
    title: 'Data Science',
    shortTitle: 'Data Science',
    description:
      'Data manipulation and feature scaling, numerical optimization, decision trees, random forests, model evaluation, hyperparameter tuning, and linear/nonlinear classification.',
    moduleRange: [42, 48],
  },
];

function getPartForModule(num) {
  for (const p of PARTS_META) {
    if (num >= p.moduleRange[0] && num <= p.moduleRange[1]) return p.id;
  }
  return 'A';
}

function isEqualsBanner(line) {
  return /^={20,}$/.test((line || '').trim());
}

function isDashBanner(line) {
  return /^-{20,}$/.test((line || '').trim());
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// 1. Locate Front Matter, SubParts, Modules, and Appendices
const firstSubPartIdx = lines.findIndex((l) => /^A1\.\s+CALCULUS/.test(l.trim()));
const endOfPartDIdx = lines.findIndex((l) =>
  /^END OF PART D AND OF THE SYLLABUS MODULES/.test(l.trim())
);
const appendixStartIndices = [];
for (let i = 0; i < lines.length; i++) {
  if (/^APPENDIX\s+[A-F]:/.test(lines[i].trim()) && isEqualsBanner(lines[i - 1])) {
    appendixStartIndices.push({
      letter: lines[i].trim().match(/^APPENDIX\s+([A-F]):/)[1],
      title: lines[i].trim(),
      lineIdx: i,
    });
  }
}

// Parse Front Matter (lines 0 .. firstSubPartIdx - 2)
const frontMatterLines = lines.slice(0, firstSubPartIdx - 1);
const tocStartIdx = frontMatterLines.findIndex((l) =>
  /^SYLLABUS STRUCTURE AND TABLE OF CONTENTS/.test(l.trim())
);
const frontMatterIntro = frontMatterLines
  .slice(0, tocStartIdx > 0 ? tocStartIdx - 1 : frontMatterLines.length)
  .join('\n')
  .trim();

// Locate all SubParts (A1., A2., ..., D7.) and Modules (MODULE 1: ... MODULE 48:)
const subPartHeaders = [];
const moduleHeaders = [];

for (let i = firstSubPartIdx - 1; i < endOfPartDIdx; i++) {
  const trimmed = lines[i].trim();
  if (isEqualsBanner(lines[i - 1]) && isEqualsBanner(lines[i + 1])) {
    const spMatch = trimmed.match(/^([A-D]\d+)\.\s+(.+)$/);
    if (spMatch) {
      subPartHeaders.push({
        code: spMatch[1],
        partId: spMatch[1][0],
        title: spMatch[2].trim(),
        lineIdx: i,
      });
    }
    const modMatch = trimmed.match(/^MODULE\s+(\d+):\s+(.+)$/);
    if (modMatch) {
      moduleHeaders.push({
        number: Number(modMatch[1]),
        title: modMatch[2].trim(),
        lineIdx: i,
      });
    }
  }
}

console.log(`Found ${subPartHeaders.length} sub-parts, ${moduleHeaders.length} modules, ${appendixStartIndices.length} appendices.`);

// Helper: Parse a formula block's lettered parts (A..J) losslessly
function parseFormulaParts(formulaLines, id, title, moduleId, sectionId) {
  const parts = {};
  const preamble = [];
  let currentKey = null;
  let currentBuf = [];

  const flush = () => {
    if (currentKey) {
      parts[currentKey] = (parts[currentKey] ? parts[currentKey] + '\n' : '') + currentBuf.join('\n').trimEnd();
    } else if (currentBuf.length) {
      preamble.push(...currentBuf);
    }
    currentBuf = [];
  };

  for (let i = 1; i < formulaLines.length; i++) {
    const line = formulaLines[i];
    // Match A. through J. at start (0-3 spaces indent)
    const m = line.match(/^\s{0,3}([A-J])\.\s*(.*)$/);
    if (m) {
      flush();
      currentKey = m[1];
      currentBuf.push(m[2]);
    } else {
      currentBuf.push(line);
    }
  }
  flush();

  // Extract primary formula text (from B, or preamble if no B)
  let formulaBody = parts.B || '';
  // Remove leading label like "FORMULA:" or "FORMULAS:" or "STATEMENT:" if present
  formulaBody = formulaBody.replace(/^(FORMULAS?|STATEMENT|MODEL AND FORMULAS|DEFINITION)\s*:?\s*/i, '').trim();
  if (!formulaBody && preamble.length) {
    formulaBody = preamble.join('\n').trim();
  }

  return {
    id,
    title,
    moduleId,
    partId: moduleId === 0 ? 'D' : getPartForModule(moduleId),
    sectionId,
    rawText: formulaLines.join('\n').trimEnd(),
    preamble: preamble.join('\n').trim(),
    formulaBody,
    parts,
  };
}

// Helper: Parse section content into structured blocks while keeping 100% of raw text
function parseSectionBlocks(sectionLines, moduleId, sectionId, formulasCollector, quickRevisionCollector) {
  const blocks = [];
  let i = 0;

  // Detect formula block start: ^\s{0,2}(F(?:\d+|-D)\.\d+)\s{2,}(.+)$
  const isFormulaStart = (line) => /^\s{0,2}(F(?:\d+|-D)\.\d+)\s{2,}(.+)$/.test(line);

  // Detect major sub-boundary that ends a formula block
  const isMajorBreakAfterFormula = (line, prevLine) => {
    const t = line.trim();
    if (!t) return false;
    if (isFormulaStart(line)) return true;
    if (/^(COMPARISON TABLE|SUMMARY TABLE|DATA SCIENCE LINK|WORKED EXAMPLE|PYTHON|EDGE CASES|COMMON MISTAKES|THE CHOMSKY HIERARCHY|OPERATIONS\s*\(|BALANCED TREE|CARDINALITY RULES|EQUIVALENCES USED|NORMALIZATION|THE RANDOM FOREST ALGORITHM|RANDOM FEATURE SELECTION|PRACTICAL|NOTE:|EXPERIMENT\s*\(|THE ASSUMPTIONS|WHAT HAPPENS WHEN)/i.test(t) && !/^\s/.test(line)) {
      return true;
    }
    if (/^[A-Z][A-Z0-9\s/(),'-]{3,}:?$/.test(t) && !/^\s/.test(line) && !/^[A-J]\./.test(t) && prevLine === '') {
      return true;
    }
    return false;
  };

  let textBuf = [];
  const flushText = () => {
    const joined = textBuf.join('\n').trim();
    if (joined) {
      // Split into sub-blocks: comparison tables, warnings, data science links, regular text
      const subBlocks = splitNonFormulaText(joined, moduleId, sectionId, quickRevisionCollector);
      blocks.push(...subBlocks);
    }
    textBuf = [];
  };

  while (i < sectionLines.length) {
    const line = sectionLines[i];
    const fm = line.match(/^\s{0,2}(F(?:\d+|-D)\.\d+)\s{2,}(.+)$/);
    if (fm) {
      flushText();
      const fLines = [line];
      i++;
      while (i < sectionLines.length) {
        const cur = sectionLines[i];
        const prev = i > 0 ? sectionLines[i - 1] : '';
        if (isMajorBreakAfterFormula(cur, prev)) {
          break;
        }
        fLines.push(cur);
        i++;
      }
      // Trim trailing blank lines from formula block
      while (fLines.length > 1 && fLines[fLines.length - 1].trim() === '') {
        fLines.pop();
      }
      const parsedFormula = parseFormulaParts(fLines, fm[1], fm[2].trim(), moduleId, sectionId);
      formulasCollector.push(parsedFormula);
      blocks.push({
        type: 'formula',
        formulaId: parsedFormula.id,
        title: parsedFormula.title,
        formulaBody: parsedFormula.formulaBody,
        preamble: parsedFormula.preamble,
        parts: parsedFormula.parts,
        rawText: parsedFormula.rawText,
      });

      // Collect quick revision snippets
      if (parsedFormula.parts.I) {
        quickRevisionCollector.mistakes.push({
          moduleId,
          partId: parsedFormula.partId,
          sectionId,
          source: `${parsedFormula.id}: ${parsedFormula.title}`,
          text: parsedFormula.parts.I.replace(/^(COMMON\s+)?MISTAKES?\s*:?\s*/i, '').trim(),
        });
      }
      if (parsedFormula.parts.E) {
        quickRevisionCollector.conditions.push({
          moduleId,
          partId: parsedFormula.partId,
          sectionId,
          formulaId: parsedFormula.id,
          title: parsedFormula.title,
          text: parsedFormula.parts.E.replace(/^CONDITIONS(\s+AND\s+ASSUMPTIONS)?\s*:?\s*/i, '').trim(),
        });
      }
    } else {
      textBuf.push(line);
      i++;
    }
  }
  flushText();
  return blocks;
}

function splitNonFormulaText(text, moduleId, sectionId, quickRevisionCollector) {
  const result = [];
  const rawLines = text.split(/\r?\n/);
  let i = 0;
  let paraBuf = [];

  const flushPara = () => {
    const chunk = paraBuf.join('\n').trim();
    if (!chunk) {
      paraBuf = [];
      return;
    }
    // Check if chunk is a DATA SCIENCE LINK
    if (/^DATA SCIENCE LINK\s*:/i.test(chunk)) {
      result.push({
        type: 'ds-link',
        text: chunk.replace(/^DATA SCIENCE LINK\s*:\s*/i, '').trim(),
        rawText: chunk,
      });
    } else if (/^!!\s*(WARNING|COMMON MISTAKE)\s*!!/i.test(chunk)) {
      const kind = /WARNING/i.test(chunk.slice(0, 20)) ? 'warning' : 'mistake';
      result.push({
        type: kind,
        text: chunk.replace(/^!!\s*(WARNING|COMMON MISTAKE)\s*!!\s*/i, '').trim(),
        rawText: chunk,
      });
      if (kind === 'mistake') {
        quickRevisionCollector.mistakes.push({
          moduleId,
          partId: getPartForModule(moduleId),
          sectionId,
          source: `Section ${sectionId}`,
          text: chunk.replace(/^!!\s*COMMON MISTAKE\s*!!\s*/i, '').trim(),
        });
      }
    } else if (/^(COMPARISON TABLE|SUMMARY TABLE)\s*:/i.test(chunk)) {
      const chunkLines = chunk.split(/\r?\n/);
      const title = chunkLines[0].trim();
      const body = chunkLines.slice(1).join('\n');
      result.push({
        type: 'table',
        title,
        rawText: body,
        fullRawText: chunk,
      });
      quickRevisionCollector.tables.push({
        moduleId,
        partId: getPartForModule(moduleId),
        sectionId,
        title,
        rawText: body,
      });
    } else {
      // Check if chunk is largely Python/SQL code
      const looksLikeCode =
        /^(PYTHON|SQL|PSEUDOCODE)\b/i.test(chunk) ||
        chunk.split('\n').filter((l) => /^\s*(def |class |import |from |SELECT |CREATE |for |while |if |return |np\.|pd\.|plt\.|model\.)/.test(l)).length >= 2;
      if (looksLikeCode) {
        result.push({
          type: 'code',
          rawText: chunk,
        });
      } else {
        result.push({
          type: 'text',
          rawText: chunk,
        });
      }
    }
    paraBuf = [];
  };

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (/^(COMPARISON TABLE|SUMMARY TABLE)\s*:/i.test(trimmed)) {
      flushPara();
      const tLines = [line];
      i++;
      while (i < rawLines.length) {
        const cur = rawLines[i];
        const curTrim = cur.trim();
        if (
          curTrim === '' &&
          i + 1 < rawLines.length &&
          !/^\s{2,}/.test(rawLines[i + 1]) &&
          rawLines[i + 1].trim() !== ''
        ) {
          break;
        }
        if (/^(DATA SCIENCE LINK|!! |EDGE CASES|COMMON MISTAKES|WORKED EXAMPLE)/i.test(curTrim)) {
          break;
        }
        tLines.push(cur);
        i++;
      }
      paraBuf = tLines;
      flushPara();
      continue;
    }

    if (/^(DATA SCIENCE LINK\s*:|!!\s*(WARNING|COMMON MISTAKE)\s*!!)/i.test(trimmed)) {
      flushPara();
      const sLines = [line];
      i++;
      while (i < rawLines.length) {
        const cur = rawLines[i];
        if (cur.trim() === '') break;
        if (/^(DATA SCIENCE LINK\s*:|!!\s*(WARNING|COMMON MISTAKE)\s*!!|COMPARISON TABLE|SUMMARY TABLE)/i.test(cur.trim())) {
          break;
        }
        sLines.push(cur);
        i++;
      }
      paraBuf = sLines;
      flushPara();
      continue;
    }

    if (trimmed === '') {
      // Keep paragraphs cleanly separated
      flushPara();
      i++;
      continue;
    }

    paraBuf.push(line);
    i++;
  }
  flushPara();
  return result;
}

// 2. Parse all 48 modules completely
const allFormulas = [];
const quickRevision = {
  mistakes: [],
  conditions: [],
  tables: [],
  definitions: [],
};

const modules = [];

for (let mIdx = 0; mIdx < moduleHeaders.length; mIdx++) {
  const mh = moduleHeaders[mIdx];
  const startLine = mh.lineIdx + 2; // skip closing ===
  let endLine = endOfPartDIdx - 1;
  if (mIdx + 1 < moduleHeaders.length) {
    endLine = moduleHeaders[mIdx + 1].lineIdx - 1;
    // Also back up before any subpart banner immediately preceding the next module
    for (const sp of subPartHeaders) {
      if (sp.lineIdx > mh.lineIdx && sp.lineIdx < moduleHeaders[mIdx + 1].lineIdx) {
        endLine = Math.min(endLine, sp.lineIdx - 1);
      }
    }
    // Also back up before "D. DATA SCIENCE" banner
    for (let k = mh.lineIdx + 2; k < endLine; k++) {
      if (/^D\.\s+DATA SCIENCE$/.test(lines[k].trim()) && isEqualsBanner(lines[k - 1])) {
        endLine = k - 1;
        break;
      }
    }
  }

  // Find which subpart this module belongs to
  let subPart = subPartHeaders[0];
  for (const sp of subPartHeaders) {
    if (sp.lineIdx < mh.lineIdx) subPart = sp;
  }

  const modLines = lines.slice(startLine, endLine);

  // Locate numbered sections inside modLines: ---\n n.m TITLE (1 or 2 lines) \n---
  const secStarts = [];
  for (let i = 0; i < modLines.length; i++) {
    const m = modLines[i].trim().match(/^(\d+\.\d+)\s+(.+)$/);
    if (m && isDashBanner(modLines[i - 1])) {
      let endBannerIdx = -1;
      let titleParts = [m[2].trim()];
      if (isDashBanner(modLines[i + 1])) {
        endBannerIdx = i + 1;
      } else if (isDashBanner(modLines[i + 2])) {
        titleParts.push(modLines[i + 1].trim());
        endBannerIdx = i + 2;
      } else if (isDashBanner(modLines[i + 3])) {
        titleParts.push(modLines[i + 1].trim(), modLines[i + 2].trim());
        endBannerIdx = i + 3;
      }
      if (endBannerIdx !== -1) {
        secStarts.push({
          id: m[1],
          title: titleParts.join(' '),
          lineIdx: i,
          contentStartIdx: endBannerIdx + 1,
        });
      }
    }
  }

  // Intro text before first section
  const introEnd = secStarts.length > 0 ? secStarts[0].lineIdx - 1 : modLines.length;
  const introRaw = modLines.slice(0, introEnd).join('\n').trim();
  const introBlocks = introRaw
    ? parseSectionBlocks(introRaw.split(/\r?\n/), mh.number, `${mh.number}.0`, allFormulas, quickRevision)
    : [];

  // Extract a short definition/basic idea for Quick Revision if present
  const basicIdeaMatch = introRaw.match(/BASIC IDEA[^:\n]*\n([\s\S]{20,420}?)(?:\n\n|$)/i);
  if (basicIdeaMatch) {
    quickRevision.definitions.push({
      moduleId: mh.number,
      partId: getPartForModule(mh.number),
      sectionId: `${mh.number}.0`,
      title: `Module ${mh.number}: ${mh.title}`,
      text: basicIdeaMatch[1].replace(/\s+/g, ' ').trim(),
    });
  }

  const sections = [];
  for (let sIdx = 0; sIdx < secStarts.length; sIdx++) {
    const sh = secStarts[sIdx];
    const sStart = sh.contentStartIdx;
    const sEnd = sIdx + 1 < secStarts.length ? secStarts[sIdx + 1].lineIdx - 1 : modLines.length;
    const secLines = modLines.slice(sStart, sEnd);
    const secRaw = secLines.join('\n').trim();

    const beforeCount = allFormulas.length;
    const blocks = parseSectionBlocks(secLines, mh.number, sh.id, allFormulas, quickRevision);
    const sectionFormulaIds = allFormulas.slice(beforeCount).map((f) => f.id);

    // Grab BASIC IDEA from section for Quick Revision if present
    const secIdea = secRaw.match(/BASIC IDEA[^\n]*\n([\s\S]{20,380}?)(?:\n\n|$)/i);
    if (secIdea) {
      quickRevision.definitions.push({
        moduleId: mh.number,
        partId: getPartForModule(mh.number),
        sectionId: sh.id,
        title: `${sh.id} ${sh.title}`,
        text: secIdea[1].replace(/\s+/g, ' ').trim(),
      });
    }

    sections.push({
      id: sh.id,
      title: sh.title,
      slug: slugify(`${sh.id}-${sh.title}`),
      wordCount: secRaw.split(/\s+/).filter(Boolean).length,
      formulaIds: sectionFormulaIds,
      blocks,
      rawText: secRaw,
    });
  }

  const modWordCount =
    introRaw.split(/\s+/).filter(Boolean).length +
    sections.reduce((acc, s) => acc + s.wordCount, 0);
  const modFormulaIds = sections.flatMap((s) => s.formulaIds);

  modules.push({
    number: mh.number,
    partId: getPartForModule(mh.number),
    subPartCode: subPart.code,
    subPartTitle: subPart.title,
    title: mh.title,
    slug: `module-${mh.number}`,
    introRaw,
    introBlocks,
    sections,
    wordCount: modWordCount,
    formulaIds: modFormulaIds,
  });
}

// 3. Parse all 6 Appendices (A..F)
const appendices = {};
for (let aIdx = 0; aIdx < appendixStartIndices.length; aIdx++) {
  const ah = appendixStartIndices[aIdx];
  const aStart = ah.lineIdx + 2;
  const aEnd =
    aIdx + 1 < appendixStartIndices.length
      ? appendixStartIndices[aIdx + 1].lineIdx - 1
      : lines.length;
  const aLines = lines.slice(aStart, aEnd);
  const aRaw = aLines.join('\n').trim();

  const entry = {
    letter: ah.letter,
    title: ah.title,
    rawText: aRaw,
    wordCount: aRaw.split(/\s+/).filter(Boolean).length,
  };

  if (ah.letter === 'C') {
    // Parse all 410 syllabus checklist bullets cleanly (handling wrapped lines!)
    const checklist = [];
    let currentModule = 1;
    let currentModuleTitle = '';
    for (let i = 0; i < aLines.length; i++) {
      const l = aLines[i];
      const modM = l.match(/^MODULE\s+(\d+)\s*[-:]\s*(.+)$/);
      if (modM) {
        currentModule = Number(modM[1]);
        currentModuleTitle = modM[2].trim();
        continue;
      }
      if (/^\s*\[x\]\s+/.test(l)) {
        let full = l.replace(/^\s*\[x\]\s+/, '').trim();
        // Join continuation lines if arrow hasn't appeared yet
        while (!full.includes('->') && i + 1 < aLines.length && /^\s{4,}\S/.test(aLines[i + 1])) {
          i++;
          full += ' ' + aLines[i].trim();
        }
        const [topicPart, refPart = ''] = full.split('->').map((s) => s.trim());
        const sectionRefs = [...refPart.matchAll(/\b(\d+\.\d+)\b/g)].map((m) => m[1]);
        checklist.push({
          id: checklist.length + 1,
          moduleId: currentModule,
          moduleTitle: currentModuleTitle,
          partId: getPartForModule(currentModule),
          topic: topicPart,
          refText: refPart,
          sectionRefs,
        });
      }
    }
    entry.checklist = checklist;
  }

  if (ah.letter === 'B') {
    // Parse symbol & notation glossary entries
    const glossary = [];
    let currentCategory = 'General';
    for (const l of aLines) {
      const trimmed = l.trim();
      if (!trimmed) continue;
      if (/^[A-Z][A-Z0-9\s(),/-]{3,}$/.test(trimmed) && !/^\s/.test(l)) {
        currentCategory = trimmed;
        continue;
      }
      const gm = l.match(/^\s{2}([^\s].*?)\s{2,}(.+)$/);
      if (gm) {
        glossary.push({
          category: currentCategory,
          symbol: gm[1].trim(),
          meaning: gm[2].trim(),
        });
      }
    }
    entry.glossary = glossary;
  }

  if (ah.letter === 'D') {
    // Extract F-D.1 formula block so it is also in the Formula Library!
    const fdStart = aLines.findIndex((l) => /^\s*F-D\.1\s+/.test(l));
    if (fdStart !== -1) {
      let fdEnd = aLines.length;
      for (let k = fdStart + 1; k < aLines.length; k++) {
        if (/^D\.2\s+/.test(aLines[k].trim())) {
          fdEnd = k;
          break;
        }
      }
      const fdLines = aLines.slice(fdStart, fdEnd);
      while (fdLines.length > 1 && fdLines[fdLines.length - 1].trim() === '') fdLines.pop();
      const fm = fdLines[0].match(/^\s*(F-D\.1)\s{2,}(.+)$/);
      if (fm) {
        const parsedFD = parseFormulaParts(fdLines, fm[1], fm[2].trim(), 0, 'Appendix D');
        allFormulas.push(parsedFD);
      }
    }
  }

  appendices[ah.letter] = entry;
}

// 4. Build Catalog & Write Split JSON Files
const catalog = {
  meta: {
    sourceFile: 'Math_Stats_CS_DS_Reference.txt',
    totalLines: lines.length,
    totalWords: rawText.split(/\s+/).filter(Boolean).length,
    totalModules: modules.length,
    totalSections: modules.reduce((acc, m) => acc + m.sections.length, 0),
    totalFormulas: allFormulas.length,
    totalModuleFormulas: allFormulas.filter((f) => f.moduleId > 0).length,
    totalChecklistBullets: appendices.C?.checklist?.length || 0,
    totalAppendices: Object.keys(appendices).length,
  },
  frontMatterIntro,
  parts: PARTS_META.map((p) => ({
    ...p,
    subParts: subPartHeaders
      .filter((sp) => sp.partId === p.id)
      .map((sp) => ({
        code: sp.code,
        title: sp.title,
        moduleNumbers: modules.filter((m) => m.subPartCode === sp.code).map((m) => m.number),
      })),
  })),
  modules: modules.map((m) => ({
    number: m.number,
    partId: m.partId,
    subPartCode: m.subPartCode,
    subPartTitle: m.subPartTitle,
    title: m.title,
    slug: m.slug,
    wordCount: m.wordCount,
    formulaCount: m.formulaIds.length,
    formulaIds: m.formulaIds,
    sections: m.sections.map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      wordCount: s.wordCount,
      formulaIds: s.formulaIds,
    })),
  })),
};

fs.writeFileSync(path.join(OUT_DIR, 'catalog.json'), JSON.stringify(catalog));
for (const partId of ['A', 'B', 'C', 'D']) {
  const partMods = modules.filter((m) => m.partId === partId);
  fs.writeFileSync(path.join(OUT_DIR, `part${partId}.json`), JSON.stringify(partMods));
}
fs.writeFileSync(path.join(OUT_DIR, 'formulas.json'), JSON.stringify(allFormulas));
fs.writeFileSync(path.join(OUT_DIR, 'appendices.json'), JSON.stringify(appendices));
fs.writeFileSync(path.join(OUT_DIR, 'quickRevision.json'), JSON.stringify(quickRevision));

console.log('=== PARSE COMPLETE ===');
console.log(JSON.stringify(catalog.meta, null, 2));
console.log('Quick revision stats:', {
  definitions: quickRevision.definitions.length,
  conditions: quickRevision.conditions.length,
  mistakes: quickRevision.mistakes.length,
  tables: quickRevision.tables.length,
});
console.log('Glossary items in Appendix B:', appendices.B?.glossary?.length);
