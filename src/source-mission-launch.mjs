// A source-mission launch is deliberately narrower than a generic quick
// match.  This route exists only after the exact Stats_Campaign record has a
// dedicated runtime page that consumes its original Arena/session pipeline.
// Do not add a route here merely because a map image can be displayed.
const CAMPAIGN_ONE_TUTORIAL = Object.freeze({
  kind: 'campaign-one-tutorial',
  href: './tutorial-scene-preview.html?source=campaign-1',
  message: '第 1 关已接入原 Tutorial 场景承载。',
});

export function getSourceMissionLaunch(selection) {
  const definition = selection?.definition;
  if (
    definition?.kind === 'campaign'
    && definition.stage === 1
    && definition.title === 'Under Siege'
    && definition.map === 'tut'
    && definition.mode === 'tdm'
  ) return CAMPAIGN_ONE_TUTORIAL;
  return null;
}
