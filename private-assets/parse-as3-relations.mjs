/**
 * Small static relation extractor for FFDec ActionScript output.
 *
 * This deliberately reports only syntactic direct relations. It never runs
 * decompiled code and therefore does not turn a potentially unsafe SWF dump
 * into executable JavaScript.
 */
function unique(values) {
  return [...new Set(values)];
}

function allMatches(source, pattern, group = 1) {
  return [...source.matchAll(pattern)].map(match => match[group]);
}

export function parseAs3Class(source, file = '') {
  const classMatch = source.match(/\bclass\s+([A-Za-z_$][\w$]*)(?:\s+extends\s+([A-Za-z_$][\w$.]*))?/);
  if (!classMatch) return null;

  return {
    file,
    className: classMatch[1],
    extends: classMatch[2] ?? null,
    typedFields: unique(allMatches(source, /\b(?:public|private|protected|internal)\s+var\s+[A-Za-z_$][\w$]*\s*:\s*([A-Za-z_$][\w$.]*)/g)),
    constructs: unique(allMatches(source, /\bnew\s+([A-Za-z_$][\w$.]*)\s*\(/g)),
    staticCalls: unique(allMatches(source, /\b([A-Z][A-Za-z0-9_$]*)\.([A-Za-z_$][\w$]*)\s*\(/g, 0)
      .map(match => match.slice(0, -1).replace(/\s*\($/, '')))
  };
}

export function buildRelationIndex(files) {
  const classes = {};
  for (const { name, source } of files) {
    const relation = parseAs3Class(source, name);
    if (relation) classes[relation.className] = relation;
  }

  const edges = [];
  for (const relation of Object.values(classes)) {
    if (relation.extends) edges.push({ from: relation.className, to: relation.extends, kind: 'extends' });
    for (const target of relation.typedFields) edges.push({ from: relation.className, to: target, kind: 'typedFields' });
    for (const target of relation.constructs) edges.push({ from: relation.className, to: target, kind: 'constructs' });
    for (const target of relation.staticCalls) edges.push({ from: relation.className, to: target, kind: 'staticCalls' });
  }
  return { classes, edges };
}
