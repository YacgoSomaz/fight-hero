package
{
   import Playtomic.*;
   import flash.display.Shape;
   import flash.display.Sprite;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   
   public class Game extends Sprite
   {
      
      §§push(Game);
      if(37 == 34)
      {
         return;
      }
      
      private var main:Main;
      
      public var bg2:Bg;
      
      public var bg1:Bg;
      
      public var bgSky:BgSky;
      
      public var arena:Arena;
      
      private var mapParticles:Stats_MapParticles;
      
      public var physWorld:PhysWorld;
      
      public var hud:Hud;
      
      public var player:Player;
      
      public var units:Array;
      
      public var unitCont:Sprite;
      
      public var lineCont:Shape;
      
      public var killstreaks:Array;
      
      public var effects:Array;
      
      public var bullets:Array;
      
      public var matchSettings:MatchSettings;
      
      public var bitscreen:BitScreen;
      
      private var fc:uint = 0;
      
      public var aimer:Aimer;
      
      public var radar:Radar;
      
      public var water:Water;
      
      public var gameStarted:Boolean;
      
      public var gameEnded:Boolean;
      
      public var paused:Boolean;
      
      public function Game(param1:Main, param2:Object)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.main = param1;
         this.bgSky = new BgSky();
         addChild(this.bgSky);
         this.bg2 = new Bg();
         addChild(this.bg2);
         this.bg1 = new Bg();
         addChild(this.bg1);
         this.matchSettings = new MatchSettings(this);
         this.mapParticles = new Stats_MapParticles(this,MatchSettings.useMap.particles);
         this.physWorld = new PhysWorld(this);
         this.water = new Water(this);
         this.arena = new Arena(this);
         if(MatchSettings.useMap.song)
         {
            SH.playMusic(MatchSettings.useMap.song);
         }
      }
      
      public function InitGame(param1:*) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.arena = param1;
         addChild(this.arena);
         this.aimer = new Aimer();
         this.bitscreen = new BitScreen(this);
         addChild(this.bitscreen);
         this.unitCont = new Sprite();
         this.lineCont = new Shape();
         this.arena.midCont.addChild(this.unitCont);
         this.arena.midCont.addChild(this.lineCont);
         this.arena.midCont.addChild(this.physWorld);
         this.arena.midCont.addChild(this.water);
         this.effects = new Array();
         this.bullets = new Array();
         this.units = new Array();
         this.killstreaks = new Array();
         this.radar = new Radar(this,this.arena.wallMC);
         this.hud = new Hud(this);
         addChild(this.hud);
         this.hud.addChild(this.radar);
         this.player = new Player(this,MatchSettings.usePlayer);
         this.createUnit(this.player);
         var _loc2_:uint = 0;
         while(_loc2_ < MatchSettings.useBots.length)
         {
            this.createUnit(new AI(this,MatchSettings.useBots[_loc2_]));
            _loc2_++;
            if(2 == 3)
            {
               break;
            }
         }
         this.hud.addExp();
         if(MatchSettings.useMode == "jug")
         {
            UT.randEl(this.units).setJug();
         }
         addChild(this.aimer);
         this.matchSettings.Init();
         this.mapParticles.mapInit();
      }
      
      public function startGame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.gameStarted = true;
         this.paused = false;
      }
      
      public function endGame(param1:Boolean) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.gameEnded)
         {
            return;
         }
         this.gameEnded = true;
         this.hud.won = param1;
         this.hud.gotoAndPlay("end");
         if(MatchSettings.isCampaign)
         {
            Log.CustomMetric((MatchSettings.caType == 0 ? "Campaigns" : "Challenges") + " Played","Matches");
         }
         else
         {
            Log.CustomMetric("Quickmatches Played","Matches");
         }
         Log.CustomMetric(Stats_Classes.getClass(this.player.unitInfo.num).name + " Matches","Soldiers");
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         var _loc2_:uint = 0;
         var _loc3_:uint = 0;
         var _loc4_:uint = 0;
         var _loc5_:* = undefined;
         var _loc6_:* = undefined;
         if(this.paused)
         {
            this.hud.EnterFrame();
            return;
         }
         var _loc7_:Game = this;
         var _loc8_:Number = _loc7_.fc + 1;
         _loc7_.fc = _loc8_;
         if(Boolean(MatchSettings.useExtra.randomTeam) && this.fc % MatchSettings.useExtra.randomTeam == 0)
         {
            _loc1_ = 0;
            while(_loc1_ < 20)
            {
               _loc3_ = uint(UT.irand(1,this.units.length - 1));
               _loc4_ = uint(UT.irand(1,this.units.length - 1));
               _loc5_ = this.units[_loc3_];
               _loc6_ = this.units[_loc4_];
               this.units[_loc3_] = _loc6_;
               this.units[_loc4_] = _loc5_;
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
            _loc2_ = this.units.length * 0.5;
            _loc1_ = 1;
            while(_loc1_ < _loc2_)
            {
               this.units[_loc1_].changeTeam(1);
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
            _loc1_ = _loc2_;
            while(_loc1_ < this.units.length)
            {
               this.units[_loc1_].changeTeam(2);
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
            this.hud.setMsg(this.player,"Teams have been changed!");
         }
         if(MatchSettings.isCampaign)
         {
            Stats_Campaign.runScripts(this);
         }
         switch(MatchSettings.useMap.extra)
         {
            case "train":
               §§push(0);
               break;
            case "plane":
               §§push(1);
               break;
            default:
               §§push(2);
         }
         2;
         switch(§§pop())
         {
            case 0:
               if(this.fc % (30 * 2) == 0)
               {
                  this.arena.setShake(0,3);
               }
               break;
            case 1:
               if(this.fc % (30 * 0.5) == 0)
               {
                  this.arena.setShake(0,2);
               }
         }
         this.mapParticles.EnterFrame();
         this.arena.EnterFrame();
         this.physWorld.EnterFrame();
         this.lineCont.graphics.clear();
         this.bitscreen.EnterFrame();
         _loc1_ = 0;
         while(_loc1_ < this.killstreaks.length)
         {
            this.killstreaks[_loc1_].EnterFrame();
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         this.hud.EnterFrame();
         _loc1_ = 0;
         while(_loc1_ < this.units.length)
         {
            this.units[_loc1_].EnterFrame();
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         _loc1_ = 0;
         while(_loc1_ < this.arena.pickups.length)
         {
            this.arena.pickups[_loc1_].EnterFrame();
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         _loc1_ = 0;
         while(_loc1_ < this.bullets.length)
         {
            this.bullets[_loc1_].EnterFrame();
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         _loc1_ = 0;
         while(_loc1_ < this.bullets.length)
         {
            if(this.bullets[_loc1_].remove)
            {
               this.bullets.splice(_loc1_,1);
            }
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         _loc1_ = 0;
         while(_loc1_ < this.effects.length)
         {
            this.effects[_loc1_].EnterFrame();
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         _loc1_ = 0;
         while(_loc1_ < this.effects.length)
         {
            if(this.effects[_loc1_].remove)
            {
               this.effects.splice(_loc1_,1);
            }
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         this.matchSettings.EnterFrame();
         this.radar.EnterFrame();
         this.water.EnterFrame();
      }
      
      public function onScreen(param1:Number, param2:Number, param3:uint = 0) : Boolean
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc4_:Number = param1 + this.arena.x;
         var _loc5_:Number = param2 + this.arena.y;
         return _loc4_ > 0 - param3 && _loc4_ < Main.WIDTH + param3 && _loc5_ > 0 - param3 && _loc5_ < Main.HEIGHT + param3;
      }
      
      public function playScreenSound(param1:*, param2:Number, param3:Number, param4:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.onScreen(param2,param3))
         {
            SH.playSound(param1,param4);
         }
      }
      
      public function createEffect(param1:Number, param2:Number, param3:String, param4:String = "idle", param5:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!param5 && !this.onScreen(param1,param2,80))
         {
            return;
         }
         this.effects.push(new Effect(this,param1,param2,param3,param4,1));
      }
      
      public function createEffectAtFrame(param1:Number, param2:Number, param3:String, param4:String = "idle", param5:uint = 1, param6:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!param6 && !this.onScreen(param1,param2,80))
         {
            return;
         }
         this.effects.push(new Effect(this,param1,param2,param3,param4,param5));
      }
      
      public function createParticle(param1:Number, param2:Number, param3:String, param4:uint, param5:Object, param6:String, param7:String = "idle", param8:uint = 0, param9:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!param9 && !this.onScreen(param1,param2,300))
         {
            return;
         }
         this.effects.push(new Particle(this,param1,param2,param3,param4,param5,param6,param7,param8));
      }
      
      public function createUnit(param1:*, param2:Number = 0, param3:Number = 0) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(param2)
         {
            param1.x = param2;
         }
         if(param3)
         {
            param1.y = param3;
         }
         this.unitCont.addChild(param1);
         this.units.push(param1);
      }
      
      public function createKillstreak(param1:*, param2:String) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         switch(param2)
         {
            case "chopper":
               §§push(0);
               break;
            case "airstrike":
               §§push(1);
               break;
            case "radar":
               §§push(2);
               break;
            case "gas":
               §§push(3);
               break;
            default:
               §§push(4);
         }
         2;
         switch(§§pop())
         {
            case 0:
               this.killstreaks.push(new Killstreak_Helicopter(this,param1));
               SH.playSound(S_Heli,true);
               break;
            case 1:
               this.killstreaks.push(new Killstreak_Airstrike(this,param1));
               SH.playSound(S_Jet,true);
               break;
            case 2:
               this.killstreaks.push(new Killstreak_Radar(this,param1));
               SH.playSound(S_Radar,true);
               break;
            case 3:
               this.killstreaks.push(new Killstreak_Gas(this,param1));
               SH.playSound(S_Smoke,true);
         }
      }
      
      public function MouseDown() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.player.MouseDown();
         this.hud.MouseDown();
      }
      
      public function MouseUp() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.player.MouseUp();
         this.hud.MouseUp();
      }
      
      public function KeyDown(param1:KeyboardEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.player.KeyDown(param1);
      }
      
      public function KeyUp(param1:KeyboardEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.player.KeyUp(param1);
      }
      
      public function flashActivate() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      public function flashDeactivate() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!this.paused)
         {
            this.togglePause();
         }
         this.player.releaseKeys();
      }
      
      public function togglePause() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         if(!this.gameStarted || this.gameEnded)
         {
            return;
         }
         if(!this.paused)
         {
            this.paused = true;
            this.aimer.visible = false;
            _loc1_ = 0;
            while(_loc1_ < this.units.length)
            {
               this.units[_loc1_].MC.stop();
               this.units[_loc1_].MC.arm1.stop();
               this.units[_loc1_].MC.arm2.stop();
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
            this.hud.gotoAndStop("pause");
         }
         else
         {
            Main.STAGE.focus = Main.STAGE;
            this.paused = false;
            this.aimer.visible = true;
            _loc1_ = 0;
            while(_loc1_ < this.units.length)
            {
               this.units[_loc1_].MC.play();
               if(this.units[_loc1_].gun.curFrame != "idle")
               {
                  this.units[_loc1_].MC.arm1.play();
                  this.units[_loc1_].MC.arm2.play();
               }
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
            this.hud.gotoAndStop("idle");
         }
         SD.saveGame();
      }
      
      public function MouseWheel(param1:MouseEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.player.gun.swapGuns();
      }
      
      public function destroy() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.arena.destroy();
         this.physWorld.destroy();
         this.bitscreen.destroy();
         if(this.hud.won && MatchSettings.isCampaign && MatchSettings.caType == 1 && MatchSettings.caStage == 15)
         {
            Stats_Achievements.setAchievement("challenges");
         }
         if(Boolean(this.hud.won) && Boolean(MatchSettings.postCutFrames) && Boolean(MatchSettings.postCutFrames.length))
         {
            this.main.startClass(Cutscene,{"type":"post"});
         }
         else
         {
            this.main.startClass(Menu);
         }
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

