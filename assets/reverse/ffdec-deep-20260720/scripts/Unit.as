package
{
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.geom.ColorTransform;
   import flash.text.TextField;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol687")]
   public class Unit extends MovieClip
   {
      
      §§push(Unit);
      if(37 == 34)
      {
         return;
      }
      
      public var icon:MovieClip;
      
      public var bar_hurt:MovieClip;
      
      public var txt_name:TextField;
      
      public var bar_hp:MovieClip;
      
      public var txt_level:TextField;
      
      public var game:Game;
      
      public var mDown:Boolean;
      
      public var laserColor:uint = 16711680;
      
      public var laserX:Number;
      
      public var laserY:Number;
      
      public var laserOX:Number;
      
      public var laserOY:Number;
      
      public var human:Boolean;
      
      public var unitInfo:Object;
      
      public var team:uint;
      
      public var odiff:uint;
      
      public var diff:uint;
      
      public var pscore:int = 0;
      
      public var dead:PhysActor;
      
      private var firstSpawn:Boolean = true;
      
      public var respawnTimer:uint;
      
      public var canUseStreak:Boolean;
      
      public var streakInProgress:Boolean;
      
      public var sEvent:uint = 1;
      
      public var hasFlag:NodeCtfFlag;
      
      public var isJug:Boolean;
      
      public var onPoint:Boolean;
      
      public var capturing:Boolean;
      
      public var defendingFlag:Boolean;
      
      public var flip:Boolean;
      
      public var aimX:Number;
      
      public var aimY:Number;
      
      public var aimRoation:Number;
      
      private var rotArm:Number;
      
      private var rotReload:Number = 0;
      
      public var mov:Movement;
      
      public var gun:Guns;
      
      public var status:Status;
      
      public var score:Score;
      
      private var achPlug:uint = 0;
      
      private var underWater:uint = 0;
      
      public var keys:uint = 0;
      
      public const UP:uint = 1;
      
      public const DOWN:uint = 2;
      
      public const LEFT:uint = 4;
      
      public const RIGHT:uint = 8;
      
      public var MC:UnitMC;
      
      public var spinMC:Sprite;
      
      public var MCfilters:Array;
      
      public var nextAnim:String;
      
      private var surface:String;
      
      public var constAnim:String;
      
      private var greenBar:ColorTransform;
      
      private var greenBarBack:ColorTransform;
      
      private var blueBar:ColorTransform;
      
      private var blueBarBack:ColorTransform;
      
      private var redBar:ColorTransform;
      
      private var redBarBack:ColorTransform;
      
      private var fc:uint;
      
      public function Unit(param1:Game, param2:Boolean, param3:Object)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         addFrameScript(0,this.frame1);
         this.game = param1;
         this.human = param2;
         this.unitInfo = param3;
         this.odiff = this.unitInfo.diff;
         this.greenBar = new ColorTransform();
         this.greenBar.color = 3407667;
         this.greenBarBack = new ColorTransform();
         this.greenBarBack.color = 39168;
         this.blueBar = new ColorTransform();
         this.blueBar.color = 3381708;
         this.blueBarBack = new ColorTransform();
         this.blueBarBack.color = 26367;
         this.redBar = new ColorTransform();
         this.redBar.color = 13408512;
         this.redBarBack = new ColorTransform();
         this.redBarBack.color = 13395456;
         this.spinMC = new Sprite();
         addChild(this.spinMC);
         this.MC = new UnitMC(this);
         this.spinMC.addChild(this.MC);
         this.spinMC.y = -50;
         this.MC.y = 50;
         this.mov = new Movement(this);
         this.gun = new Guns(this);
         this.status = new Status(this);
         this.score = new Score(this);
         this.team = this.unitInfo.team;
         name = this.unitInfo.name;
         this.txt_name.text = name;
         if(this.unitInfo.extra.kills)
         {
            this.score.setKills(this.unitInfo.extra.kills);
         }
         this.MCfilters = [];
         if(this.unitInfo.extra.noSpawn)
         {
            visible = false;
            x = -4000;
            y = -4000;
         }
         else if(this.unitInfo.extra.spawn)
         {
            this.spawn(this.unitInfo.extra.spawn.x,this.unitInfo.extra.spawn.y,this.unitInfo.extra.spawn.node);
         }
         else
         {
            this.spawn();
         }
      }
      
      public function setClass() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.human)
         {
            MatchSettings.updatePlayer();
            this.unitInfo = MatchSettings.usePlayer;
         }
         if(this.unitInfo.extra.level)
         {
            this.unitInfo.level = this.unitInfo.extra.level;
         }
         if(this.human)
         {
            trace("Get stats for level",this.unitInfo.level);
         }
         var _loc1_:Object = Stats_Classes.getClass(this.unitInfo.soldier,this.unitInfo.level);
         this.unitInfo.hp = _loc1_.hp;
         this.unitInfo.crit = _loc1_.crit * 0.01;
         this.unitInfo.aim = _loc1_.aim * 0.01;
         this.unitInfo.amm = _loc1_.amm * 0.01;
         this.unitInfo.headBonus = 1.45;
         this.unitInfo.critBonus = 1.35;
         if(this.unitInfo.extra.hp)
         {
            this.unitInfo.hp = this.unitInfo.extra.hp;
         }
         this.unitInfo.icon = _loc1_.icon;
         this.unitInfo.startFrame = _loc1_.startFrame;
         this.unitInfo.className = _loc1_.name;
         this.unitInfo.num = _loc1_.num;
         this.unitInfo.runType = _loc1_.runType;
         this.unitInfo.id = _loc1_.id;
         this.unitInfo.frame = _loc1_.startFrame + this.unitInfo.skin;
         this.unitInfo.skill = Stats_Skills.skillOb[MatchSettings.useSkills ? this.unitInfo._skill : "none"];
         this.unitInfo.streak = Stats_Streaks.streakOb[MatchSettings.useStreaks ? this.unitInfo._streak : "none"];
         if(!MatchSettings.useMap.outdoors && Boolean(this.unitInfo.streak.special))
         {
            this.unitInfo.streak = Stats_Streaks.streakOb["none"];
         }
         trace("Unit Stats",name,this.unitInfo.skill.name,this.unitInfo.streak.name,this.unitInfo.level);
         if(this.unitInfo.skill.id == "health")
         {
            this.unitInfo.hp += this.unitInfo.skill.value;
         }
         if(this.unitInfo.skill.id == "ammo")
         {
            this.unitInfo.amm += this.unitInfo.skill.value;
         }
         if(this.unitInfo.skill.id == "critical")
         {
            this.unitInfo.aim += this.unitInfo.skill.value;
            this.unitInfo.crit += this.unitInfo.skill.value;
         }
         if(this.unitInfo.skill.id == "combat")
         {
            this.unitInfo.hp += 10;
            this.unitInfo.amm += 0.1;
            this.unitInfo.aim += 0.03;
            this.unitInfo.crit += 0.03;
         }
         if(this.unitInfo.skill.id == "vital")
         {
            this.unitInfo.headBonus += this.unitInfo.skill.value;
            this.unitInfo.critBonus += this.unitInfo.skill.value;
         }
         this.unitInfo.regen = this.unitInfo.hp * 0.001;
         if(this.unitInfo.skill.id == "adren")
         {
            this.unitInfo.regen = this.unitInfo.hp * 0.001 * this.unitInfo.skill.value;
         }
         this.MC.setSkin(this.unitInfo.frame);
         if(MatchSettings.useMod == "party")
         {
            this.gun.setGuns(UT.randEl(Stats_Guns.classAr[UT.irand(1,4)]).id,UT.randEl(Stats_Guns.classAr[0]).id);
         }
         else
         {
            this.gun.setGuns(this.unitInfo.primary,this.unitInfo.secondary);
         }
         this.icon.gotoAndStop(this.unitInfo.icon);
         this.txt_level.text = this.unitInfo.level;
         if(this.human)
         {
            this.game.hud.txt_classname.text = this.unitInfo.className;
            this.game.hud.icon.gotoAndStop(this.unitInfo.icon);
            this.game.hud.mc_skill.gotoAndStop(this.unitInfo.skill.sprite);
            this.game.hud.mc_skill.visible = this.unitInfo.skill.sprite != "none";
            this.game.hud.mc_streak.gotoAndStop(this.unitInfo.streak.sprite);
            this.game.hud.mc_streak.visible = this.unitInfo.streak.sprite != "none";
            this.game.hud.txt_level.text = "lvl: " + this.unitInfo.level;
            this.game.hud.addExp(0);
            this.setKillstreakNum(0);
         }
         else
         {
            this.setDiffStats();
         }
         this.endKillstreak();
         if(this.unitInfo.extra.constAnim)
         {
            this.constAnim = this.unitInfo.extra.constAnim;
            if(this.unitInfo.extra.paraOnce)
            {
               this.unitInfo.extra.constAnim = false;
            }
         }
         this.setBarColour();
         if(MatchSettings.useMode == "jug" && !this.isJug)
         {
            this.changeTeam(1);
         }
      }
      
      public function changeTeam(param1:uint) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.team = param1;
         this.setBarColour();
         if(Boolean(MatchSettings.useMod) && param1 == 2)
         {
            this.unitInfo.skin = 5;
         }
         else
         {
            this.unitInfo.skin = param1 + 1;
         }
         this.unitInfo.frame = this.unitInfo.startFrame + this.unitInfo.skin;
         this.MC.setSkin(this.unitInfo.frame);
      }
      
      public function changeSkin(param1:uint) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.unitInfo.skin = param1;
         this.unitInfo.frame = this.unitInfo.startFrame + this.unitInfo.skin;
         this.MC.setSkin(this.unitInfo.frame);
      }
      
      public function setBarColour() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:ColorTransform = null;
         var _loc2_:ColorTransform = null;
         switch(this.team)
         {
            case 0:
               §§push(0);
               break;
            case 1:
               §§push(1);
               break;
            case 2:
               §§push(2);
               break;
            default:
               §§push(3);
         }
         2;
         switch(§§pop())
         {
            case 0:
               if(this.human)
               {
                  _loc1_ = this.greenBar;
               }
               else
               {
                  _loc1_ = this.greenBarBack;
               }
               _loc2_ = this.greenBar;
               break;
            case 1:
               if(this.human)
               {
                  _loc1_ = this.blueBar;
               }
               else
               {
                  _loc1_ = this.blueBarBack;
               }
               _loc2_ = this.blueBar;
               break;
            case 2:
               _loc1_ = this.redBarBack;
               _loc2_ = this.redBar;
         }
         this.bar_hp.transform.colorTransform = _loc1_;
         this.icon.transform.colorTransform = _loc2_;
         this.icon.alpha = 0.7;
         this.txt_level.transform.colorTransform = _loc2_;
         this.txt_level.alpha = 0.7;
         this.txt_name.transform.colorTransform = _loc2_;
         this.txt_name.alpha = 0.7;
      }
      
      public function setDiffStats(param1:Number = -99, param2:Boolean = false, param3:Boolean = true) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      public function spawn(param1:Number = 0, param2:Number = 0, param3:String = "") : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      public function getNextWaypoint(param1:NodeWaypoint = null, param2:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      public function unitSpawn(param1:Number, param2:Number, param3:String) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc4_:uint = 0;
         var _loc5_:NodeSpawn = null;
         if(this.unitInfo.extra.noSpawn)
         {
            this.unitInfo.extra.noSpawn = false;
         }
         this.mov.reset();
         if(this.human)
         {
            this.setClass();
         }
         else
         {
            this.setClass();
         }
         this.status.reset();
         this.MC.goto("idle");
         this.dead = null;
         visible = true;
         if(Boolean(param1) && Boolean(param2) && Boolean(param3))
         {
            if(!this.human)
            {
               _loc4_ = 0;
               while(_loc4_ < this.game.arena.waypoints.length)
               {
                  if(this.game.arena.waypoints[_loc4_].id == param3)
                  {
                     this.getNextWaypoint(this.game.arena.waypoints[_loc4_],true);
                     break;
                  }
                  _loc4_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
            }
            x = param1;
            y = param2;
         }
         else
         {
            _loc5_ = this.getSpawnNode();
            this.setAiSpawnNode(_loc5_);
            x = _loc5_.x + UT.rand(-5,5);
            y = _loc5_.y;
         }
         this.MC.rotation = 0;
         this.game.createEffect(x,y - 50,"spawn","idle",true);
         if(this.unitInfo.extra.permaStreak)
         {
            this.canUseStreak = true;
            this.useKillstreak();
         }
      }
      
      protected function getSpawnNode() : NodeSpawn
      {
         var _loc1_:Array = null;
         var _loc2_:NodeSpawn = null;
         if(Boolean(MatchSettings.useMode == "ctf") && Boolean(this.team) || Boolean(this.unitInfo.extra.teamSpawn))
         {
            _loc1_ = this.game.arena["spawnsT" + this.team];
         }
         else
         {
            _loc1_ = this.game.arena.spawns;
         }
         if(this.firstSpawn)
         {
            do
            {
               _loc2_ = UT.randEl(_loc1_);
            }
            while(_loc2_.initialSpawned);
            _loc2_.initialSpawned = true;
            this.firstSpawn = false;
            return _loc2_;
         }
         return UT.randEl(_loc1_);
      }
      
      protected function setAiSpawnNode(param1:NodeSpawn) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      public function die(param1:Unit, param2:Stats_Guns, param3:Object) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc4_:* = undefined;
         var _loc5_:uint = 0;
         var _loc6_:Number = NaN;
         var _loc7_:Number = NaN;
         if(Boolean(param3.headMult) || Boolean(param3.critMult) || param2.typeName == "Melee")
         {
            switch(UT.irand(0,2))
            {
               case 0:
                  §§push(0);
                  break;
               case 1:
                  §§push(1);
                  break;
               case 2:
                  §§push(2);
                  break;
               default:
                  §§push(3);
            }
            2;
            switch(§§pop())
            {
               case 0:
                  this.game.playScreenSound(S_Headshot1,x,y);
                  break;
               case 1:
                  this.game.playScreenSound(S_Headshot2,x,y);
                  break;
               case 2:
                  this.game.playScreenSound(S_Headshot3,x,y);
            }
         }
         else if(Math.random() < 0.35)
         {
            switch(UT.irand(0,5))
            {
               case 0:
                  §§push(0);
                  break;
               case 1:
                  §§push(1);
                  break;
               case 2:
                  §§push(2);
                  break;
               case 3:
                  §§push(3);
                  break;
               case 4:
                  §§push(4);
                  break;
               case 5:
                  §§push(5);
                  break;
               default:
                  §§push(6);
            }
            2;
            switch(§§pop())
            {
               case 0:
                  this.game.playScreenSound(S_Die1,x,y);
                  break;
               case 1:
                  this.game.playScreenSound(S_Die2,x,y);
                  break;
               case 2:
                  this.game.playScreenSound(S_Die6,x,y);
                  break;
               case 3:
                  this.game.playScreenSound(S_Die7,x,y);
                  break;
               case 4:
                  this.game.playScreenSound(S_Die8,x,y);
                  break;
               case 5:
                  this.game.playScreenSound(S_Die9,x,y);
            }
         }
         if(!this.game.gameEnded)
         {
            this.game.hud.addKillFeed(this,param1,param2);
            this.score.addDeath();
            if(this == param1)
            {
               this.score.addSuicide();
               if(this.isJug)
               {
                  do
                  {
                     var _temp_3:* = UT.randEl(this.game.units);
                     _loc4_ = UT.randEl(this.game.units);
                     if(_loc4_ != this)
                     {
                        break;
                     }
                  }
                  while(2 != 3);
                  _loc4_.setJug();
               }
            }
            else if(param3.teamkill)
            {
               this.score.addBetrayal();
            }
            else
            {
               param1.score.addKill();
               if(param3.headMult)
               {
                  var _loc8_:Score = param1.score;
                  var _loc9_:* = _loc8_.headshots + 1;
                  _loc8_.headshots = _loc9_;
               }
               _loc8_ = param1.score;
               var _loc10_:Number = _loc8_[_loc9_ = "killed" + this.unitInfo.num] + 1;
               _loc8_[_loc9_] = _loc10_;
               if(this.isJug)
               {
                  param3.jugKill = true;
                  param1.setJug();
               }
               if(this.hasFlag)
               {
                  param3.hasFlag = true;
               }
               if(param1.human)
               {
                  _loc5_ = Math.min(Stats_Classes.getUnitExp(param1.unitInfo.level + 3),Stats_Classes.getUnitExp(this.unitInfo.level));
                  if(MatchSettings.useMod)
                  {
                     _loc5_ *= Stats_Misc.getMod(MatchSettings.useMod).expmod;
                  }
                  if(MatchSettings.useExtra.expmod)
                  {
                     _loc5_ *= MatchSettings.useExtra.expmod;
                  }
                  _loc5_ = Math.ceil(_loc5_);
                  this.game.hud.addExp(_loc5_);
                  _loc6_ = x + UT.rand(-5,5) - 8;
                  _loc7_ = y - UT.rand(55,60);
                  this.game.createParticle(_loc6_,_loc7_,"slowText",0,null,"expText","idle",11);
                  if(_loc5_ < 10)
                  {
                     this.game.createParticle(_loc6_ + 8,_loc7_,"slowText",0,null,"expText","idle",_loc5_ + 1);
                  }
                  else
                  {
                     this.game.createParticle(_loc6_ + 8,_loc7_,"slowText",0,null,"expText","idle",uint(_loc5_ * 0.1) + 1);
                     this.game.createParticle(_loc6_ + 16,_loc7_,"slowText",0,null,"expText","idle",_loc5_ % 10 + 1);
                  }
               }
               if(MatchSettings.useExtra.vampire)
               {
                  param1.status.heal(param1.status.hpMax * 0.6,true);
               }
               if(MatchSettings.useExtra.kevlarKill)
               {
                  param1.getKevlar();
               }
            }
            if(this.human)
            {
               if(!MatchSettings.useSoldiers)
               {
                  this.game.hud.setClassChange(true);
               }
               if(param2.id == "env2" && this.streakInProgress)
               {
                  Stats_Achievements.setAchievement("lava");
               }
               if(param2.id == "env3")
               {
                  Stats_Achievements.setAchievement("drown");
               }
               this.game.hud.mc_streakarrow.visible = false;
            }
            if(this.constAnim)
            {
               this.game.createParticle(x,y - 110,"move",0,{
                  "xspd":-50,
                  "yspd":0
               },this.constAnim,"animate");
            }
         }
         if(this.hasFlag)
         {
            this.hasFlag.reset();
            this.hasFlag = null;
         }
         this.dead = this.game.physWorld.createCorpse(this,param1,param2,param3);
         visible = false;
         this.respawnTimer = 30 * 5;
         this.canUseStreak = false;
         if(this.human)
         {
            this.endKillstreak();
            this.game.aimer.x = -5000;
            this.game.aimer.y = -5000;
         }
      }
      
      public function setJug() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.human)
         {
         }
         var _loc1_:uint = 0;
         while(_loc1_ < this.game.units.length)
         {
            this.game.units[_loc1_].changeTeam(1);
            this.game.units[_loc1_].isJug = false;
            this.game.units[_loc1_].gotoAndStop(1);
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         this.changeTeam(2);
         this.status.heal(999,false);
         this.isJug = true;
         gotoAndStop(2);
         this.game.hud.addCustomFeed(this,"jug");
      }
      
      public function UnitEnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         var _loc2_:* = this;
         var _loc3_:Number = _loc2_.fc + 1;
         _loc2_.fc = _loc3_;
         if(x < 0 || y < 0 || x > 2880 || y > 2880)
         {
            this.status.damage(9999,this,Stats_Guns.gunOb["env"],{},true);
         }
         this.status.EnterFrame();
         this.gun.EnterFrame();
         this.MC.EnterFrame();
         this.mov.EnterFrame();
         if(this.constAnim)
         {
            this.game.bitscreen.paint(x + this.game.arena.x,y + this.game.arena.y - 110,true,this.constAnim + "0");
         }
         _loc1_ = 0;
         while(_loc1_ < this.game.arena.pickups.length)
         {
            if(!this.game.arena.pickups[_loc1_].taken)
            {
               if(UT.inBox(x,y,this.game.arena.pickups[_loc1_].x - 40,this.game.arena.pickups[_loc1_].y - 80,80,150))
               {
                  this.game.arena.pickups[_loc1_].getPickup(this);
               }
            }
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         this.onPoint = false;
         this.capturing = false;
         _loc1_ = 0;
         while(this.game.gameStarted && _loc1_ < this.game.arena.holdpoints.length)
         {
            if(UT.inBox(x,y,this.game.arena.holdpoints[_loc1_].x - 120,this.game.arena.holdpoints[_loc1_].y - 100,240,200))
            {
               this.onPoint = true;
               this.capturing = this.game.arena.holdpoints[_loc1_].curTeam != this.team;
               this.game.arena.holdpoints[_loc1_].capture(this);
            }
            _loc1_++;
         }
         _loc1_ = 0;
         while(_loc1_ < this.game.arena.ctfflags.length)
         {
            if(UT.inBox(x,y,this.game.arena.ctfflags[_loc1_].x - 40,this.game.arena.ctfflags[_loc1_].y - 70,80,95))
            {
               this.game.arena.ctfflags[_loc1_].capture(this);
            }
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         if(this.hasFlag)
         {
            if(this.fc % (Boolean(this.keys & this.LEFT) || Boolean(this.keys & this.RIGHT) ? 10 : 30) == 0)
            {
               this.game.createEffect(x + UT.rand(-7,7),y + UT.rand(3,7),"paper","idle" + UT.irand(1,2));
            }
         }
         if(Boolean(this.isJug) && Boolean(MatchSettings.useExtra.jugDrain) && this.fc % 10 == 0)
         {
            this.status.damage(this.status.hpMax * 0.05,this,Stats_Guns.gunOb["poison"],{},false);
         }
         if(Boolean(MatchSettings.useExtra.vampire) && this.fc % 20 == 0)
         {
            this.status.damage(this.status.hpMax * 0.05,this,Stats_Guns.gunOb["curse"],{},false);
         }
         if(this.unitInfo.extra.permaRapid)
         {
            this.status.sRapidHeal = 100;
         }
         this.mov.resetMods();
         this.surface = this.getPixel(0,1).toString(16).substring(2);
         if(this.human)
         {
            this.game.hud.debug.debug1.text = this.surface;
         }
         switch(this.surface)
         {
            case "ff00ff":
               §§push(0);
               break;
            case "ffff00":
               §§push(1);
               break;
            case "00ffff":
               §§push(2);
               break;
            case "993300":
               §§push(3);
               break;
            case "ccffff":
               §§push(4);
               break;
            case "ffffff":
               §§push(5);
               break;
            case "670067":
               §§push(6);
               break;
            case "6699ff":
               §§push(7);
               break;
            case "666666":
               §§push(8);
               break;
            case "999999":
               §§push(9);
               break;
            case "993300":
               §§push(10);
               break;
            case "993200":
               §§push(11);
               break;
            case "330000":
               §§push(12);
               break;
            case "320000":
               §§push(13);
               break;
            case "2c0000":
               §§push(14);
               break;
            case "2a0000":
               §§push(15);
               break;
            case "2e0000":
               §§push(16);
               break;
            case "2b0000":
               §§push(17);
               break;
            case "2f0000":
               §§push(18);
               break;
            case "2d0000":
               §§push(19);
               break;
            case "009999":
               §§push(20);
               break;
            default:
               §§push(21);
         }
         2;
         switch(§§pop())
         {
            case 0:
               if(!this.human)
               {
                  break;
               }
               if(MatchSettings.isCampaign && MatchSettings.caType == 0 && MatchSettings.caStage == 1)
               {
                  this.game.hud.gotoAndStop("idle");
                  switch(Stats_Campaign.sn)
                  {
                     case 1:
                        §§push(0);
                        break;
                     case 2:
                        §§push(1);
                        break;
                     case 3:
                        §§push(2);
                        break;
                     case 4:
                        §§push(3);
                        break;
                     case 5:
                        §§push(4);
                        break;
                     case 6:
                        §§push(5);
                        break;
                     case 7:
                        §§push(6);
                        break;
                     case 8:
                        §§push(7);
                        break;
                     case 9:
                        §§push(8);
                        break;
                     case 10:
                        §§push(9);
                        break;
                     case 11:
                        §§push(10);
                        break;
                     case 12:
                        §§push(11);
                        break;
                     case 13:
                        §§push(12);
                        break;
                     case 14:
                        §§push(13);
                        break;
                     default:
                        §§push(14);
                  }
                  2;
                  switch(§§pop())
                  {
                     case 0:
                        this.game.hud.gotoAndStop("tutjump");
                        break;
                     case 1:
                        break;
                     case 2:
                        this.game.hud.gotoAndStop("tutduck");
                        this.game.hud.setMsg(this.game.units[0],"That looks dangerous... I should find another way around.",5,true,V_Ca1_2);
                        break;
                     case 3:
                        break;
                     case 4:
                        this.game.hud.setMsg(this.game.units[1],"What\'s the status, did we get them all?",6,true,V_Ca1_3);
                        break;
                     case 5:
                        this.game.hud.setMsg(this.game.units[2],"Yes sir. There was some resistance, we lost one of our men.",6,true,V_Ca1_4);
                        break;
                     case 6:
                        this.game.hud.setMsg(this.game.units[1],"Casualties happen. Clean the area and move on.",5,true,V_Ca1_5);
                        break;
                     case 7:
                        this.game.hud.gotoAndStop("tutshoot");
                        this.game.hud.setMsg(this,"Oh, a pistol... I\'m a little rusty.",4,true,V_Ca1_6);
                        this.gun.setGuns("USP2","none");
                        this.unitInfo.extra.noAim = false;
                        break;
                     case 8:
                        break;
                     case 9:
                        this.game.hud.gotoAndStop("tutclimb");
                        this.game.hud.setMsg(this,"Ahhh, my legs! I... I can\'t jump...",5,true,V_Ca1_8);
                        this.status.heal(this.status.hpMax,false,true);
                        this.status.damage(this.status.hpCur * 0.8,this,Stats_Guns.gunOb["env"],{},true);
                        this.mov.noJump = true;
                        SH.playSound(S_Mine1);
                        SH.playSound(S_Pan);
                        break;
                     case 10:
                        SH.playSound(S_Equip);
                        this.game.hud.setMsg(this,"Nice, some more ammo and a new weapon.",5,true,V_Ca1_9);
                        this.gun.setGuns("M4","USP");
                        this.gun.swapGuns();
                        this.game.hud.gotoAndStop("tutswitch");
                        this.mov.noJump = false;
                        break;
                     case 11:
                        break;
                     case 12:
                        this.game.hud.setMsg(this.game.units[1],"There\'s one more. We can\'t let him escape, eliminate him!",6,true,V_Ca1_10);
                        this.game.units[1].setDiffStats(1,true);
                        this.game.units[2].setDiffStats(1,true);
                        this.game.units[3].setDiffStats(1,true);
                        this.game.units[1].spawn(300,1200,"i");
                        this.game.units[2].spawn(750,1130,"h");
                        this.game.units[3].spawn(270,1470,"a");
                        this.game.arena.door.gotoAndPlay("close");
                        break;
                     case 13:
                  }
                  _loc1_ = 0;
                  while(_loc1_ < this.game.arena.downarrows.length)
                  {
                     if(Number(this.game.arena.downarrows[_loc1_].name.substring(9)) == Stats_Campaign.sn)
                     {
                        this.game.arena.downarrows[_loc1_].visible = true;
                     }
                     else
                     {
                        this.game.arena.downarrows[_loc1_].visible = false;
                     }
                     _loc1_++;
                     if(2 == 3)
                     {
                        break;
                     }
                  }
               }
               else if(MatchSettings.isCampaign && MatchSettings.caType == 0 && MatchSettings.caStage == 5)
               {
                  switch(Stats_Campaign.sn)
                  {
                     case 1:
                        §§push(0);
                        break;
                     case 2:
                        §§push(1);
                        break;
                     default:
                        §§push(2);
                  }
                  2;
                  switch(§§pop())
                  {
                     case 0:
                        break;
                     case 1:
                        SH.playMusic(M_Theme);
                        this.game.hud.setMsg(this.game.player,"Sorry I\'m late.",4,true,V_Ca1_12);
                        this.game.player.unitInfo.extra.noShoot = false;
                  }
               }
               _loc2_ = Stats_Campaign;
               _loc3_ = _loc2_.sn + 1;
               _loc2_.sn = _loc3_;
               Stats_Campaign.fc = 0;
               this.game.arena.changeWallFrame(Stats_Campaign.sn);
               break;
            case 1:
               Stats_Achievements.setAchievement("tutbody");
               break;
            case 2:
               this.mov.modJump = 1.8;
               _loc2_ = this;
               _loc3_ = _loc2_.achPlug + 1;
               _loc2_.achPlug = _loc3_;
               if(this.achPlug >= 10 * 30)
               {
                  Stats_Achievements.setAchievement("plug");
               }
               break;
            case 3:
               this.mov.modSpeed = 0.3;
               this.mov.modBrake = 0.25;
               this.mov.modJump = 0.8;
               this.mov.modSlide = 0.2;
               if(Math.abs(this.mov.xVel) > 5 && this.fc % 3 == 0)
               {
                  this.game.createEffect(x,y - 4,"mud_splash");
               }
               break;
            case 4:
               this.mov.modSpeed = 0.3;
               this.mov.modBrake = 1;
               this.mov.modSlide = 0.3;
               break;
            case 5:
               this.mov.modMax = 0.7;
               this.mov.modJump = 0.8;
               this.mov.modBrake = 2;
               if(Math.abs(this.mov.xVel) > 1 && this.fc % 3 == 0)
               {
                  this.game.createEffect(x,y - 4,"snow_splash");
               }
               break;
            case 6:
               this.mov.modJump = 0.6;
               this.mov.modGrav = 0.4;
               break;
            case 7:
               this.mov.modSpeed = 0.3;
               this.mov.modBrake = 1.8;
               this.mov.modGrav = 0.1;
               break;
            case 8:
               this.mov.modMove = 8;
               break;
            case 9:
               this.mov.modMove = -8;
               break;
            case 10:
            case 11:
               this.status.damage(20,this,Stats_Guns.gunOb["env2"],{},true);
               if(!this.status.sFire)
               {
                  this.status.sFire = 2 * 30;
               }
               break;
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
            case 17:
            case 18:
            case 19:
               this.status.damage(9999,this,Stats_Guns.gunOb["env"],{},true);
               break;
            case 20:
               if(this.mov.crouching)
               {
                  _loc2_ = this;
                  _loc3_ = _loc2_.underWater + 1;
                  _loc2_.underWater = _loc3_;
               }
               else
               {
                  this.underWater = 0;
               }
               if(this.underWater >= 30 * 5)
               {
                  this.status.damage(0.5,this,Stats_Guns.gunOb["env3"],{},true);
               }
               break;
            default:
               this.achPlug = 0;
               this.underWater = 0;
         }
         this.MC.goto(this.nextAnim);
         this.flip = this.mov.jumping ? this.aimX < x : UT.fixRotation(this.aimRoation - this.MC.rotation) < 0;
         this.MC.scaleX = this.flip ? -1 : 1;
         this.rotArm = UT.getRotation(x + this.MC.arm1.x + this.MC.rotation * 1.2,y + this.MC.arm1.y,this.aimX,this.aimY) - 90;
         this.aimRoation = UT.fixRotation(this.rotArm + 90) + this.spinMC.rotation;
         if(this.flip)
         {
            this.rotArm = -this.rotArm + 180;
         }
         this.rotArm = UT.fixRotation(this.rotArm - rotation) + (this.flip ? this.MC.rotation : -this.MC.rotation);
         this.rotReload += ((this.gun.reloading && this.rotArm < 30 ? 30 : 0) - this.rotReload) * 0.2;
         this.MC.arm1.rotation = this.rotReload + this.rotArm;
         this.MC.arm2.rotation = this.rotReload + this.rotArm;
         this.MC.head.rotation = this.rotReload + this.rotArm * 0.6;
         if(this.unitInfo.skill.id == "vital" && this.gun.curGun.typeName != "Melee")
         {
            this.laserX = this.laserOX = this.MC.arm1.x + UT.xMoveToRot(this.aimRoation + this.MC.rotation,38);
            §§push(this);
            this.laserOY = _loc2_ = this.MC.arm1.y + UT.yMoveToRot(this.aimRoation + this.MC.rotation,38);
            §§pop().laserY = _loc2_;
            while(!this.hitTestAll(this.laserX,this.laserY))
            {
               this.laserX += UT.xMoveToRot(this.aimRoation,15);
               this.laserY += UT.yMoveToRot(this.aimRoation,15);
               if(2 != 3)
               {
                  continue;
               }
               if(this.hitTestAll(this.laserX,this.laserY,true))
               {
                  this.laserX -= UT.xMoveToRot(this.aimRoation,3);
                  this.laserY -= UT.yMoveToRot(this.aimRoation,3);
                  break;
               }
               this.game.lineCont.graphics.lineStyle(3,this.laserColor,0.15);
               this.game.lineCont.graphics.moveTo(x + this.laserOX,y + this.laserOY);
               this.game.lineCont.graphics.lineTo(x + this.laserX,y + this.laserY);
               this.game.bitscreen.paint(x + this.laserX + this.game.arena.x,y + this.laserY + this.game.arena.y,true,"laserdot0");
            }
            while(true)
            {
               if(2 != 3)
               {
                  §§goto(addr1952);
               }
               §§goto(addr19ae);
               this.laserX -= UT.xMoveToRot(this.aimRoation,3);
               this.laserY -= UT.yMoveToRot(this.aimRoation,3);
            }
            §§goto(addr196e);
         }
         this.MC.filters = this.MCfilters;
      }
      
      public function useKillstreak() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:NodeSpawn = null;
         var _loc2_:uint = 0;
         if(!this.canUseStreak)
         {
            return;
         }
         if(this.dead)
         {
            return;
         }
         if(this.human)
         {
            this.game.hud.mc_streakarrow.visible = false;
         }
         this.canUseStreak = false;
         this.streakInProgress = true;
         if(this.human)
         {
            this.game.hud.txt_streakready.text = this.unitInfo.streak.name + "\nin progress!";
         }
         this.game.createEffect(x,y - 100,"useStreak");
         this.game.hud.addKillstreakFeed(this,this.unitInfo.streak);
         if(this.unitInfo.streak.global)
         {
            this.game.createKillstreak(this,this.unitInfo.streak.id);
         }
         else
         {
            switch(this.unitInfo.streak.id)
            {
               case "mine":
                  §§push(0);
                  break;
               case "smoke":
                  §§push(1);
                  break;
               case "surge":
                  §§push(2);
                  break;
               case "mirror":
                  §§push(3);
                  break;
               case "fire":
                  §§push(4);
                  break;
               case "vest":
                  §§push(5);
                  break;
               case "rapid":
                  §§push(6);
                  break;
               default:
                  §§push(7);
            }
            2;
            switch(§§pop())
            {
               case 0:
                  this.game.bullets.push(new Stats_Guns.gunOb["mine"].cls(this.game,this,this.aimRoation,x,y,0,"mine"));
                  this.endKillstreak();
                  break;
               case 1:
                  this.game.playScreenSound(S_Skill,x,y);
                  this.game.createEffect(x,y - 50,"smokeBomb","idle",true);
                  _loc2_ = 0;
                  do
                  {
                     _loc2_++;
                     _loc1_ = UT.randEl(this.game.arena.spawns);
                  }
                  while(UT.getDist(x,y,_loc1_.x,_loc1_.y) < 80 && _loc2_ < 20);
                  this.setAiSpawnNode(_loc1_);
                  x = _loc1_.x + UT.rand(-5,5);
                  y = _loc1_.y;
                  this.mov.xVel = 0;
                  this.mov.yVel = 0;
                  this.game.createEffect(x,y - 50,"smokeBomb","idle",true);
                  this.game.playScreenSound(S_Skill,x,y);
                  this.endKillstreak();
                  break;
               case 2:
                  this.game.playScreenSound(S_Skill,x,y);
                  this.status.sSurge = 5 * 30;
                  this.game.createEffect(x,y - 30,"surge");
                  this.game.arena.setShake(5,5);
                  break;
               case 3:
                  this.game.playScreenSound(S_Skill,x,y);
                  this.game.playScreenSound(S_Ice,x,y);
                  this.status.sReflect = 5 * 30;
                  this.game.createEffect(x,y - 30,"shieldHexBlue");
                  break;
               case 4:
                  this.game.playScreenSound(S_Skill,x,y);
                  this.status.sFire = 10 * 30;
                  this.game.createEffect(x,y - 30,"surge");
                  this.game.arena.setShake(8,8);
                  break;
               case 5:
                  if(this.team)
                  {
                     SH.playSound(S_Ice);
                     _loc2_ = 0;
                     while(_loc2_ < this.game.units.length)
                     {
                        if(!this.game.units[_loc2_].dead)
                        {
                           if(this.game.units[_loc2_].team == this.team)
                           {
                              this.game.units[_loc2_].getKevlar(false);
                           }
                        }
                        _loc2_++;
                        if(2 == 3)
                        {
                           break;
                        }
                     }
                  }
                  else
                  {
                     this.getKevlar();
                  }
                  this.endKillstreak();
                  break;
               case 6:
                  if(this.team)
                  {
                     SH.playSound(S_Heal);
                     _loc2_ = 0;
                     while(_loc2_ < this.game.units.length)
                     {
                        if(!this.game.units[_loc2_].dead)
                        {
                           if(this.game.units[_loc2_].team == this.team)
                           {
                              this.game.units[_loc2_].status.sRapidHeal = 10 * 30;
                              this.game.createEffect(this.game.units[_loc2_].x,this.game.units[_loc2_].y - 40,"heal");
                           }
                        }
                        _loc2_++;
                        if(2 == 3)
                        {
                           break;
                        }
                     }
                  }
                  else
                  {
                     this.game.playScreenSound(S_Heal,x,y);
                     this.status.sRapidHeal = 10 * 30;
                     this.game.createEffect(x,y - 40,"heal");
                  }
            }
         }
         if(this.human && Boolean(this.unitInfo.streak.allyUse))
         {
            this.game.hud.setMsg(this,this.unitInfo.streak.allyUse);
            if(this.unitInfo.streak.allySound)
            {
               SH.playVoice(this.unitInfo.streak.allySound);
            }
         }
         else if(this.team == 1 && Boolean(this.unitInfo.streak.allyUse))
         {
            this.game.hud.setMsg(this,this.unitInfo.streak.allyUse);
            if(this.unitInfo.streak.allySound)
            {
               SH.playVoice(this.unitInfo.streak.allySound);
            }
         }
         else if(this.team == 2 && Boolean(this.unitInfo.streak.enemyUse))
         {
            this.game.hud.setMsgRandomTeammate(1,this.unitInfo.streak.enemyUse);
            if(this.unitInfo.streak.enemySound)
            {
               SH.playVoice(this.unitInfo.streak.enemySound);
            }
         }
         else if(this.team == 0 && Boolean(this.unitInfo.streak.enemyUse))
         {
            this.game.hud.setMsg(this.game.player,this.unitInfo.streak.enemyUse);
            if(this.unitInfo.streak.enemySound)
            {
               SH.playVoice(this.unitInfo.streak.enemySound);
            }
         }
      }
      
      public function getKevlar(param1:Boolean = true) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.game.playScreenSound(S_Ice,x,y);
         this.status.shCur = 100;
         this.game.createEffect(x,y - 30,"shieldHex");
      }
      
      public function startKillstreak() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.canUseStreak = true;
         this.streakInProgress = false;
         this.game.createParticle(x,y - 70,"slowText",0,null,"bigText","killstreak");
         this.game.createParticle(x,y - 60,"slowText",0,null,"bigText","ready");
         if(this.human)
         {
            this.game.hud.txt_streakready.text = this.unitInfo.streak.name + " ready,\nPress E or Ctrl to use!";
            SH.playSound(S_Killstreak,true);
            this.game.hud.mc_streakarrow.visible = true;
         }
      }
      
      public function endKillstreak() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.streakInProgress = false;
         this.canUseStreak = false;
         this.setKillstreakNum(0);
         if(this.human)
         {
            this.game.hud.txt_streakready.text = "";
         }
      }
      
      public function setKillstreakNum(param1:uint) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!this.human)
         {
            return;
         }
         if(this.unitInfo.streak.id == "none")
         {
            this.game.hud.txt_streaknum.text = "";
            return;
         }
         this.game.hud.txt_streaknum.text = param1 + "/" + (this.unitInfo.skill.id == "charisma" ? this.unitInfo.streak.kills - 1 : this.unitInfo.streak.kills);
      }
      
      private function hitTestAll(param1:Number = 0, param2:Number = 0, param3:Boolean = false) : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc5_:uint = 0;
         var _loc4_:uint = this.game.arena.wall.getPixel32(x + param1,y + param2);
         if((Boolean(_loc4_)) && _loc4_.toString(16).substring(0,2) == "ff")
         {
            return _loc4_.toString(16).substring(2);
         }
         _loc5_ = 0;
         while(_loc5_ < this.game.units.length)
         {
            if(this.game.units[_loc5_] != this)
            {
               if(!this.game.units[_loc5_].dead)
               {
                  if(!(Boolean(this.team) && this.team == this.game.units[_loc5_].team))
                  {
                     if(UT.inBox(x + param1,y + param2,this.game.units[_loc5_].x - 20,this.game.units[_loc5_].y - 80,40,80))
                     {
                        return this.game.units[_loc5_];
                     }
                  }
               }
            }
            _loc5_++;
            if(2 == 3)
            {
               break;
            }
         }
         if(param3)
         {
            _loc5_ = 0;
            while(_loc5_ < this.game.physWorld.actors.length)
            {
               if(UT.getDist(x + param1,y + param2,this.game.physWorld.actors[_loc5_].rdBody.GetDefinition().userData.x,this.game.physWorld.actors[_loc5_].rdBody.GetDefinition().userData.y) < 30)
               {
                  return this.game.physWorld.actors[_loc5_];
               }
               _loc5_++;
               if(2 == 3)
               {
                  break;
               }
            }
         }
         return null;
      }
      
      protected function getPixel(param1:Number = 0, param2:Number = 0) : uint
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this.game.arena.wall.getPixel32(x + param1,y + param2);
      }
      
      internal function frame1() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         stop();
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

