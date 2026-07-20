package
{
   import fl.controls.CheckBox;
   import fl.controls.RadioButton;
   import flash.display.MovieClip;
   import flash.text.TextField;
   import flash.text.TextFormat;
   import flash.utils.Dictionary;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol1540")]
   public class Hud extends MovieClip
   {
      
      §§push(Hud);
      if(37 == 34)
      {
         return;
      }
      
      public var cc1:MovieClip;
      
      public var rd_qualM:RadioButton;
      
      public var cc2:MovieClip;
      
      public var txt_changeclass:TextField;
      
      public var txt_respawn:TextField;
      
      public var txt_flags:TextField;
      
      public var icon:MovieClip;
      
      public var logo1:MovieClip;
      
      public var cb_voices:CheckBox;
      
      public var rd_bloodH:RadioButton;
      
      public var rd_qualL:RadioButton;
      
      public var debug:MovieClip;
      
      public var cc3:MovieClip;
      
      public var txt_nextsong:TextField;
      
      public var txt_streakready:TextField;
      
      public var txt_classname:TextField;
      
      public var logo2:MovieClip;
      
      public var cc4:MovieClip;
      
      public var mc_streak:MovieClip;
      
      public var bulletCont:MovieClip;
      
      public var rd_partM:RadioButton;
      
      public var txt_ammo:TextField;
      
      public var cb_sound:CheckBox;
      
      public var txt_quit:TextField;
      
      public var rd_partL:RadioButton;
      
      public var flag1:MovieClip;
      
      public var rd_qualH:RadioButton;
      
      public var flag2:MovieClip;
      
      public var txt_feed:TextField;
      
      public var bloodyscreen:MovieClip;
      
      public var flag3:MovieClip;
      
      public var nextgun:MovieClip;
      
      public var txt_win:TextField;
      
      public var expholder:MovieClip;
      
      public var rd_partH:RadioButton;
      
      public var mc_streakarrow:DownArrow;
      
      public var cb_light:CheckBox;
      
      public var mc_speak:MovieClip;
      
      public var mc_skill:MovieClip;
      
      public var txt_curgun:TextField;
      
      public var curgun:MovieClip;
      
      public var txt_hp:TextField;
      
      public var cb_music:CheckBox;
      
      public var scorebar:MovieClip;
      
      public var txt_level:TextField;
      
      public var barCont:MovieClip;
      
      public var txt_streaknum:TextField;
      
      public var rd_bloodL:RadioButton;
      
      public var txt_resume:TextField;
      
      public var cb_bloody:CheckBox;
      
      public var txt_song:TextField;
      
      public var rd_bloodM:RadioButton;
      
      public var cb_shake:CheckBox;
      
      public var __setPropDict:Dictionary;
      
      private var game:Game;
      
      private var classChange:Boolean;
      
      private var pauseButs:Array;
      
      public var won:Boolean;
      
      public var msgForce:Boolean;
      
      public var msgTimer:uint;
      
      public var respawnTimer:uint;
      
      private var feeds:Array;
      
      private var txtFmt:TextFormat;
      
      private var curSong:*;
      
      public function Hud(param1:Game)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.__setPropDict = new Dictionary(true);
         super();
         addFrameScript(14,this.frame15,73,this.frame74,103,this.frame104,104,this.frame105,254,this.frame255);
         this.game = param1;
         var _loc2_:uint = 1;
         while(_loc2_ <= 4)
         {
            this["cc" + _loc2_].gotoAndStop(Stats_Classes.getClass(_loc2_).icon);
            _loc2_++;
            if(2 == 3)
            {
               break;
            }
         }
         gotoAndPlay("start");
         this.reset();
         this.scorebar.modetxt.text = Stats_Misc.getGameMode(MatchSettings.useMode).name;
         this.feeds = [];
         this.txtFmt = new TextFormat();
         this.processFeed();
         if(MatchSettings.useMode == "dom")
         {
            this.flag1.txt_letter.text = "A";
            this.flag2.txt_letter.text = "B";
            this.flag3.txt_letter.text = "C";
         }
         else if(MatchSettings.useMode == "ctf")
         {
            this.flag2.visible = false;
            this.flag1.gotoAndStop(this.game.arena.flag1.team * 5);
            this.flag3.gotoAndStop(this.game.arena.flag2.team * 5);
            this.flag1.txt_letter.text = "";
            this.flag3.txt_letter.text = "";
         }
         else
         {
            this.flag1.visible = false;
            this.flag2.visible = false;
            this.flag3.visible = false;
         }
         this.txt_flags.text = "";
         if(!MatchSettings.isCampaign && Boolean(SH.songList.length))
         {
            this.curSong = UT.randEl(SH.songList);
            SH.playMusic(this.curSong);
            this.txt_song.alpha = 0.5;
            this.txt_nextsong.alpha = 0.5;
            this.txt_song.text = "Song: " + SH.songNames[SH.songList.indexOf(this.curSong)];
         }
         else
         {
            this.txt_song.visible = false;
            this.txt_nextsong.visible = false;
         }
         if(MatchSettings.isCampaign && Boolean(MatchSettings.useSong))
         {
            SH.playMusic(MatchSettings.useSong);
         }
         this.mc_streakarrow.visible = false;
      }
      
      public function reset() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.txt_respawn.text = "";
         this.setClassChange();
      }
      
      public function setClassChange(param1:* = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.classChange = param1;
         this.txt_changeclass.visible = this.classChange;
         var _loc2_:uint = 1;
         while(_loc2_ <= 4)
         {
            this["cc" + _loc2_].visible = this.classChange;
            _loc2_++;
            if(2 == 3)
            {
               break;
            }
         }
      }
      
      public function setGuns(param1:Stats_Guns, param2:Stats_Guns) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.txt_curgun.text = param1.name;
         this.curgun.gotoAndStop(param1.sprite);
         this.nextgun.gotoAndStop(param2.sprite);
      }
      
      public function addExp(param1:uint = 0) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:uint = 0;
         if(!this.game.player)
         {
            return;
         }
         SD.classSaves[this.game.player.unitInfo.num].funds += param1;
         if(SD.classSaves[this.game.player.unitInfo.num].level == 50)
         {
            this.expholder.bar_exp.width = 420;
            this.expholder.txt_exp.text = "Level Maxed";
            Stats_Achievements.setAchievement("level50");
            return;
         }
         SD.classSaves[this.game.player.unitInfo.num].exp += param1;
         this.expholder.bar_exp.width = SD.classSaves[this.game.player.unitInfo.num].exp / Stats_Classes.getNextExp(SD.classSaves[this.game.player.unitInfo.num].level) * 420;
         this.expholder.txt_exp.text = "Exp " + SD.classSaves[this.game.player.unitInfo.num].exp + " / " + Stats_Classes.getNextExp(SD.classSaves[this.game.player.unitInfo.num].level);
         if(SD.classSaves[this.game.player.unitInfo.num].exp >= Stats_Classes.getNextExp(SD.classSaves[this.game.player.unitInfo.num].level))
         {
            SD.classSaves[this.game.player.unitInfo.num].exp = 0;
            var _loc3_:* = SD.classSaves[this.game.player.unitInfo.num];
            var _loc4_:Number = _loc3_.level + 1;
            _loc3_.level = _loc4_;
            SH.playSound(S_Powerup,true);
            SH.playSound(S_rocketExplode);
            this.game.arena.setShake(10,10);
            _loc2_ = 0;
            while(_loc2_ < 20)
            {
               this.game.createParticle(this.game.player.x + UT.rand(-10,10),this.game.player.y + UT.rand(-40,0),"spark",20,{
                  "xSpd":UT.rand(-5,5),
                  "ySpd":UT.rand(-8,-3)
               },"ember");
               _loc2_++;
               if(2 == 3)
               {
                  break;
               }
            }
            this.game.createEffect(this.game.player.x,this.game.player.y - 100,"levelup","idle",true);
            this.game.createParticle(this.game.player.x,this.game.player.y - 60,"slowText",0,null,"bigText","levelup");
            this.addCustomFeed(this.game.player,"levelup");
            this.txt_level.text = "lvl: " + SD.classSaves[this.game.player.unitInfo.num].level;
            this.game.player.txt_level.text = SD.classSaves[this.game.player.unitInfo.num].level;
            this.game.hud.setRespawnText("Level up!" + Stats_Classes.getLevelUnlock(SD.classSaves[this.game.player.unitInfo.num].level,this.game.player.unitInfo.num),16776960);
            this.addExp(0);
         }
      }
      
      public function setAmmoImage(param1:uint, param2:uint, param3:String, param4:uint = 0) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc5_:Number = NaN;
         var _loc6_:uint = 0;
         this.bulletCont.graphics.clear();
         switch(param3)
         {
            case "pistol":
               §§push(0);
               break;
            case "magnum":
               §§push(1);
               break;
            case "arifle":
               §§push(2);
               break;
            case "sniper":
               §§push(3);
               break;
            case "shotgun":
               §§push(4);
               break;
            case "rocket":
               §§push(5);
               break;
            case "machine":
               §§push(6);
               break;
            default:
               §§push(7);
         }
         2;
         switch(§§pop())
         {
            case 0:
               _loc6_ = 0;
               while(_loc6_ < param2)
               {
                  this.drawBox(_loc6_,2,2,6,param1 > _loc6_);
                  _loc6_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               break;
            case 1:
               _loc6_ = 0;
               while(_loc6_ < param2)
               {
                  this.drawBox(_loc6_,3,3,7,param1 > _loc6_);
                  _loc6_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               break;
            case 2:
               _loc6_ = 0;
               while(_loc6_ < param2)
               {
                  this.drawBox(_loc6_,2,2,10,param1 > _loc6_);
                  _loc6_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               break;
            case 3:
               _loc6_ = 0;
               while(_loc6_ < param2)
               {
                  this.drawBox(_loc6_,3,20,5,param1 > _loc6_);
                  _loc6_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               break;
            case 4:
               _loc6_ = 0;
               while(_loc6_ < param2)
               {
                  this.drawBox(_loc6_,2,5,8,param1 > _loc6_);
                  _loc6_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               break;
            case 5:
               _loc6_ = 0;
               while(_loc6_ < param2)
               {
                  this.drawBox(_loc6_,3,7,12,param1 > _loc6_);
                  _loc6_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               break;
            case 6:
               _loc5_ = param1 - param2 / 2;
               if(_loc5_ < 0)
               {
                  _loc5_ = 0;
               }
               param1 -= _loc5_;
               _loc6_ = 0;
               while(_loc6_ < param2 / 2)
               {
                  this.drawBox(_loc6_,2,2,5,param1 > _loc6_);
                  _loc6_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               _loc6_ = 0;
               while(_loc6_ < param2 / 2)
               {
                  this.drawBox(_loc6_,2,2,5,_loc5_ > _loc6_,7);
                  _loc6_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
         }
         this.txt_ammo.text = "" + param4;
      }
      
      public function drawBox(param1:Number, param2:Number, param3:Number, param4:Number, param5:Boolean, param6:Number = 0) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc7_:Number = param1 * (param2 + param3);
         this.bulletCont.graphics.lineStyle(0.5,16777215,param5 ? 1 : 0.4);
         this.bulletCont.graphics.beginFill(16777215,param5 ? 1 : 0.2);
         this.bulletCont.graphics.moveTo(_loc7_,param6);
         this.bulletCont.graphics.lineTo(_loc7_ + param3,param6);
         this.bulletCont.graphics.lineTo(_loc7_ + param3,param6 + param4);
         this.bulletCont.graphics.lineTo(_loc7_,param6 + param4);
         this.bulletCont.graphics.lineTo(_loc7_,param6);
         this.bulletCont.graphics.endFill();
      }
      
      public function InitPause() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.pauseButs = [this.rd_qualL,this.rd_qualM,this.rd_qualH,this.rd_partL,this.rd_partM,this.rd_partH,this.cb_light,this.cb_music,this.cb_sound,this.cb_voices,this.cb_shake,this.cb_bloody,this.rd_bloodL,this.rd_bloodM,this.rd_bloodH];
         if(SD.graphQual == 0)
         {
            this.rd_qualL.selected = true;
         }
         if(SD.graphQual == 1)
         {
            this.rd_qualM.selected = true;
         }
         if(SD.graphQual == 2)
         {
            this.rd_qualH.selected = true;
         }
         if(SD.graphPart == 0)
         {
            this.rd_partL.selected = true;
         }
         if(SD.graphPart == 1)
         {
            this.rd_partM.selected = true;
         }
         if(SD.graphPart == 2)
         {
            this.rd_partH.selected = true;
         }
         this.cb_light.selected = SD.graphLights;
         this.cb_music.selected = SD.music;
         this.cb_sound.selected = SD.sound;
         this.cb_voices.selected = SD.voices;
         this.cb_shake.selected = SD.screenShake;
         this.cb_bloody.selected = SD.screenBlood;
         if(SD.blood == 0)
         {
            this.rd_bloodL.selected = true;
         }
         if(SD.blood == 1)
         {
            this.rd_bloodM.selected = true;
         }
         if(SD.blood == 2)
         {
            this.rd_bloodH.selected = true;
         }
         this.game.matchSettings.showScores(this.barCont);
      }
      
      public function InitEnd() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.txt_respawn.text = "";
         this.txt_win.text = this.won ? "Victory" : "Defeat";
         this.txt_win.textColor = this.won ? 13434879 : 16764057;
         this.game.matchSettings.showScores(this.barCont);
         if(MatchSettings.isCampaign && this.won)
         {
            if(MatchSettings.caType == 0 && MatchSettings.caStage == SD.curCampaign && MatchSettings.caStage < 15)
            {
               var _temp_4:* = SD;
               var _loc1_:SD = SD;
               var _loc2_:Number = _loc1_.curCampaign + 1;
               _loc1_.curCampaign = _loc2_;
            }
            if(MatchSettings.caType == 1 && MatchSettings.caStage == SD.curChallenge && MatchSettings.caStage < 15)
            {
               _loc1_ = SD;
               _loc2_ = _loc1_.curChallenge + 1;
               _loc1_.curChallenge = _loc2_;
            }
         }
         SD.saveGame();
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
         if(this.curSong)
         {
            this.txt_nextsong.alpha = this.txt_nextsong.hitTestPoint(mouseX,mouseY,false) ? 1 : 0.5;
         }
         if(this.game.paused)
         {
            this.txt_resume.alpha = this.txt_resume.hitTestPoint(mouseX,mouseY,false) ? 1 : 0.5;
            this.txt_quit.alpha = this.txt_quit.hitTestPoint(mouseX,mouseY,false) ? 1 : 0.5;
            SD.setLogos(this.logo1,this.logo2);
            return;
         }
         if(this.classChange)
         {
            _loc1_ = 1;
            while(_loc1_ <= 4)
            {
               if(_loc1_ == SD.selClass)
               {
                  this["cc" + _loc1_].alpha = 1;
               }
               else if(this["cc" + _loc1_].hitTestPoint(this.game.mouseX,this.game.mouseY,false))
               {
                  this["cc" + _loc1_].alpha = 0.6;
               }
               else
               {
                  this["cc" + _loc1_].alpha = 0.3;
               }
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
         }
         if(this.msgTimer == 1)
         {
            this.mc_speak.gotoAndPlay("close");
            this.msgForce = false;
         }
         if(this.msgTimer)
         {
            var _loc3_:* = this;
            var _loc4_:Number = _loc3_.msgTimer - 1;
            _loc3_.msgTimer = _loc4_;
         }
         if(this.respawnTimer == 1)
         {
            this.txt_respawn.text = "";
         }
         if(this.respawnTimer)
         {
            _loc3_ = this;
            _loc4_ = _loc3_.respawnTimer - 1;
            _loc3_.respawnTimer = _loc4_;
         }
         _loc1_ = 0;
         while(_loc1_ < this.feeds.length)
         {
            _loc3_ = this.feeds[_loc1_];
            _loc4_ = _loc3_.timer - 1;
            _loc3_.timer = _loc4_;
            if(!this.feeds[_loc1_].timer)
            {
               this.feeds.pop();
               this.processFeed();
            }
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         if(MatchSettings.useMode == "dom")
         {
            _loc2_ = 0;
            _loc1_ = 0;
            while(_loc1_ < this.game.arena.holdpoints.length)
            {
               if(this.game.arena.holdpoints[_loc1_].curTeam == 1)
               {
                  _loc2_++;
               }
               this["flag" + (_loc1_ + 1)].gotoAndStop(this.game.arena.holdpoints[_loc1_].curTeam + 1);
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
            this.txt_flags.text = _loc2_ + " point" + (_loc2_ != 1 ? "s" : "") + " per 3 sec";
         }
         else if(MatchSettings.useMode == "ctf")
         {
            this.txt_flags.text = "";
            if(this.game.arena.flag1.unitCaptured)
            {
               this.flag1.gotoAndStop(this.game.arena.flag1.team * 5 + 1);
               this.flag1.txt_letter.text = this.game.arena.flag1.team == 1 ? "?" : "!";
               if(this.game.arena.flag1.team == 1)
               {
                  this.txt_flags.text = "Your flag is taken!";
               }
            }
            else
            {
               this.flag1.gotoAndStop(this.game.arena.flag1.team * 5);
               this.flag1.txt_letter.text = "";
            }
            if(this.game.arena.flag2.unitCaptured)
            {
               this.flag3.gotoAndStop(this.game.arena.flag2.team * 5 + 1);
               this.flag3.txt_letter.text = this.game.arena.flag2.team == 1 ? "?" : "!";
               if(this.game.arena.flag2.team == 1)
               {
                  this.txt_flags.text = "Your flag is taken!";
               }
            }
            else
            {
               this.flag3.gotoAndStop(this.game.arena.flag2.team * 5);
               this.flag3.txt_letter.text = "";
            }
         }
      }
      
      public function EndGame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.game.destroy();
      }
      
      public function MouseUp() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!this.game.paused)
         {
            return;
         }
         var _loc1_:uint = 0;
         while(_loc1_ < this.pauseButs.length)
         {
            this.pauseButs[_loc1_].enabled = true;
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
      }
      
      public function MouseDown() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         if(this.game.paused)
         {
            _loc1_ = 0;
            do
            {
               if(_loc1_ >= this.pauseButs.length)
               {
                  break;
               }
               if(!this.pauseButs[_loc1_].hitTestPoint(mouseX,mouseY,false))
               {
                  continue;
               }
               if(this.pauseButs[_loc1_].name.charAt(0) == "r")
               {
                  this.pauseButs[_loc1_].selected = true;
               }
               else
               {
                  this.pauseButs[_loc1_].enabled = false;
                  this.pauseButs[_loc1_].selected = !this.pauseButs[_loc1_].selected;
               }
               switch(this.pauseButs[_loc1_].name)
               {
                  case "rd_qualL":
                     §§push(0);
                     break;
                  case "rd_qualM":
                     §§push(1);
                     break;
                  case "rd_qualH":
                     §§push(2);
                     break;
                  case "rd_partL":
                     §§push(3);
                     break;
                  case "rd_partM":
                     §§push(4);
                     break;
                  case "rd_partH":
                     §§push(5);
                     break;
                  case "cb_light":
                     §§push(6);
                     break;
                  case "cb_music":
                     §§push(7);
                     break;
                  case "cb_sound":
                     §§push(8);
                     break;
                  case "cb_voices":
                     §§push(9);
                     break;
                  case "cb_shake":
                     §§push(10);
                     break;
                  case "cb_bloody":
                     §§push(11);
                     break;
                  case "rd_bloodL":
                     §§push(12);
                     break;
                  case "rd_bloodM":
                     §§push(13);
                     break;
                  case "rd_bloodH":
                     §§push(14);
                     break;
                  default:
                     §§push(15);
               }
               2;
               switch(§§pop())
               {
                  case 0:
                     SD.graphQual = 0;
                     Main.STAGE.quality = "low";
                     break;
                  case 1:
                     SD.graphQual = 1;
                     Main.STAGE.quality = "medium";
                     break;
                  case 2:
                     SD.graphQual = 2;
                     Main.STAGE.quality = "high";
                     break;
                  case 3:
                     SD.graphPart = 0;
                     break;
                  case 4:
                     SD.graphPart = 1;
                     break;
                  case 5:
                     SD.graphPart = 2;
                     break;
                  case 6:
                     SD.graphLights = this.cb_light.selected;
                     this.game.arena.toggleLights();
                     break;
                  case 7:
                     SD.music = this.cb_music.selected;
                     break;
                  case 8:
                     SD.sound = this.cb_sound.selected;
                     break;
                  case 9:
                     SD.voices = this.cb_voices.selected;
                     break;
                  case 10:
                     SD.screenShake = this.cb_shake.selected;
                     break;
                  case 11:
                     SD.screenBlood = this.cb_bloody.selected;
                     this.bloodyscreen.gotoAndStop(SD.screenBlood ? 1 : 2);
                     break;
                  case 12:
                     SD.blood = 0;
                     break;
                  case 13:
                     SD.blood = 1;
                     break;
                  case 14:
                     SD.blood = 2;
               }
            }
            while(_loc1_++, 2 != 3);
            if(this.txt_resume.hitTestPoint(this.game.mouseX,this.game.mouseY,false))
            {
               if(this.txt_resume.text == "Resume")
               {
                  this.game.togglePause();
               }
               else if(this.txt_resume.text == "Confirm Quit")
               {
                  this.game.destroy();
               }
            }
            else if(this.txt_quit.hitTestPoint(this.game.mouseX,this.game.mouseY,false))
            {
               if(this.txt_quit.text == "Quit")
               {
                  this.txt_resume.text = "Confirm Quit";
                  this.txt_quit.text = "Cancel";
               }
               else if(this.txt_quit.text == "Cancel")
               {
                  this.txt_resume.text = "Resume";
                  this.txt_quit.text = "Quit";
               }
            }
            SD.pressLogos(this,this.logo1,this.logo2);
            return;
         }
         if(this.classChange)
         {
            _loc1_ = 1;
            while(_loc1_ <= 4)
            {
               if(this["cc" + _loc1_].hitTestPoint(this.game.mouseX,this.game.mouseY,false))
               {
                  SD.selClass = _loc1_;
               }
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
         }
         if(Boolean(this.curSong) && this.txt_nextsong.hitTestPoint(mouseX,mouseY,false))
         {
            this.curSong = UT.getNextEl(this.curSong,true,SH.songList);
            SH.playMusic(this.curSong);
            this.txt_song.text = "Song: " + SH.songNames[SH.songList.indexOf(this.curSong)];
         }
      }
      
      public function setScoreBar(param1:int, param2:int, param3:int, param4:int) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.scorebar.scorebar1.barfade.gotoAndStop(param1 + (param1 == 0 ? 1 : 2));
         this.scorebar.scorebar1.bar.gotoAndStop(param1 + (param1 == 0 ? 1 : 2));
         this.scorebar.scorebar2.barfade.gotoAndStop(param3 + 2);
         this.scorebar.scorebar2.bar.gotoAndStop(param3 + 2);
         this.scorebar.scorebar1.bar.width = param2 / MatchSettings.useScore * 125;
         this.scorebar.scorebar2.bar.width = param4 / MatchSettings.useScore * 125;
         this.scorebar.scorebar1.cap.x = this.scorebar.scorebar1.bar.x + this.scorebar.scorebar1.bar.width;
         this.scorebar.scorebar2.cap.x = this.scorebar.scorebar2.bar.x + this.scorebar.scorebar2.bar.width;
         this.scorebar.scoretxt1.text = "> " + param2;
         this.scorebar.scoretxt2.text = "" + param4;
      }
      
      public function startGame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.game.startGame();
      }
      
      public function setRespawnText(param1:String, param2:uint = 16777215) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.txt_respawn.text = param1;
         this.txt_respawn.textColor = param2;
         this.respawnTimer = 3 * 30;
      }
      
      public function setMsg(param1:*, param2:String, param3:uint = 4, param4:Boolean = false, param5:* = null) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.msgForce && !param4)
         {
            return;
         }
         this.mc_speak.gotoAndPlay("open");
         this.mc_speak.head.gotoAndStop(param1.unitInfo.frame);
         this.mc_speak.txt_name.text = param1.name;
         this.mc_speak.txt_desc.text = param2;
         this.msgForce = param4;
         this.msgTimer = param3 * 30;
         if(param5)
         {
            SH.playVoice(param5);
         }
      }
      
      public function setCharMsg(param1:String, param2:uint, param3:String, param4:String, param5:uint = 4, param6:Boolean = false, param7:* = null) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.msgForce && !param6)
         {
            return;
         }
         this.mc_speak.gotoAndPlay("open");
         this.mc_speak.head.gotoAndStop(Stats_Classes.getClass(Stats_Classes.classNums.indexOf(param1)).startFrame + param2);
         this.mc_speak.txt_name.text = param3;
         this.mc_speak.txt_desc.text = param4;
         this.msgForce = param6;
         this.msgTimer = param5 * 30;
         if(param7)
         {
            SH.playVoice(param7);
         }
      }
      
      public function setMsgRandomTeammate(param1:uint, param2:String) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:* = undefined;
         var _loc4_:* = 0;
         do
         {
            _loc3_ = UT.randEl(this.game.units);
            if(++_loc4_ == 20)
            {
               _loc3_ = this.game.player;
               break;
            }
         }
         while(_loc3_.team != param1 || _loc3_ == this.game.player);
         this.setMsg(_loc3_,param2,5);
      }
      
      public function addCustomFeed(param1:*, param2:String) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         switch(param2)
         {
            case "levelup":
               §§push(0);
               break;
            case "flag":
               §§push(1);
               break;
            case "jug":
               §§push(2);
               break;
            case "holdpoint":
               §§push(3);
               break;
            default:
               §§push(4);
         }
         2;
         switch(§§pop())
         {
            case 0:
               this.feeds.unshift({
                  "txt":[param1.name," has LEVELED UP"],
                  "col":[this.getUnitColour(param1),16776960],
                  "timer":90
               });
               break;
            case 1:
               this.feeds.unshift({
                  "txt":[param1.name + " has captured " + (param1.team == 1 ? "the enemy" : "your") + " flag!"],
                  "col":[this.getUnitColour(param1)],
                  "timer":90
               });
               break;
            case 2:
               this.feeds.unshift({
                  "txt":[param1.name + " has become the Juggernaut!"],
                  "col":[this.getUnitColour(param1)],
                  "timer":90
               });
               break;
            case 3:
               this.feeds.unshift({
                  "txt":[(param1.team == 1 ? "An enemy" : "Your") + " point has been captured!"],
                  "col":[this.getUnitColour(param1)],
                  "timer":90
               });
         }
         this.processFeed();
      }
      
      public function addKillstreakFeed(param1:*, param2:Stats_Streaks) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.feeds.unshift({
            "txt":[param1.name," used killstreak ",param2.name],
            "col":[this.getUnitColour(param1),13421772,13434879],
            "timer":90
         });
         this.processFeed();
      }
      
      public function addKillFeed(param1:*, param2:*, param3:Stats_Guns) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc4_:uint = this.getUnitColour(param2);
         var _loc5_:uint = this.getUnitColour(param1);
         if(param1 == param2)
         {
            this.feeds.unshift({
               "txt":["Suicide"," [" + param3.name + "] ",param2.name],
               "col":[16751103,13421772,_loc4_],
               "timer":90
            });
            this.processFeed();
            return;
         }
         this.feeds.unshift({
            "txt":[param2.name," [" + param3.name + "] ",param1.name],
            "col":[_loc4_,13421772,_loc5_],
            "timer":90
         });
         this.processFeed();
      }
      
      public function processFeed() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         var _loc3_:uint = 0;
         if(this.feeds.length > 13)
         {
            this.feeds.pop();
         }
         this.txt_feed.text = "";
         _loc1_ = 0;
         while(_loc1_ < this.feeds.length)
         {
            this.txt_feed.text += this.feeds[_loc1_].txt.join("") + "\n";
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         var _loc2_:uint = 0;
         _loc1_ = 0;
         while(_loc1_ < this.feeds.length)
         {
            _loc3_ = 0;
            while(_loc3_ < this.feeds[_loc1_].txt.length)
            {
               this.txtFmt.color = this.feeds[_loc1_].col[_loc3_];
               this.txt_feed.setTextFormat(this.txtFmt,_loc2_,_loc2_ + this.feeds[_loc1_].txt[_loc3_].length + 1);
               _loc2_ += this.feeds[_loc1_].txt[_loc3_].length;
               _loc3_++;
               if(2 == 3)
               {
                  break;
               }
            }
            _loc2_ += 1;
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
      }
      
      public function getUnitColour(param1:*) : uint
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return param1.human ? 10079487 : (param1.team == 1 ? 6724095 : 16737792);
      }
      
      internal function __setProp_rd_qualH_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.rd_qualH] == undefined || int(this.__setPropDict[this.rd_qualH]) != 15)
         {
            this.__setPropDict[this.rd_qualH] = 15;
            try
            {
               this.rd_qualH["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
            }
            this.rd_qualH.enabled = true;
            this.rd_qualH.groupName = "qualGroup";
            this.rd_qualH.label = "";
            this.rd_qualH.labelPlacement = "left";
            this.rd_qualH.selected = false;
            this.rd_qualH.value = "";
            this.rd_qualH.visible = true;
            try
            {
               this.rd_qualH["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
               §§push(e);
               var _temp_4:* = e;
               var _temp_5:* = §§pop();
               §§push(_temp_4);
               §§push(_temp_5);
               §§pop().§§slot[1] = §§pop();
            }
         }
      }
      
      internal function __setProp_rd_qualM_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.rd_qualM] == undefined || int(this.__setPropDict[this.rd_qualM]) != 15)
         {
            this.__setPropDict[this.rd_qualM] = 15;
            try
            {
               this.rd_qualM["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
            }
            this.rd_qualM.enabled = true;
            this.rd_qualM.groupName = "qualGroup";
            this.rd_qualM.label = "";
            this.rd_qualM.labelPlacement = "left";
            this.rd_qualM.selected = false;
            this.rd_qualM.value = "";
            this.rd_qualM.visible = true;
            try
            {
               this.rd_qualM["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
            }
         }
      }
      
      internal function __setProp_rd_qualL_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.rd_qualL] == undefined || int(this.__setPropDict[this.rd_qualL]) != 15)
         {
            this.__setPropDict[this.rd_qualL] = 15;
            try
            {
               this.rd_qualL["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
            }
            this.rd_qualL.enabled = true;
            this.rd_qualL.groupName = "qualGroup";
            this.rd_qualL.label = "";
            this.rd_qualL.labelPlacement = "left";
            this.rd_qualL.selected = false;
            this.rd_qualL.value = "";
            this.rd_qualL.visible = true;
            try
            {
               this.rd_qualL["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
            }
         }
      }
      
      internal function __setProp_rd_partH_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.rd_partH] == undefined || int(this.__setPropDict[this.rd_partH]) != 15)
         {
            this.__setPropDict[this.rd_partH] = 15;
            try
            {
               this.rd_partH["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
            }
            this.rd_partH.enabled = true;
            this.rd_partH.groupName = "partGroup";
            this.rd_partH.label = "";
            this.rd_partH.labelPlacement = "left";
            this.rd_partH.selected = false;
            this.rd_partH.value = "";
            this.rd_partH.visible = true;
            try
            {
               this.rd_partH["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
            }
         }
      }
      
      internal function __setProp_rd_partM_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.rd_partM] == undefined || int(this.__setPropDict[this.rd_partM]) != 15)
         {
            this.__setPropDict[this.rd_partM] = 15;
            try
            {
               this.rd_partM["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
            }
            this.rd_partM.enabled = true;
            this.rd_partM.groupName = "partGroup";
            this.rd_partM.label = "";
            this.rd_partM.labelPlacement = "left";
            this.rd_partM.selected = false;
            this.rd_partM.value = "";
            this.rd_partM.visible = true;
            try
            {
               this.rd_partM["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
               §§push(e);
               §§push(e);
               var _temp_4:* = §§pop();
               _temp_4.§§slot[1] = §§pop();
            }
         }
      }
      
      internal function __setProp_rd_partL_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.rd_partL] == undefined || int(this.__setPropDict[this.rd_partL]) != 15)
         {
            this.__setPropDict[this.rd_partL] = 15;
            try
            {
               this.rd_partL["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
               §§push(e);
               var _temp_2:* = e;
               e = §§pop();
            }
            this.rd_partL.enabled = true;
            this.rd_partL.groupName = "partGroup";
            this.rd_partL.label = "";
            this.rd_partL.labelPlacement = "left";
            this.rd_partL.selected = false;
            this.rd_partL.value = "";
            this.rd_partL.visible = true;
            try
            {
               this.rd_partL["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
            }
         }
      }
      
      internal function __setProp_cb_light_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.cb_light] == undefined || int(this.__setPropDict[this.cb_light]) != 15)
         {
            this.__setPropDict[this.cb_light] = 15;
            try
            {
               this.cb_light["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
            }
            this.cb_light.enabled = true;
            this.cb_light.label = "";
            this.cb_light.labelPlacement = "left";
            this.cb_light.selected = false;
            this.cb_light.visible = true;
            try
            {
               this.cb_light["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
               §§push(e);
               §§push(e);
               var _temp_4:* = §§pop();
               _temp_4.§§slot[1] = §§pop();
            }
         }
      }
      
      internal function __setProp_cb_shake_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.cb_shake] == undefined || int(this.__setPropDict[this.cb_shake]) != 15)
         {
            this.__setPropDict[this.cb_shake] = 15;
            try
            {
               this.cb_shake["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
            }
            this.cb_shake.enabled = true;
            this.cb_shake.label = "";
            this.cb_shake.labelPlacement = "left";
            this.cb_shake.selected = false;
            this.cb_shake.visible = true;
            try
            {
               this.cb_shake["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
            }
         }
      }
      
      internal function __setProp_cb_bloody_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.cb_bloody] == undefined || int(this.__setPropDict[this.cb_bloody]) != 15)
         {
            this.__setPropDict[this.cb_bloody] = 15;
            try
            {
               this.cb_bloody["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
               §§push(e);
               var _temp_2:* = e;
               e = §§pop();
            }
            this.cb_bloody.enabled = true;
            this.cb_bloody.label = "";
            this.cb_bloody.labelPlacement = "left";
            this.cb_bloody.selected = false;
            this.cb_bloody.visible = true;
            try
            {
               this.cb_bloody["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
            }
         }
      }
      
      internal function __setProp_rd_bloodH_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.rd_bloodH] == undefined || int(this.__setPropDict[this.rd_bloodH]) != 15)
         {
            this.__setPropDict[this.rd_bloodH] = 15;
            try
            {
               this.rd_bloodH["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
               §§push(e);
               var _temp_2:* = e;
               e = §§pop();
            }
            this.rd_bloodH.enabled = true;
            this.rd_bloodH.groupName = "partBlood";
            this.rd_bloodH.label = "";
            this.rd_bloodH.labelPlacement = "left";
            this.rd_bloodH.selected = false;
            this.rd_bloodH.value = "";
            this.rd_bloodH.visible = true;
            try
            {
               this.rd_bloodH["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
               §§push(e);
               §§push(e);
               var _temp_4:* = §§pop();
               _temp_4.§§slot[1] = §§pop();
            }
         }
      }
      
      internal function __setProp_rd_bloodM_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.rd_bloodM] == undefined || int(this.__setPropDict[this.rd_bloodM]) != 15)
         {
            this.__setPropDict[this.rd_bloodM] = 15;
            try
            {
               this.rd_bloodM["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
               §§push(e);
               §§push(e);
               var _temp_2:* = §§pop();
               _temp_2.§§slot[1] = §§pop();
            }
            this.rd_bloodM.enabled = true;
            this.rd_bloodM.groupName = "partBlood";
            this.rd_bloodM.label = "";
            this.rd_bloodM.labelPlacement = "left";
            this.rd_bloodM.selected = false;
            this.rd_bloodM.value = "";
            this.rd_bloodM.visible = true;
            try
            {
               this.rd_bloodM["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
            }
         }
      }
      
      internal function __setProp_rd_bloodL_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.rd_bloodL] == undefined || int(this.__setPropDict[this.rd_bloodL]) != 15)
         {
            this.__setPropDict[this.rd_bloodL] = 15;
            try
            {
               this.rd_bloodL["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
               §§push(e);
               §§push(e);
               var _temp_2:* = §§pop();
               _temp_2.§§slot[1] = §§pop();
            }
            this.rd_bloodL.enabled = true;
            this.rd_bloodL.groupName = "partBlood";
            this.rd_bloodL.label = "";
            this.rd_bloodL.labelPlacement = "left";
            this.rd_bloodL.selected = false;
            this.rd_bloodL.value = "";
            this.rd_bloodL.visible = true;
            try
            {
               this.rd_bloodL["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
            }
         }
      }
      
      internal function __setProp_cb_music_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.cb_music] == undefined || int(this.__setPropDict[this.cb_music]) != 15)
         {
            this.__setPropDict[this.cb_music] = 15;
            try
            {
               this.cb_music["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
               §§push(e);
               §§push(e);
               var _temp_2:* = §§pop();
               _temp_2.§§slot[1] = §§pop();
            }
            this.cb_music.enabled = true;
            this.cb_music.label = "";
            this.cb_music.labelPlacement = "left";
            this.cb_music.selected = false;
            this.cb_music.visible = true;
            try
            {
               this.cb_music["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
            }
         }
      }
      
      internal function __setProp_cb_sound_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.cb_sound] == undefined || int(this.__setPropDict[this.cb_sound]) != 15)
         {
            this.__setPropDict[this.cb_sound] = 15;
            try
            {
               this.cb_sound["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
               §§push(e);
               var _temp_2:* = e;
               e = §§pop();
            }
            this.cb_sound.enabled = true;
            this.cb_sound.label = "";
            this.cb_sound.labelPlacement = "left";
            this.cb_sound.selected = false;
            this.cb_sound.visible = true;
            try
            {
               this.cb_sound["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
            }
         }
      }
      
      internal function __setProp_cb_voices_() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.__setPropDict[this.cb_voices] == undefined || int(this.__setPropDict[this.cb_voices]) != 15)
         {
            this.__setPropDict[this.cb_voices] = 15;
            try
            {
               this.cb_voices["componentInspectorSetting"] = true;
            }
            catch(e:Error)
            {
            }
            this.cb_voices.enabled = true;
            this.cb_voices.label = "";
            this.cb_voices.labelPlacement = "left";
            this.cb_voices.selected = false;
            this.cb_voices.visible = true;
            try
            {
               this.cb_voices["componentInspectorSetting"] = false;
            }
            catch(e:Error)
            {
            }
         }
      }
      
      internal function frame15() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.__setProp_cb_voices_();
         this.__setProp_cb_sound_();
         this.__setProp_cb_music_();
         this.__setProp_rd_bloodL_();
         this.__setProp_rd_bloodM_();
         this.__setProp_rd_bloodH_();
         this.__setProp_cb_bloody_();
         this.__setProp_cb_shake_();
         this.__setProp_cb_light_();
         this.__setProp_rd_partL_();
         this.__setProp_rd_partM_();
         this.__setProp_rd_partH_();
         this.__setProp_rd_qualL_();
         this.__setProp_rd_qualM_();
         this.__setProp_rd_qualH_();
         this.InitPause();
      }
      
      internal function frame74() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.startGame();
      }
      
      internal function frame104() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         gotoAndStop("idle");
      }
      
      internal function frame105() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.InitEnd();
      }
      
      internal function frame255() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.EndGame();
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

