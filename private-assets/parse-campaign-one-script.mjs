// This extractor intentionally reads the decoded ActionScript rather than
// recreating Campaign 1's tutorial in hand-authored JavaScript.  Campaign 1
// distributes progression across four original classes, so a future runtime
// can consume one auditable description without silently dropping a trigger.
function decodeString(value) {
  return value
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\([\\"'])/g, '$1');
}

function readBlock(source, openBrace) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = openBrace; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '{') depth += 1;
    else if (char === '}' && --depth === 0) return source.slice(openBrace + 1, index);
  }
  throw new Error('Unclosed ActionScript block');
}

function blockAfter(source, expression) {
  const start = source.search(expression);
  if (start < 0) throw new Error(`Source expression not found: ${expression}`);
  const openBrace = source.indexOf('{', start);
  if (openBrace < 0) throw new Error(`Source block missing opening brace: ${expression}`);
  return readBlock(source, openBrace);
}

function frameNumber(expression) {
  const compact = expression.replace(/\s/g, '');
  if (/^\d+$/.test(compact)) return Number(compact);
  const product = compact.match(/^(\d+)\*(\d+)$/);
  if (product) return Number(product[1]) * Number(product[2]);
  throw new Error(`Unsupported Campaign 1 frame expression: ${expression}`);
}

function targetName(sourceTarget) {
  if (sourceTarget === 'param1.player') return 'player';
  const unit = sourceTarget.match(/^param1\.units\[(\d+)\]$/);
  if (unit) return `unit${unit[1]}`;
  throw new Error(`Unsupported Campaign 1 target: ${sourceTarget}`);
}

function actionsIn(body) {
  const actions = [];
  for (const line of body.split(/\r?\n/)) {
    const guns = line.match(/param1\.player\.gun\.setGuns\("([^"]+)","([^"]+)"\)/);
    if (guns) {
      actions.push({ type: 'setGuns', target: 'player', primary: guns[1], secondary: guns[2] });
      continue;
    }
    const spawn = line.match(/param1\.units\[(\d+)\]\.spawn\((-?\d+),(-?\d+),"([^"]+)"\)/);
    if (spawn) {
      actions.push({ type: 'spawn', target: `unit${spawn[1]}`, x: Number(spawn[2]), y: Number(spawn[3]), node: spawn[4] });
      continue;
    }
    // Calls occupy one decoded ActionScript line; greedy capture is safe here
    // and faithfully preserves escaped apostrophes such as I\\'m.
    const message = line.match(/param1\.hud\.setMsg\((param1\.(?:player|units\[\d+\])),"(.*)",(\d+),(true|false),([A-Za-z0-9_]+)\)/);
    if (message) {
      actions.push({
        type: 'message', target: targetName(message[1]), text: decodeString(message[2]),
        seconds: Number(message[3]), force: message[4] === 'true', voice: message[5],
      });
      continue;
    }
    const hud = line.match(/param1\.hud\.gotoAndStop\("([^"]+)"\)/);
    if (hud) {
      actions.push({ type: 'hudFrame', frameLabel: hud[1] });
      continue;
    }
    const music = line.match(/SH\.playMusic\(([A-Za-z0-9_]+)\)/);
    if (music) actions.push({ type: 'playMusic', sound: music[1] });
  }
  return actions;
}

function timedActions(stageSource) {
  const result = [];
  for (const state of [1, 14]) {
    const stateBody = blockAfter(stageSource, new RegExp(`if\\(sn == ${state}\\)`));
    const matcher = /if\(fc == ([^)]+)\)\s*\{/g;
    let match;
    while ((match = matcher.exec(stateBody))) {
      const body = readBlock(stateBody, stateBody.indexOf('{', match.index));
      for (const action of actionsIn(body)) result.push({ state, frame: frameNumber(match[1]), ...action });
    }
  }
  return result;
}

function scoreTransitions(stageSource) {
  const result = [];
  const matcher = /if\(param1\.matchSettings\.team1score == (\d+) && sn == (\d+)\)\s*\{/g;
  let match;
  while ((match = matcher.exec(stageSource))) {
    const body = readBlock(stageSource, stageSource.indexOf('{', match.index));
    const [message] = actionsIn(body).filter((action) => action.type === 'message');
    if (!message || !/\+\+sn;/.test(body)) throw new Error('Campaign 1 score transition is incomplete');
    result.push({ state: Number(match[2]), score: Number(match[1]), nextState: Number(match[2]) + 1, ...message });
  }
  return result;
}

function campaignOneStage(source) {
  const runScriptsStart = source.indexOf('public static function runScripts(param1:Game)');
  if (runScriptsStart < 0) throw new Error('Stats_Campaign.runScripts not found');
  // ActionScript switch cases do not own braces.  Use their indentation from
  // the decoded source, so we select caType=0 / caStage=1 rather than the
  // nested `if(sn == 1)` body.
  const stageStart = source.indexOf('                  case 1:', runScriptsStart);
  const stageEnd = source.indexOf('                  case 2:', stageStart);
  if (stageStart < 0 || stageEnd < 0) throw new Error('Campaign 1 runScripts case boundaries not found');
  return source.slice(stageStart, stageEnd);
}

function surfaceTrigger(unit) {
  const surface = unit.match(/this\.surface = this\.getPixel\(0,1\)\.toString\(16\)\.substring\(2\);[\s\S]*?case "([0-9a-f]+)":\s*§§push\(0\);/);
  if (!surface || !/if\(!this\.human\)/.test(unit) || !/MatchSettings\.caStage == 1/.test(unit)) {
    throw new Error('Campaign 1 human foot-contact trigger not found');
  }
  return { surface: surface[1], kind: 'human-foot-contact' };
}

function bulletTrigger(bullet) {
  const hit = bullet.match(/case "([0-9a-f]+)":\s*§§push\(0\);[\s\S]*?case 0:\s*if\(Stats_Campaign\.sn == (\d+)\)/);
  if (!hit) throw new Error('Campaign 1 bullet/environment trigger not found');
  return { hitObject: hit[1], requiredState: Number(hit[2]) };
}

function inputTrigger(player) {
  const swap = player.match(/gun\.swapGuns\(\);\s*if\(Stats_Campaign\.sn == (\d+)\)/);
  if (!swap) throw new Error('Campaign 1 gun-swap trigger not found');
  return { key: 'swapGuns', requiredState: Number(swap[1]) };
}

export function extractCampaignOneScript({ campaign, unit, bullet, player }) {
  const stage = campaignOneStage(campaign);
  return {
    timed: timedActions(stage),
    scoreTransitions: scoreTransitions(stage),
    surfaceTrigger: surfaceTrigger(unit),
    bulletTrigger: bulletTrigger(bullet),
    inputTrigger: inputTrigger(player),
  };
}
