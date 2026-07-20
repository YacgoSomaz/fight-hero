package
{
   import flash.display.MovieClip;
   
   public class MatchSettings
   {
      
      public static var qmBotNames:Array;
      
      public static var qmMap:String;
      
      public static var qmMode:String;
      
      public static var qmSoldiers:int;
      
      public static var qmScore:uint;
      
      public static var qmMod:String;
      
      public static var qmSkills:Boolean;
      
      public static var qmStreaks:Boolean;
      
      public static var qmTeams:Boolean;
      
      public static var qmDiff:uint;
      
      public static var qmBots0:Array;
      
      public static var qmBots1:Array;
      
      public static var qmBots2:Array;
      
      public static var caStage:uint;
      
      public static var caType:uint;
      
      public static var caMap:String;
      
      public static var caMode:String;
      
      public static var caScore:uint;
      
      public static var caDiff:uint;
      
      public static var caSpecial:String;
      
      public static var caName:String;
      
      public static var caDesc:String;
      
      public static var caBots:Array;
      
      public static var caPlayer:Object;
      
      public static var preCutSong:*;
      
      public static var preCutFrames:Array;
      
      public static var postCutSong:*;
      
      public static var postCutFrames:Array;
      
      public static var useMap:Object;
      
      public static var useMode:String;
      
      public static var useSoldiers:int;
      
      public static var useScore:uint;
      
      public static var useMod:String;
      
      public static var useSkills:Boolean;
      
      public static var useStreaks:Boolean;
      
      public static var useBots:Array;
      
      public static var usePlayer:Object;
      
      public static var useTeams:Boolean;
      
      public static var useExtra:Object;
      
      public static var useSong:*;
      
      public static var isCampaign:Boolean;
      
      §§push(MatchSettings);
      if(37 == 34)
      {
         return;
      }
      
      private var game:Game;
      
      private var initiated:Boolean;
      
      private var team0:Array;
      
      private var team1:Array;
      
      private var team2:Array;
      
      public var team1score:int;
      
      public var team2score:int;
      
      private var fc:uint = 0;
      
      public function MatchSettings(param1:Game)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.game = param1;
      }
      
      public static function Init() : void
      {
         qmBotNames = [];
         qmBotNames.push("GameBuilder15","Mir","Thrax","R3taliate","Dovahkiin","Caboose","Stg Don","Sir","Jack Krauser","Theraze","Noobkiller","Chickitay","Supa4ourz","Vagueshade","Yours Truly","Bullish","Masterfish","Juice_Box","Sundalo37","Sgt. Sledge","Hurmboy","Captain Boehlke","DB2016");
         qmBotNames.push("Rising Legend","Standgrounding","Ec10125","Necro creed","Ecks2579","Vandroid X","legend2012","Cpt. Citrus","Dr. Ducko","Commandodude","xXNutron101Xx","The Operator","Roland","Malfurion","myguy25","Corporal Poy");
         qmBotNames.push("Sgt. Johnson");
         qmBotNames.push("J.A. Prufrock","J. Locke","J. Ramirez","M. McFly","P. North","S. Claus","T. Soprano","M. Corleone","C.F. Kane","J. Milton","A. Gold","N. Thompson","Pvt. Pile","N. Stark","J. McNulty","R. Hazuki","J.T. Kirk","Mischief","J. Matrix","J. Bond","J. Bourne","J. Bauer");
         qmBotNames.push("JoeyJ","Saint","Morde","Garen","Goldeneye","PeeWee","Bravo","Johnson","MrMatrix","Jeepers","Polly","Donut","Raze");
         qmBotNames.push("MaestroRage","WaterFlame","NemesisTheory","sonicmega");
         qmMap = "foundry";
         qmMode = "dm";
         qmTeams = 0;
         qmSoldiers = 0;
         qmScore = 10;
         qmMod = "none";
         qmSkills = true;
         qmStreaks = true;
         qmDiff = 1;
         qmBots0 = [];
         qmBots1 = [];
         qmBots2 = [];
      }
      
      public static function addBot(param1:uint) : void
      {
         var _loc4_:String = null;
         var _loc6_:uint = 0;
         var _loc2_:Array = MatchSettings["qmBots" + param1];
         var _loc3_:Boolean = false;
         while(!_loc3_)
         {
            _loc4_ = UT.randEl(qmBotNames);
            _loc3_ = true;
            _loc6_ = 0;
            while(_loc6_ < _loc2_.length)
            {
               if(_loc2_[_loc6_].name == _loc4_)
               {
                  _loc3_ = false;
               }
               _loc6_++;
            }
         }
         var _loc5_:Object = {
            "name":_loc4_,
            "skin":(param1 ? param1 + 1 : UT.irand(1,5)),
            "team":param1,
            "level":1,
            "extra":{}
         };
         _loc2_.push(_loc5_);
      }
      
      public static function remBot(param1:uint) : void
      {
         MatchSettings["qmBots" + param1].pop();
      }
      
      public static function setBotStats(param1:Object) : void
      {
         param1.diff = qmDiff;
         param1.level = Stats_Classes.getAiLevel(qmDiff);
         if(param1.level < 1)
         {
            param1.level = 1;
         }
         param1.soldier = useSoldiers ? useSoldiers : UT.irand(1,4);
         param1.primary = Stats_Guns.getRandPrimary(param1);
         param1.secondary = Stats_Guns.getRandSecondary(param1);
         param1._skill = Stats_Skills.getRandSkill(param1);
         param1._streak = Stats_Streaks.getRandStreak(param1);
      }
      
      public static function startQuickmatch() : void
      {
         isCampaign = false;
         useMap = Stats_Maps.getMap(MatchSettings.qmMap);
         useMode = qmMode;
         useSoldiers = qmSoldiers;
         useScore = qmScore;
         useMod = qmMod;
         useSkills = qmSkills;
         useStreaks = qmStreaks;
         useTeams = qmTeams;
         useExtra = {};
         postCutFrames = [];
         preCutFrames = [];
         postCutSong = null;
         preCutSong = null;
         if(useTeams)
         {
            useBots = qmBots1.concat(qmBots2);
         }
         else
         {
            useBots = qmBots0;
         }
         var _loc1_:uint = 0;
         while(_loc1_ < useBots.length)
         {
            setBotStats(useBots[_loc1_]);
            _loc1_++;
         }
         updatePlayer();
      }
      
      public static function startCampaign() : void
      {
         isCampaign = true;
         useMap = Stats_Maps.getMap(MatchSettings.caMap);
         useMode = caMode;
         useScore = caScore;
         useMod = "";
         useSkills = true;
         useStreaks = true;
         useTeams = Stats_Misc.getGameMode(useMode).teams == 2;
         useBots = caBots;
         if(caPlayer.soldier)
         {
            useSoldiers = caPlayer.soldier;
         }
         else
         {
            useSoldiers = 0;
         }
         updatePlayer();
      }
      
      public static function updatePlayer() : void
      {
         var _loc1_:uint = 0;
         if(isCampaign)
         {
            usePlayer = {};
            usePlayer.name = caPlayer.name ? caPlayer.name : SD.name;
            usePlayer.soldier = caPlayer.soldier ? caPlayer.soldier : SD.selClass;
            usePlayer.skin = caPlayer.skin ? caPlayer.skin : SD.classSaves[usePlayer.soldier].skin;
            usePlayer.team = caPlayer.team;
            usePlayer._skill = caPlayer._skill ? caPlayer._skill : SD.classSaves[usePlayer.soldier].skill;
            usePlayer._streak = caPlayer._streak ? caPlayer._streak : SD.classSaves[usePlayer.soldier].streak;
            usePlayer.primary = caPlayer.primary ? caPlayer.primary : SD.classSaves[usePlayer.soldier].primary;
            usePlayer.secondary = caPlayer.secondary ? caPlayer.secondary : SD.classSaves[usePlayer.soldier].secondary;
            usePlayer.level = SD.classSaves[usePlayer.soldier].level;
            usePlayer.extra = caPlayer.extra;
         }
         else
         {
            _loc1_ = useSoldiers ? uint(useSoldiers) : SD.selClass;
            usePlayer = {};
            usePlayer.name = SD.name;
            usePlayer.soldier = _loc1_;
            usePlayer.skin = qmTeams ? 2 : SD.classSaves[_loc1_].skin;
            usePlayer.team = useTeams ? 1 : 0;
            usePlayer._skill = SD.classSaves[_loc1_].skill;
            usePlayer._streak = SD.classSaves[_loc1_].streak;
            usePlayer.primary = SD.classSaves[_loc1_].primary;
            usePlayer.secondary = SD.classSaves[_loc1_].secondary;
            usePlayer.level = SD.classSaves[_loc1_].level;
            usePlayer.extra = {};
         }
         usePlayer.diff = 10;
      }
      
      public function Init() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         this.initiated = true;
         if(!MatchSettings.useTeams)
         {
            this.team0 = this.game.units.concat();
            this.game.hud.setScoreBar(this.game.player.team,this.game.player.pscore,this.game.units[1].team,this.game.units[1].pscore);
         }
         else
         {
            this.team1 = [];
            this.team2 = [];
            _loc1_ = 0;
            while(_loc1_ < this.game.units.length)
            {
               this["team" + this.game.units[_loc1_].team].push(this.game.units[_loc1_]);
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
            this.game.hud.setScoreBar(1,0,2,0);
         }
         this.updateScores();
      }
      
      public function EnterFrame() : void
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
         if(MatchSettings.useMode == "dom" && this.fc % (30 * 3) == 0)
         {
            _loc1_ = 0;
            while(_loc1_ < this.game.arena.holdpoints.length)
            {
               if(this.game.arena.holdpoints[_loc1_].curTeam)
               {
                  _loc2_ = this.game.arena.holdpoints[_loc1_].unitCaptured;
                  _loc3_ = _loc2_.pscore + 1;
                  _loc2_.pscore = _loc3_;
               }
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
            this.updateScores();
         }
      }
      
      public function updateScores() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:uint = 0;
         if(!this.initiated)
         {
            return;
         }
         var _loc1_:* = null;
         switch(useMode)
         {
            case "dm":
               §§push(0);
               break;
            case "zom":
               §§push(1);
               break;
            case "jug":
               §§push(2);
               break;
            case "tdm":
               §§push(3);
               break;
            case "dom":
               §§push(4);
               break;
            case "ctf":
               §§push(5);
               break;
            default:
               §§push(6);
         }
         2;
         switch(§§pop())
         {
            case 0:
            case 1:
            case 2:
               _loc2_ = 0;
               while(_loc2_ < this.team0.length)
               {
                  if(!this.team0[_loc2_].human && (!_loc1_ || this.team0[_loc2_].pscore > _loc1_.pscore))
                  {
                     _loc1_ = this.team0[_loc2_];
                  }
                  if(this.team0[_loc2_].pscore >= useScore)
                  {
                     this.team0[_loc2_].pscore = useScore;
                     this.game.endGame(this.team0[_loc2_].human);
                  }
                  _loc2_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.game.hud.setScoreBar(this.game.player.team,this.game.player.pscore,_loc1_.team,_loc1_.pscore);
               break;
            case 3:
            case 4:
            case 5:
               this.team1.sortOn("pscore",Array.NUMERIC | Array.DESCENDING);
               this.team2.sortOn("pscore",Array.NUMERIC | Array.DESCENDING);
               this.team1score = 0;
               _loc2_ = 0;
               while(_loc2_ < this.team1.length)
               {
                  this.team1score += this.team1[_loc2_].pscore;
                  _loc2_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.team2score = 0;
               _loc2_ = 0;
               while(_loc2_ < this.team2.length)
               {
                  this.team2score += this.team2[_loc2_].pscore;
                  _loc2_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               if(this.team1score >= useScore)
               {
                  this.team1score = useScore;
                  this.game.endGame(true);
               }
               else if(this.team2score >= useScore)
               {
                  this.team2score = useScore;
                  this.game.endGame(false);
               }
               this.game.hud.setScoreBar(1,this.team1score,2,this.team2score);
         }
      }
      
      public function showScores(param1:MovieClip) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:uint = 0;
         var _loc4_:uint = 0;
         var _loc5_:uint = 0;
         var _loc2_:Number = 0;
         param1.addChild(new ScoreBar(_loc2_,null,"top"));
         if(!useTeams)
         {
            this.team0.sortOn("pscore",Array.NUMERIC | Array.DESCENDING);
            _loc3_ = 0;
            while(_loc3_ < this.team0.length)
            {
               if(!this.team0[_loc3_].unitInfo.extra.noSpawn)
               {
                  param1.addChild(new ScoreBar(_loc2_ = _loc2_ + 20,this.team0[_loc3_]));
               }
               _loc3_++;
               if(2 == 3)
               {
                  break;
               }
            }
         }
         else
         {
            this.team1.sortOn("pscore",Array.NUMERIC | Array.DESCENDING);
            this.team2.sortOn("pscore",Array.NUMERIC | Array.DESCENDING);
            this.team1score = 0;
            _loc3_ = 0;
            while(_loc3_ < this.team1.length)
            {
               this.team1score += this.team1[_loc3_].pscore;
               _loc3_++;
               if(2 == 3)
               {
                  break;
               }
            }
            this.team2score = 0;
            _loc3_ = 0;
            while(_loc3_ < this.team2.length)
            {
               this.team2score += this.team2[_loc3_].pscore;
               _loc3_++;
               if(2 == 3)
               {
                  break;
               }
            }
            if(this.team1score > useScore)
            {
               this.team1score = useScore;
            }
            if(this.team2score > useScore)
            {
               this.team2score = useScore;
            }
            if(this.team1score >= this.team2score)
            {
               _loc4_ = 1;
               _loc5_ = 2;
            }
            else
            {
               _loc4_ = 2;
               _loc5_ = 1;
            }
            param1.addChild(new ScoreBar(_loc2_ = _loc2_ + 20,null,"team" + _loc4_ + "_player",(_loc4_ == 1 ? "Blue" : "Orange") + " Team",this["team" + _loc4_ + "score"]));
            _loc3_ = 0;
            while(_loc3_ < this["team" + _loc4_].length)
            {
               if(!this["team" + _loc4_][_loc3_].unitInfo.extra.noSpawn)
               {
                  param1.addChild(new ScoreBar(_loc2_ = _loc2_ + 20,this["team" + _loc4_][_loc3_]));
               }
               _loc3_++;
               if(2 == 3)
               {
                  break;
               }
            }
            param1.addChild(new ScoreBar(_loc2_ = _loc2_ + 20,null,"team" + _loc5_ + "_player",(_loc5_ == 1 ? "Blue" : "Orange") + " Team",this["team" + _loc5_ + "score"]));
            _loc3_ = 0;
            while(_loc3_ < this["team" + _loc5_].length)
            {
               if(!this["team" + _loc5_][_loc3_].unitInfo.extra.noSpawn)
               {
                  param1.addChild(new ScoreBar(_loc2_ = _loc2_ + 20,this["team" + _loc5_][_loc3_]));
               }
               _loc3_++;
               if(2 == 3)
               {
                  break;
               }
            }
         }
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

