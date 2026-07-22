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
  },
  "surfaceTransitions": [
    {
      "state": 1,
      "effects": [
        {
          "type": "hudFrame",
          "frameLabel": "tutjump"
        }
      ],
      "showDownArrowsState": 1,
      "nextState": 2,
      "resetFrame": true,
      "wallFrame": 2
    },
    {
      "state": 2,
      "effects": [],
      "showDownArrowsState": 2,
      "nextState": 3,
      "resetFrame": true,
      "wallFrame": 3
    },
    {
      "state": 3,
      "effects": [
        {
          "type": "hudFrame",
          "frameLabel": "tutduck"
        },
        {
          "type": "message",
          "target": "unit0",
          "text": "That looks dangerous... I should find another way around.",
          "seconds": 5,
          "force": true,
          "voice": "V_Ca1_2"
        }
      ],
      "showDownArrowsState": 3,
      "nextState": 4,
      "resetFrame": true,
      "wallFrame": 4
    },
    {
      "state": 4,
      "effects": [],
      "showDownArrowsState": 4,
      "nextState": 5,
      "resetFrame": true,
      "wallFrame": 5
    },
    {
      "state": 5,
      "effects": [
        {
          "type": "message",
          "target": "unit1",
          "text": "What's the status, did we get them all?",
          "seconds": 6,
          "force": true,
          "voice": "V_Ca1_3"
        }
      ],
      "showDownArrowsState": 5,
      "nextState": 6,
      "resetFrame": true,
      "wallFrame": 6
    },
    {
      "state": 6,
      "effects": [
        {
          "type": "message",
          "target": "unit2",
          "text": "Yes sir. There was some resistance, we lost one of our men.",
          "seconds": 6,
          "force": true,
          "voice": "V_Ca1_4"
        }
      ],
      "showDownArrowsState": 6,
      "nextState": 7,
      "resetFrame": true,
      "wallFrame": 7
    },
    {
      "state": 7,
      "effects": [
        {
          "type": "message",
          "target": "unit1",
          "text": "Casualties happen. Clean the area and move on.",
          "seconds": 5,
          "force": true,
          "voice": "V_Ca1_5"
        }
      ],
      "showDownArrowsState": 7,
      "nextState": 8,
      "resetFrame": true,
      "wallFrame": 8
    },
    {
      "state": 8,
      "effects": [
        {
          "type": "hudFrame",
          "frameLabel": "tutshoot"
        },
        {
          "type": "message",
          "target": "player",
          "text": "Oh, a pistol... I'm a little rusty.",
          "seconds": 4,
          "force": true,
          "voice": "V_Ca1_6"
        },
        {
          "type": "setGuns",
          "target": "player",
          "primary": "USP2",
          "secondary": "none"
        },
        {
          "type": "setNoAim",
          "target": "player",
          "value": false
        }
      ],
      "showDownArrowsState": 8,
      "nextState": 9,
      "resetFrame": true,
      "wallFrame": 9
    },
    {
      "state": 9,
      "effects": [],
      "showDownArrowsState": 9,
      "nextState": 10,
      "resetFrame": true,
      "wallFrame": 10
    },
    {
      "state": 10,
      "effects": [
        {
          "type": "hudFrame",
          "frameLabel": "tutclimb"
        },
        {
          "type": "message",
          "target": "player",
          "text": "Ahhh, my legs! I... I can't jump...",
          "seconds": 5,
          "force": true,
          "voice": "V_Ca1_8"
        },
        {
          "type": "healToMax",
          "target": "player",
          "show": false,
          "force": true
        },
        {
          "type": "damageCurrentHealthFraction",
          "target": "player",
          "fraction": 0.8,
          "source": "env",
          "extra": {},
          "force": true
        },
        {
          "type": "setNoJump",
          "target": "player",
          "value": true
        },
        {
          "type": "playSound",
          "sound": "S_Mine1"
        },
        {
          "type": "playSound",
          "sound": "S_Pan"
        }
      ],
      "showDownArrowsState": 10,
      "nextState": 11,
      "resetFrame": true,
      "wallFrame": 11
    },
    {
      "state": 11,
      "effects": [
        {
          "type": "playSound",
          "sound": "S_Equip"
        },
        {
          "type": "message",
          "target": "player",
          "text": "Nice, some more ammo and a new weapon.",
          "seconds": 5,
          "force": true,
          "voice": "V_Ca1_9"
        },
        {
          "type": "setGuns",
          "target": "player",
          "primary": "M4",
          "secondary": "USP"
        },
        {
          "type": "swapGuns",
          "target": "player"
        },
        {
          "type": "hudFrame",
          "frameLabel": "tutswitch"
        },
        {
          "type": "setNoJump",
          "target": "player",
          "value": false
        }
      ],
      "showDownArrowsState": 11,
      "nextState": 12,
      "resetFrame": true,
      "wallFrame": 12
    },
    {
      "state": 12,
      "effects": [],
      "showDownArrowsState": 12,
      "nextState": 13,
      "resetFrame": true,
      "wallFrame": 13
    },
    {
      "state": 13,
      "effects": [
        {
          "type": "message",
          "target": "unit1",
          "text": "There's one more. We can't let him escape, eliminate him!",
          "seconds": 6,
          "force": true,
          "voice": "V_Ca1_10"
        },
        {
          "type": "setDiffStats",
          "target": "unit1",
          "difficulty": 1,
          "reset": true
        },
        {
          "type": "setDiffStats",
          "target": "unit2",
          "difficulty": 1,
          "reset": true
        },
        {
          "type": "setDiffStats",
          "target": "unit3",
          "difficulty": 1,
          "reset": true
        },
        {
          "type": "spawn",
          "target": "unit1",
          "x": 300,
          "y": 1200,
          "node": "i"
        },
        {
          "type": "spawn",
          "target": "unit2",
          "x": 750,
          "y": 1130,
          "node": "h"
        },
        {
          "type": "spawn",
          "target": "unit3",
          "x": 270,
          "y": 1470,
          "node": "a"
        },
        {
          "type": "doorFrame",
          "frameLabel": "close"
        }
      ],
      "showDownArrowsState": 13,
      "nextState": 14,
      "resetFrame": true,
      "wallFrame": 14
    },
    {
      "state": 14,
      "effects": [],
      "showDownArrowsState": 14,
      "nextState": 15,
      "resetFrame": true,
      "wallFrame": 15
    }
  ],
  "bulletTransition": {
    "hitObject": "9900ff",
    "requiredState": 9,
    "nextState": 10,
    "wallFrame": 10,
    "effects": [
      {
        "type": "hudFrame",
        "frameLabel": "idle"
      },
      {
        "type": "message",
        "target": "player",
        "text": "It looks like the elevator's out.. I'll have to jump.",
        "seconds": 5,
        "force": true,
        "voice": "V_Ca1_7"
      },
      {
        "type": "setAmmo",
        "target": "player",
        "clip": 0,
        "spare": 0
      },
      {
        "type": "elevatorFrame",
        "frameLabel": "play"
      },
      {
        "type": "hideDownArrows"
      }
    ]
  },
  "inputTransition": {
    "key": "swapGuns",
    "requiredState": 12,
    "nextState": 13,
    "wallFrame": 13,
    "effects": [
      {
        "type": "hudFrame",
        "frameLabel": "idle"
      },
      {
        "type": "showDownArrows",
        "state": 12
      },
      {
        "type": "doorFrame",
        "frameLabel": "open"
      }
    ]
  }
});
