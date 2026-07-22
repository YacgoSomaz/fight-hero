// GENERATED from decoded Campaign 1 ActionScript: Stats_Campaign, Unit, Bullet, and Player.
// Regenerate with: npm run extract:campaign
export const SOURCE_CAMPAIGN_ONE_SCRIPT = Object.freeze({
  "timed": [
    {
      "state": 1,
      "frame": 0,
      "type": "setGuns",
      "target": "player",
      "primary": "none",
      "secondary": "none"
    },
    {
      "state": 1,
      "frame": 20,
      "type": "message",
      "target": "player",
      "text": "They're here! I have to escape!",
      "seconds": 4,
      "force": true,
      "voice": "V_Ca1_1"
    },
    {
      "state": 1,
      "frame": 90,
      "type": "hudFrame",
      "frameLabel": "tutmove"
    },
    {
      "state": 14,
      "frame": 150,
      "type": "message",
      "target": "player",
      "text": "Oh dear...",
      "seconds": 3,
      "force": true,
      "voice": "V_Ca1_11"
    },
    {
      "state": 14,
      "frame": 360,
      "type": "spawn",
      "target": "unit4",
      "x": 770,
      "y": 870,
      "node": "z"
    },
    {
      "state": 14,
      "frame": 360,
      "type": "message",
      "target": "unit4",
      "text": "Sorry I'm late.",
      "seconds": 4,
      "force": true,
      "voice": "V_Ca1_12"
    },
    {
      "state": 14,
      "frame": 360,
      "type": "playMusic",
      "sound": "M_Theme"
    },
    {
      "state": 14,
      "frame": 450,
      "type": "message",
      "target": "player",
      "text": "What? I don't know who you are, but help me!",
      "seconds": 5,
      "force": true,
      "voice": "V_Ca1_13"
    },
    {
      "state": 14,
      "frame": 600,
      "type": "message",
      "target": "unit4",
      "text": "Don't worry I've got you.",
      "seconds": 4,
      "force": true,
      "voice": "V_Ca1_14"
    }
  ],
  "scoreTransitions": [
    {
      "state": 14,
      "score": 6,
      "nextState": 15,
      "type": "message",
      "target": "unit4",
      "text": "Hehehah, take some of this!",
      "seconds": 5,
      "force": true,
      "voice": "V_Ca1_15"
    },
    {
      "state": 15,
      "score": 9,
      "nextState": 16,
      "type": "message",
      "target": "player",
      "text": "I'm very sorry for killing you!",
      "seconds": 4,
      "force": true,
      "voice": "V_Ca1_16"
    },
    {
      "state": 16,
      "score": 12,
      "nextState": 17,
      "type": "message",
      "target": "unit1",
      "text": "Their firepower is too strong... Aeuughh!",
      "seconds": 5,
      "force": true,
      "voice": "V_Ca1_17"
    },
    {
      "state": 17,
      "score": 14,
      "nextState": 18,
      "type": "message",
      "target": "unit4",
      "text": "These guys are smalltime!",
      "seconds": 5,
      "force": true,
      "voice": "V_Ca1_18"
    }
  ],
  "surfaceTrigger": {
    "surface": "ff00ff",
    "kind": "human-foot-contact"
  },
  "bulletTrigger": {
    "hitObject": "9900ff",
    "requiredState": 9
  },
  "inputTrigger": {
    "key": "swapGuns",
    "requiredState": 12
  }
});
