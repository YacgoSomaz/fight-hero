package
{
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol1137")]
   public class Menu extends Sprite
   {
      
      public static var CURPLAYLABEL:String;
      
      §§push(Menu);
      if(37 == 34)
      {
         return;
      }
      
      public var menumask:MovieClip;
      
      public var bg:MovieClip;
      
      public var menfr:MovieClip;
      
      private var curLabel:String;
      
      private var curTab:String;
      
      private var tabbuts:Array;
      
      private var tempbuts:Array;
      
      private var main:Main;
      
      private var tempAr:Array;
      
      private var tempNum:Number;
      
      private var tempStr:String;
      
      private var tempOb:Object;
      
      public function Menu(param1:Main, param2:Object)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.main = param1;
         this.tabbuts = ["play","soldiers","options","medals","tips","version"];
         this.menfr.stop();
         this.menumask.stop();
         SH.playMusic(M_Menu);
         if(CURPLAYLABEL)
         {
            this.curTab = this.tabbuts[0];
            this.menfr["btn_" + this.curTab].textColor = 16777215;
            this.menfr.gotoAndStop(CURPLAYLABEL);
         }
         else if(!SD.checkSave())
         {
            this.menfr.gotoAndStop("name");
         }
         trace(this.menfr.currentLabel);
         trace(this.menumask.currentLabel);
      }
      
      public function setTeams(param1:MovieClip, param2:uint) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:uint = 0;
         param1.barp.txt_name.text = SD.name;
         param1.barp.txt_num.text = "1";
         param1.barp.gotoAndStop(2);
         switch(param2)
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
               MatchSettings.qmTeams = false;
               if(!MatchSettings.qmBots0.length)
               {
                  MatchSettings.addBot(0);
               }
               _loc3_ = 0;
               while(_loc3_ < 11)
               {
                  if(_loc3_ < MatchSettings.qmBots0.length)
                  {
                     param1["bar" + _loc3_].txt_name.text = MatchSettings.qmBots0[_loc3_].name;
                     param1["bar" + _loc3_].txt_num.text = "" + (_loc3_ + 2);
                     param1["bar" + _loc3_].visible = true;
                  }
                  else
                  {
                     param1["bar" + _loc3_].visible = false;
                  }
                  _loc3_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               param1.bt_rem0.visible = MatchSettings.qmBots0.length > 1;
               param1.bt_add0.visible = MatchSettings.qmBots0.length < 11;
               break;
            case 1:
               MatchSettings.qmTeams = true;
               _loc3_ = 0;
               while(_loc3_ < 5)
               {
                  if(_loc3_ < MatchSettings.qmBots1.length)
                  {
                     param1["bar1_" + _loc3_].txt_name.text = MatchSettings.qmBots1[_loc3_].name;
                     param1["bar1_" + _loc3_].txt_num.text = "" + (_loc3_ + 2);
                     param1["bar1_" + _loc3_].visible = true;
                  }
                  else
                  {
                     param1["bar1_" + _loc3_].visible = false;
                  }
                  _loc3_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               param1.bt_rem1.visible = MatchSettings.qmBots1.length > 0;
               param1.bt_add1.visible = MatchSettings.qmBots1.length < 5;
               if(!MatchSettings.qmBots2.length)
               {
                  MatchSettings.addBot(2);
               }
               _loc3_ = 0;
               while(_loc3_ < 6)
               {
                  if(_loc3_ < MatchSettings.qmBots2.length)
                  {
                     param1["bar2_" + _loc3_].txt_name.text = MatchSettings.qmBots2[_loc3_].name;
                     param1["bar2_" + _loc3_].txt_num.text = "" + (_loc3_ + 1);
                     param1["bar2_" + _loc3_].visible = true;
                  }
                  else
                  {
                     param1["bar2_" + _loc3_].visible = false;
                  }
                  _loc3_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               param1.bt_rem2.visible = MatchSettings.qmBots2.length > 1;
               param1.bt_add2.visible = MatchSettings.qmBots2.length < 6;
         }
      }
      
      public function Init() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         var _loc2_:Object = null;
         var _loc3_:* = undefined;
         var _loc4_:Holder_Gun = null;
         var _loc5_:Holder_Skill = null;
         this.curLabel = this.menfr.currentLabel;
         this.menfr.bg.gotoAndPlay(this.bg.currentFrame);
         this.menumask.gotoAndStop(this.menfr.currentFrame);
         if(this.curLabel == "campaign" || this.curLabel == "quickmatch" || this.curLabel == "challenges")
         {
            CURPLAYLABEL = this.curLabel;
         }
         _loc1_ = 0;
         while(_loc1_ < this.tabbuts.length)
         {
            this.menfr["btn_" + this.tabbuts[_loc1_]].textColor = 13421772;
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         if(this.curTab)
         {
            this.menfr["btn_" + this.curTab].textColor = 16777215;
         }
         switch(this.curLabel)
         {
            case "play":
               §§push(0);
               break;
            case "home":
               §§push(1);
               break;
            case "name":
               §§push(2);
               break;
            case "quickmatch":
               §§push(3);
               break;
            case "campaign":
               §§push(4);
               break;
            case "challenges":
               §§push(5);
               break;
            case "soldiers":
               §§push(6);
               break;
            case "primary":
               §§push(7);
               break;
            case "secondary":
               §§push(8);
               break;
            case "skill":
               §§push(9);
               break;
            case "killstreak":
               §§push(10);
               break;
            case "options":
               §§push(11);
               break;
            case "medals":
               §§push(12);
               break;
            default:
               §§push(13);
         }
         2;
         switch(§§pop())
         {
            case 0:
               this.menfr.newsbox.visible = false;
               if(CURPLAYLABEL)
               {
                  this.menfr.gotoAndStop(CURPLAYLABEL);
               }
               if(Main.NEWS)
               {
                  this.menfr.newsbox.visible = true;
                  this.menfr.newsbox.txt_news.text = Main.NEWS;
               }
            case 1:
            case 2:
               this.menfr.txt_name.text = SD.name;
               break;
            case 3:
               if(SD.curCampaign == 1 && !SD.warnQuickmatch)
               {
                  SD.warnQuickmatch = true;
                  this.menfr.gotoAndStop("toquickmatch");
                  break;
               }
               Stats_Misc.buildModList();
               _loc2_ = Stats_Maps.getMap(MatchSettings.qmMap);
               this.menfr.mc_map.gotoAndStop(_loc2_.id);
               this.menfr.txt_name.text = _loc2_.name;
               this.menfr.txt_mapdesc.text = _loc2_.desc;
               _loc1_ = 0;
               while(_loc1_ < Stats_Misc.gameModes.length)
               {
                  this.menfr["mc_icon" + _loc1_].gotoAndStop(Stats_Misc.getGameMode(Stats_Misc.gameModes[_loc1_]).sprite);
                  this.menfr["mc_icon" + _loc1_].alpha = Stats_Misc.gameModes[_loc1_] == MatchSettings.qmMode ? 1 : 0.5;
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.tempOb = Stats_Misc.getGameMode(MatchSettings.qmMode);
               this.menfr.txt_mode.text = this.tempOb.name;
               this.menfr.txt_desc.text = this.tempOb.desc;
               this.menfr.txt_scoretype.text = this.tempOb.scoretype;
               this.menfr.txt_type.text = this.tempOb.teams == 1 ? "Free for All" : "Blue vs Orange";
               if(this.menfr.mc_teams.currentFrame == this.tempOb.teams)
               {
                  this.setTeams(this.menfr.mc_teams,this.tempOb.teams);
               }
               else
               {
                  this.menfr.mc_teams.gotoAndStop("teams_" + this.tempOb.teams);
               }
               this.menfr.txt_score.text = MatchSettings.qmScore;
               this.menfr.txt_soldiers.text = !MatchSettings.qmSoldiers ? "All" : Stats_Classes.getClass(MatchSettings.qmSoldiers).name + "s Only";
               this.menfr.txt_skills.text = MatchSettings.qmSkills ? "Enabled" : "Disabled";
               this.menfr.txt_streaks.text = MatchSettings.qmStreaks ? "Enabled" : "Disabled";
               this.menfr.txt_modifier.text = Stats_Misc.getMod(MatchSettings.qmMod).name;
               this.menfr.txt_moddesc.text = Stats_Misc.getMod(MatchSettings.qmMod).desc;
               this.menfr.txt_modexp.text = Stats_Misc.getMod(MatchSettings.qmMod).exp;
               this.menfr.txt_diff.text = Stats_Classes.getDiffName(MatchSettings.qmDiff);
               this.menfr.txt_recc.text = "Recommended Level: " + Stats_Classes.getReccLevel(MatchSettings.qmDiff);
               this.tempAr = ["pscore","nscore","psoldiers","nsoldiers","pskills","nskills","pstreaks","nstreaks","pmod","nmod","pdiff","ndiff"];
               break;
            case 4:
               MatchSettings.caType = 0;
               _loc1_ = 1;
               while(_loc1_ <= 15)
               {
                  this.menfr["bar" + _loc1_].txt_num.text = "" + _loc1_;
                  if(_loc1_ <= SD.curCampaign)
                  {
                     Stats_Campaign.setMatch(_loc1_,true);
                     this.menfr["bar" + _loc1_].txt_name.text = MatchSettings.caName;
                  }
                  else
                  {
                     this.menfr["bar" + _loc1_].txt_name.text = "Locked";
                     this.menfr["bar" + _loc1_].alpha = 0.5;
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.menfr.mc_map.bt_prev.visible = false;
               this.menfr.mc_map.bt_next.visible = false;
               this.selectMission(SD.curCampaign);
               break;
            case 5:
               if(SD.curChallenge == 1 && SD.curCampaign <= 7 && !SD.warnChallenges)
               {
                  SD.warnChallenges = true;
                  this.menfr.gotoAndStop("tochallenges");
                  break;
               }
               MatchSettings.caType = 1;
               _loc1_ = 1;
               while(_loc1_ <= 15)
               {
                  this.menfr["bar" + _loc1_].txt_num.text = "" + _loc1_;
                  if(_loc1_ <= SD.curChallenge)
                  {
                     Stats_Campaign.setMatch(_loc1_,true);
                     this.menfr["bar" + _loc1_].txt_name.text = MatchSettings.caName;
                  }
                  else
                  {
                     this.menfr["bar" + _loc1_].txt_name.text = "Locked";
                     this.menfr["bar" + _loc1_].alpha = 0.5;
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.menfr.mc_map.bt_prev.visible = false;
               this.menfr.mc_map.bt_next.visible = false;
               this.selectMission(SD.curChallenge);
               break;
            case 6:
               _loc1_ = 1;
               while(_loc1_ <= 4)
               {
                  this.menfr["bt_icon" + _loc1_].alpha = 0.5;
                  this.menfr["bt_icon" + _loc1_].gotoAndStop(Stats_Classes.getClass(_loc1_).icon);
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.menfr["bt_icon" + SD.selClass].alpha = 1;
               _loc1_ = 1;
               while(_loc1_ <= 5)
               {
                  this.menfr["bt_color" + _loc1_].alpha = 0.5;
                  this.menfr["bt_color" + _loc1_].gotoAndStop(_loc1_);
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.menfr["bt_color" + SD.classSaves[SD.selClass].skin].alpha = 1;
               this.menfr.txt_classname.text = Stats_Classes.getClass(SD.selClass).name;
               this.menfr.txt_level.text = "Level " + SD.classSaves[SD.selClass].level;
               if(SD.classSaves[SD.selClass].level == 50)
               {
                  this.menfr.txt_exp.text = "Level Maxed";
                  this.menfr.bar_exp.width = 220;
               }
               else
               {
                  this.menfr.txt_exp.text = "Exp " + SD.classSaves[SD.selClass].exp + " / " + Stats_Classes.getNextExp(SD.classSaves[SD.selClass].level);
                  this.menfr.bar_exp.width = SD.classSaves[SD.selClass].exp / Stats_Classes.getNextExp(SD.classSaves[SD.selClass].level) * 220;
               }
               _loc3_ = Stats_Classes.getClass(SD.selClass).startFrame + SD.classSaves[SD.selClass].skin;
               this.menfr.char.headhold.gotoAndStop(_loc3_);
               this.menfr.char.body.gotoAndStop(_loc3_);
               this.menfr.char.legup1.gotoAndStop(_loc3_);
               this.menfr.char.legup1.gun.visible = false;
               this.menfr.char.legup2.gotoAndStop(_loc3_);
               this.menfr.char.legup2.gun.visible = false;
               this.menfr.char.leglow1.gotoAndStop(_loc3_);
               this.menfr.char.leglow2.gotoAndStop(_loc3_);
               this.menfr.char.foot1.gotoAndStop(_loc3_);
               this.menfr.char.foot2.gotoAndStop(_loc3_);
               this.menfr.char.gun.gotoAndStop(Stats_Guns.gunOb[SD.classSaves[SD.selClass].primary].sprite);
               this.menfr.char.arm1hold.armup1.gotoAndStop(_loc3_);
               this.menfr.char.arm1hold.armlow1.gotoAndStop(_loc3_);
               this.menfr.char.arm1hold.hand1.gotoAndStop(_loc3_);
               this.menfr.char.arm1hold.hand2.gotoAndStop(_loc3_);
               this.menfr.char.arm1hold.gun.gotoAndStop(Stats_Guns.gunOb[SD.classSaves[SD.selClass].secondary].sprite);
               this.menfr.bt_primary.mc_gun.setGun(Stats_Guns.gunOb[SD.classSaves[SD.selClass].primary],"Primary");
               this.menfr.bt_secondary.mc_gun.setGun(Stats_Guns.gunOb[SD.classSaves[SD.selClass].secondary],"Secondary");
               this.menfr.bt_skill.setSkill(Stats_Skills.skillOb[SD.classSaves[SD.selClass].skill]);
               this.menfr.bt_killstreak.setStreak(Stats_Streaks.streakOb[SD.classSaves[SD.selClass].streak]);
               if(!this.tempOb || !this.tempOb.hp)
               {
                  this.tempOb = {
                     "hp":0,
                     "aim":0,
                     "amm":0,
                     "crit":0
                  };
               }
               if(this.tempStr == "return")
               {
                  this.menfr.bt_primary.mc_gun.modStats(true);
                  this.menfr.bt_secondary.mc_gun.modStats(true);
               }
               this.tempStr = "";
               this.menfr.txt_funds.text = "$" + UT.addNumCommas(SD.classSaves[SD.selClass].funds);
               break;
            case 7:
               this.menfr.txt_funds.text = "$" + UT.addNumCommas(SD.classSaves[SD.selClass].funds);
               this.menfr.bt_gun.mc_gun.setGun(Stats_Guns.gunOb[SD.classSaves[SD.selClass].primary],"",this.menfr);
               this.menfr.bt_gun.mc_gun.modStats(true);
               this.tempAr = [];
               this.tempStr = SD.classSaves[SD.selClass].primary;
               _loc1_ = 0;
               while(_loc1_ < Stats_Guns.classAr[SD.selClass].length)
               {
                  _loc4_ = new Holder_Gun(Stats_Guns.classAr[SD.selClass][_loc1_]);
                  _loc4_.y = _loc1_ * 95;
                  this.tempAr.push(_loc4_);
                  this.menfr.gunCont.addChild(_loc4_);
                  if(_loc4_.gun.id == this.tempStr)
                  {
                     _loc4_.gotoAndStop(3);
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.menfr.gunCont.mask = this.menfr.gunMask;
               break;
            case 8:
               this.menfr.txt_funds.text = "$" + UT.addNumCommas(SD.classSaves[SD.selClass].funds);
               this.menfr.bt_gun.mc_gun.setGun(Stats_Guns.gunOb[SD.classSaves[SD.selClass].secondary],"",this.menfr);
               this.menfr.bt_gun.mc_gun.modStats(true);
               this.tempAr = [];
               this.tempStr = SD.classSaves[SD.selClass].secondary;
               _loc1_ = 0;
               while(_loc1_ < Stats_Guns.classAr[0].length)
               {
                  _loc4_ = new Holder_Gun(Stats_Guns.classAr[0][_loc1_]);
                  _loc4_.y = _loc1_ * 95;
                  this.tempAr.push(_loc4_);
                  this.menfr.gunCont.addChild(_loc4_);
                  if(_loc4_.gun.id == this.tempStr)
                  {
                     _loc4_.gotoAndStop(3);
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.menfr.gunCont.mask = this.menfr.gunMask;
               break;
            case 9:
               this.menfr.txt_funds.text = "$" + UT.addNumCommas(SD.classSaves[SD.selClass].funds);
               this.menfr.bt_skillbox.mc_skill.setSkill(Stats_Skills.skillOb[SD.classSaves[SD.selClass].skill]);
               this.menfr.bt_skillbox.mc_skill.setText(this.menfr);
               this.tempAr = [];
               this.tempStr = SD.classSaves[SD.selClass].skill;
               _loc1_ = 0;
               while(_loc1_ < Stats_Skills.classAr[SD.selClass].length)
               {
                  _loc5_ = new Holder_Skill(Stats_Skills.classAr[SD.selClass][_loc1_]);
                  _loc5_.y = _loc1_ * 95;
                  this.tempAr.push(_loc5_);
                  this.menfr.gunCont.addChild(_loc5_);
                  if(_loc5_.skill.id == this.tempStr)
                  {
                     _loc5_.gotoAndStop(3);
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.menfr.gunCont.mask = this.menfr.gunMask;
               break;
            case 10:
               this.menfr.txt_funds.text = "$" + UT.addNumCommas(SD.classSaves[SD.selClass].funds);
               this.menfr.bt_skillbox.mc_skill.setStreak(Stats_Streaks.streakOb[SD.classSaves[SD.selClass].streak]);
               this.menfr.bt_skillbox.mc_skill.setText(this.menfr);
               this.tempAr = [];
               this.tempStr = SD.classSaves[SD.selClass].streak;
               _loc1_ = 0;
               while(_loc1_ < Stats_Streaks.classAr[SD.selClass].length)
               {
                  _loc5_ = new Holder_Skill(Stats_Streaks.classAr[SD.selClass][_loc1_]);
                  _loc5_.y = _loc1_ * 95;
                  this.tempAr.push(_loc5_);
                  this.menfr.gunCont.addChild(_loc5_);
                  if(_loc5_.streak.id == this.tempStr)
                  {
                     _loc5_.gotoAndStop(3);
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.menfr.gunCont.mask = this.menfr.gunMask;
               break;
            case 11:
               this.tempAr = [this.menfr.rd_qualL,this.menfr.rd_qualM,this.menfr.rd_qualH,this.menfr.rd_partL,this.menfr.rd_partM,this.menfr.rd_partH,this.menfr.cb_light,this.menfr.cb_music,this.menfr.cb_sound,this.menfr.cb_voices,this.menfr.cb_shake,this.menfr.cb_bloody,this.menfr.rd_bloodL,this.menfr.rd_bloodM,this.menfr.rd_bloodH];
               if(SD.graphQual == 0)
               {
                  this.menfr.rd_qualL.selected = true;
               }
               if(SD.graphQual == 1)
               {
                  this.menfr.rd_qualM.selected = true;
               }
               if(SD.graphQual == 2)
               {
                  this.menfr.rd_qualH.selected = true;
               }
               if(SD.graphPart == 0)
               {
                  this.menfr.rd_partL.selected = true;
               }
               if(SD.graphPart == 1)
               {
                  this.menfr.rd_partM.selected = true;
               }
               if(SD.graphPart == 2)
               {
                  this.menfr.rd_partH.selected = true;
               }
               this.menfr.cb_light.selected = SD.graphLights;
               this.menfr.cb_music.selected = SD.music;
               this.menfr.cb_sound.selected = SD.sound;
               this.menfr.cb_voices.selected = SD.voices;
               this.menfr.cb_shake.selected = SD.screenShake;
               this.menfr.cb_bloody.selected = SD.screenBlood;
               if(SD.blood == 0)
               {
                  this.menfr.rd_bloodL.selected = true;
               }
               if(SD.blood == 1)
               {
                  this.menfr.rd_bloodM.selected = true;
               }
               if(SD.blood == 2)
               {
                  this.menfr.rd_bloodH.selected = true;
               }
               this.menfr.sl_music.value = SD.music;
               this.menfr.sl_sound.value = SD.sound;
               break;
            case 12:
               _loc1_ = 0;
               while(_loc1_ < 10)
               {
                  this.menfr["ach" + _loc1_].txt_desc.text = Stats_Achievements.getAchievementNum(_loc1_).desc;
                  if(SD.achievements.indexOf(_loc1_) != -1)
                  {
                     this.menfr["ach" + _loc1_].gotoAndStop(1);
                  }
                  else
                  {
                     if(Stats_Achievements.getAchievementNum(_loc1_).secret)
                     {
                        this.menfr["ach" + _loc1_].txt_desc.text = "Secret achievement";
                     }
                     this.menfr["ach" + _loc1_].gotoAndStop(2);
                  }
                  this.menfr["ach" + _loc1_].icon.gotoAndStop(Stats_Achievements.achOrder[_loc1_]);
                  this.menfr["ach" + _loc1_].txt_name.text = Stats_Achievements.getAchievementNum(_loc1_).name;
                  if(Stats_Achievements.getAchievementNum(_loc1_).unlock)
                  {
                     this.menfr["ach" + _loc1_].txt_unlock.text = "Unlocks " + Stats_Misc.getMod(Stats_Achievements.getAchievementNum(_loc1_).unlock).name + " mod";
                  }
                  else
                  {
                     this.menfr["ach" + _loc1_].txt_unlock.text = "";
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
         }
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         var _loc2_:Object = null;
         _loc1_ = 0;
         while(_loc1_ < this.tabbuts.length)
         {
            if(this.curTab != this.tabbuts[_loc1_])
            {
               if(this.ht(this.menfr["btn_" + this.tabbuts[_loc1_]]))
               {
                  this.menfr["btn_" + this.tabbuts[_loc1_]].alpha = 1;
               }
               else
               {
                  this.menfr["btn_" + this.tabbuts[_loc1_]].alpha = 0.5;
               }
            }
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         SD.setLogos(this.menfr.logo1,this.menfr.logo2);
         switch(this.curLabel)
         {
            case "play":
               §§push(0);
               break;
            case "home":
               §§push(1);
               break;
            case "name":
               §§push(2);
               break;
            case "toquickmatch":
               §§push(3);
               break;
            case "tochallenges":
               §§push(4);
               break;
            case "quickmatch":
               §§push(5);
               break;
            case "campaign":
               §§push(6);
               break;
            case "challenges":
               §§push(7);
               break;
            case "soldiers":
               §§push(8);
               break;
            case "primary":
               §§push(9);
               break;
            case "secondary":
               §§push(10);
               break;
            case "skill":
               §§push(11);
               break;
            case "killstreak":
               §§push(12);
               break;
            default:
               §§push(13);
         }
         2;
         switch(§§pop())
         {
            case 0:
               if(this.menfr.bt_campaign)
               {
                  this.menfr.bt_campaign.alpha = this.ht(this.menfr.bt_campaign) ? 1 : 0.5;
               }
               if(this.menfr.bt_challenges)
               {
                  this.menfr.bt_challenges.alpha = this.ht(this.menfr.bt_challenges) ? 1 : 0.5;
               }
               if(this.menfr.bt_quickmatch)
               {
                  this.menfr.bt_quickmatch.alpha = this.ht(this.menfr.bt_quickmatch) ? 1 : 0.5;
               }
            case 1:
               SD.name = this.menfr.txt_name.text;
               break;
            case 2:
               SD.name = this.menfr.txt_name.text;
               if(this.menfr.bt_continue)
               {
                  this.menfr.bt_continue.alpha = this.ht(this.menfr.bt_continue) ? 1 : 0.5;
               }
               break;
            case 3:
               if(this.menfr.bt_goto)
               {
                  this.menfr.bt_goto.alpha = this.ht(this.menfr.bt_goto) ? 1 : 0.5;
               }
               if(this.menfr.bt_continue)
               {
                  this.menfr.bt_continue.alpha = this.ht(this.menfr.bt_continue) ? 1 : 0.5;
               }
               break;
            case 4:
               if(this.menfr.bt_goto)
               {
                  this.menfr.bt_goto.alpha = this.ht(this.menfr.bt_goto) ? 1 : 0.5;
               }
               if(this.menfr.bt_continue)
               {
                  this.menfr.bt_continue.alpha = this.ht(this.menfr.bt_continue) ? 1 : 0.5;
               }
               break;
            case 5:
               this.menfr.mc_map.bt_prev.alpha = this.ht(this.menfr.mc_map.bt_prev) ? 1 : 0.5;
               this.menfr.mc_map.bt_next.alpha = this.ht(this.menfr.mc_map.bt_next) ? 1 : 0.5;
               this.menfr.bt_start.alpha = this.ht(this.menfr.bt_start) ? 1 : 0.5;
               this.menfr.bt_back.alpha = this.ht(this.menfr.bt_back) ? 1 : 0.5;
               if(this.menfr.mc_teams.bt_add0)
               {
                  this.menfr.mc_teams.bt_add0.alpha = this.ht(this.menfr.mc_teams.bt_add0) ? 1 : 0.5;
               }
               if(this.menfr.mc_teams.bt_add1)
               {
                  this.menfr.mc_teams.bt_add1.alpha = this.ht(this.menfr.mc_teams.bt_add1) ? 1 : 0.5;
               }
               if(this.menfr.mc_teams.bt_add2)
               {
                  this.menfr.mc_teams.bt_add2.alpha = this.ht(this.menfr.mc_teams.bt_add2) ? 1 : 0.5;
               }
               if(this.menfr.mc_teams.bt_rem0)
               {
                  this.menfr.mc_teams.bt_rem0.alpha = this.ht(this.menfr.mc_teams.bt_rem0) ? 1 : 0.5;
               }
               if(this.menfr.mc_teams.bt_rem1)
               {
                  this.menfr.mc_teams.bt_rem1.alpha = this.ht(this.menfr.mc_teams.bt_rem1) ? 1 : 0.5;
               }
               if(this.menfr.mc_teams.bt_rem2)
               {
                  this.menfr.mc_teams.bt_rem2.alpha = this.ht(this.menfr.mc_teams.bt_rem2) ? 1 : 0.5;
               }
               _loc1_ = 0;
               while(_loc1_ < Stats_Misc.gameModes.length)
               {
                  if(Stats_Misc.gameModes[_loc1_] != MatchSettings.qmMode)
                  {
                     this.menfr["mc_icon" + _loc1_].alpha = this.ht(this.menfr["mc_icon" + _loc1_]) ? 1 : 0.5;
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               _loc1_ = 0;
               while(_loc1_ < this.tempAr.length)
               {
                  this.menfr["bt_" + this.tempAr[_loc1_]].alpha = this.ht(this.menfr["bt_" + this.tempAr[_loc1_]]) ? 1 : 0.2;
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               break;
            case 6:
               _loc1_ = 1;
               while(_loc1_ <= SD.curCampaign)
               {
                  if(_loc1_ != MatchSettings.caStage)
                  {
                     if(this.ht(this.menfr["bar" + _loc1_]))
                     {
                        this.menfr["bar" + _loc1_].gotoAndStop(2);
                     }
                     else
                     {
                        this.menfr["bar" + _loc1_].gotoAndStop(1);
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.menfr.bt_start.alpha = this.ht(this.menfr.bt_start) ? 1 : 0.5;
               this.menfr.bt_back.alpha = this.ht(this.menfr.bt_back) ? 1 : 0.5;
               break;
            case 7:
               _loc1_ = 1;
               while(_loc1_ <= SD.curChallenge)
               {
                  if(_loc1_ != MatchSettings.caStage)
                  {
                     if(this.ht(this.menfr["bar" + _loc1_]))
                     {
                        this.menfr["bar" + _loc1_].gotoAndStop(2);
                     }
                     else
                     {
                        this.menfr["bar" + _loc1_].gotoAndStop(1);
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.menfr.bt_start.alpha = this.ht(this.menfr.bt_start) ? 1 : 0.5;
               this.menfr.bt_back.alpha = this.ht(this.menfr.bt_back) ? 1 : 0.5;
               break;
            case 8:
               _loc1_ = 1;
               while(_loc1_ <= 4)
               {
                  if(SD.selClass != _loc1_)
                  {
                     if(this.ht(this.menfr["bt_icon" + _loc1_]))
                     {
                        this.menfr["bt_icon" + _loc1_].alpha = 0.8;
                     }
                     else
                     {
                        this.menfr["bt_icon" + _loc1_].alpha = 0.5;
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               _loc1_ = 1;
               while(_loc1_ <= 5)
               {
                  if(SD.classSaves[SD.selClass].skin != _loc1_)
                  {
                     if(this.ht(this.menfr["bt_color" + _loc1_]))
                     {
                        this.menfr["bt_color" + _loc1_].alpha = 0.8;
                     }
                     else
                     {
                        this.menfr["bt_color" + _loc1_].alpha = 0.5;
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               _loc2_ = Stats_Classes.getClass(SD.selClass,SD.classSaves[SD.selClass].level);
               this.menfr.bar_hp.width += (_loc2_.hp / 300 * 135 - this.menfr.bar_hp.width) * 0.3;
               this.menfr.bar_crit.width += (_loc2_.crit / 50 * 135 - this.menfr.bar_crit.width) * 0.3;
               this.menfr.bar_aim.width += (_loc2_.aim / 130 * 135 - this.menfr.bar_aim.width) * 0.3;
               this.menfr.bar_amm.width += (_loc2_.amm / 300 * 135 - this.menfr.bar_amm.width) * 0.3;
               this.menfr.box_hp.width += (_loc2_.hpMax / 300 * 135 - this.menfr.box_hp.width) * 0.3;
               this.menfr.box_crit.width += (_loc2_.critMax / 50 * 135 - this.menfr.box_crit.width) * 0.3;
               this.menfr.box_aim.width += (_loc2_.aimMax / 130 * 135 - this.menfr.box_aim.width) * 0.3;
               this.menfr.box_amm.width += (_loc2_.ammMax / 300 * 135 - this.menfr.box_amm.width) * 0.3;
               this.tempOb.hp += (_loc2_.hp - this.tempOb.hp) * 0.5;
               this.tempOb.crit += (_loc2_.crit - this.tempOb.crit) * 0.5;
               this.tempOb.aim += (_loc2_.aim - this.tempOb.aim) * 0.5;
               this.tempOb.amm += (_loc2_.amm - this.tempOb.amm) * 0.5;
               this.menfr.txt_hp.text = Math.round(this.tempOb.hp) + "";
               this.menfr.txt_crit.text = Math.round(this.tempOb.crit) + "%";
               this.menfr.txt_aim.text = Math.round(this.tempOb.aim) + "%";
               this.menfr.txt_amm.text = Math.round(this.tempOb.amm) + "%";
               this.menfr.bt_primary.mc_gun.modStats();
               this.menfr.bt_secondary.mc_gun.modStats();
               if(this.ht(this.menfr.bt_primary.mc_gun))
               {
                  this.menfr.bt_primary.mc_gun.gotoAndStop(2);
               }
               else
               {
                  this.menfr.bt_primary.mc_gun.gotoAndStop(1);
               }
               if(this.ht(this.menfr.bt_secondary.mc_gun))
               {
                  this.menfr.bt_secondary.mc_gun.gotoAndStop(2);
               }
               else
               {
                  this.menfr.bt_secondary.mc_gun.gotoAndStop(1);
               }
               if(this.ht(this.menfr.bt_skill))
               {
                  this.menfr.bt_skill.gotoAndStop(2);
               }
               else
               {
                  this.menfr.bt_skill.gotoAndStop(1);
               }
               if(this.ht(this.menfr.bt_killstreak))
               {
                  this.menfr.bt_killstreak.gotoAndStop(2);
               }
               else
               {
                  this.menfr.bt_killstreak.gotoAndStop(1);
               }
               break;
            case 9:
            case 10:
               this.menfr.scrollbar.EnterFrame(this.menfr);
               this.menfr.bt_gun.mc_gun.modStats();
               this.menfr.gunCont.y = this.menfr.gunMask.y + this.menfr.scrollbar.scrollPos * (this.menfr.gunMask.height - this.menfr.gunCont.height);
               _loc1_ = 0;
               while(_loc1_ < this.tempAr.length)
               {
                  if(this.tempAr[_loc1_].gun.id != this.tempStr)
                  {
                     if(this.ht(this.tempAr[_loc1_]) && this.ht(this.menfr.gunMask))
                     {
                        this.tempAr[_loc1_].gotoAndStop(2);
                     }
                     else
                     {
                        this.tempAr[_loc1_].gotoAndStop(1);
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.menfr.bt_back.alpha = this.ht(this.menfr.bt_back) ? 1 : 0.5;
               this.menfr.bt_equip.alpha = this.ht(this.menfr.bt_equip) ? 1 : 0.5;
               break;
            case 11:
               this.menfr.scrollbar.EnterFrame(this.menfr);
               this.menfr.gunCont.y = this.menfr.gunMask.y + this.menfr.scrollbar.scrollPos * (this.menfr.gunMask.height - this.menfr.gunCont.height);
               _loc1_ = 0;
               while(_loc1_ < this.tempAr.length)
               {
                  if(this.tempAr[_loc1_].skill.id != this.tempStr)
                  {
                     if(this.ht(this.tempAr[_loc1_]) && this.ht(this.menfr.gunMask))
                     {
                        this.tempAr[_loc1_].gotoAndStop(2);
                     }
                     else
                     {
                        this.tempAr[_loc1_].gotoAndStop(1);
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.menfr.bt_back.alpha = this.ht(this.menfr.bt_back) ? 1 : 0.5;
               this.menfr.bt_equip.alpha = this.ht(this.menfr.bt_equip) ? 1 : 0.5;
               break;
            case 12:
               this.menfr.scrollbar.EnterFrame(this.menfr);
               this.menfr.gunCont.y = this.menfr.gunMask.y + this.menfr.scrollbar.scrollPos * (this.menfr.gunMask.height - this.menfr.gunCont.height);
               _loc1_ = 0;
               while(_loc1_ < this.tempAr.length)
               {
                  if(this.tempAr[_loc1_].streak.id != this.tempStr)
                  {
                     if(this.ht(this.tempAr[_loc1_]) && this.ht(this.menfr.gunMask))
                     {
                        this.tempAr[_loc1_].gotoAndStop(2);
                     }
                     else
                     {
                        this.tempAr[_loc1_].gotoAndStop(1);
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               this.menfr.bt_back.alpha = this.ht(this.menfr.bt_back) ? 1 : 0.5;
               this.menfr.bt_equip.alpha = this.ht(this.menfr.bt_equip) ? 1 : 0.5;
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
         if(Boolean(this.menfr.logo1) && Boolean(this.menfr.logo2))
         {
            SD.pressLogos(this,this.menfr.logo1,this.menfr.logo2);
         }
         _loc1_ = 0;
         while(_loc1_ < this.tabbuts.length)
         {
            if(!(this.curTab == this.tabbuts[_loc1_] && this.tabbuts[_loc1_] != "play"))
            {
               if(this.ht(this.menfr["btn_" + this.tabbuts[_loc1_]]))
               {
                  this.curTab = this.tabbuts[_loc1_];
                  this.menfr.gotoAndStop(this.tabbuts[_loc1_]);
                  SD.saveGame();
                  if(this.curTab == "soldiers")
                  {
                     switch(SD.selClass)
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
                        default:
                           §§push(4);
                     }
                     2;
                     switch(§§pop())
                     {
                        case 0:
                           SH.playVoice(UT.randEl([V_Medic1,V_Medic2]));
                           break;
                        case 1:
                           SH.playVoice(UT.randEl([V_Sniper1,V_Sniper2]));
                           break;
                        case 2:
                           SH.playVoice(UT.randEl([V_Soldier1,V_Soldier2]));
                           break;
                        case 3:
                           SH.playVoice(UT.randEl([V_Tank1,V_Tank2,V_Tank3]));
                     }
                  }
                  SH.playSound(S_Click,true);
               }
            }
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         switch(this.curLabel)
         {
            case "play":
               §§push(0);
               break;
            case "name":
               §§push(1);
               break;
            case "toquickmatch":
               §§push(2);
               break;
            case "tochallenges":
               §§push(3);
               break;
            case "quickmatch":
               §§push(4);
               break;
            case "campaign":
               §§push(5);
               break;
            case "challenges":
               §§push(6);
               break;
            case "soldiers":
               §§push(7);
               break;
            case "primary":
               §§push(8);
               break;
            case "secondary":
               §§push(9);
               break;
            case "skill":
               §§push(10);
               break;
            case "killstreak":
               §§push(11);
               break;
            case "options":
               §§push(12);
               break;
            default:
               §§push(13);
         }
         2;
         switch(§§pop())
         {
            case 0:
               if(this.ht(this.menfr.bt_campaign))
               {
                  SH.playSound(S_Click,true);
                  this.menfr.gotoAndStop("campaign");
               }
               if(this.ht(this.menfr.bt_challenges))
               {
                  SH.playSound(S_Click,true);
                  this.menfr.gotoAndStop("challenges");
               }
               if(this.ht(this.menfr.bt_quickmatch))
               {
                  SH.playSound(S_Click,true);
                  this.menfr.gotoAndStop("quickmatch");
               }
               if(Main.DEBUGMODE)
               {
                  if(this.ht(this.menfr.bt_ucamp))
                  {
                     SH.playSound(S_Equip);
                     SD.curCampaign = 15;
                  }
                  if(this.ht(this.menfr.bt_uchal))
                  {
                     SH.playSound(S_Equip);
                     SD.curChallenge = 15;
                  }
                  if(this.ht(this.menfr.bt_msold))
                  {
                     SH.playSound(S_Equip);
                     SD.classSaves[1].level = 50;
                     SD.classSaves[2].level = 50;
                     SD.classSaves[3].level = 50;
                     SD.classSaves[4].level = 50;
                  }
                  if(this.ht(this.menfr.bt_mfund))
                  {
                     SH.playSound(S_Equip);
                     SD.classSaves[1].funds = 999999;
                     SD.classSaves[2].funds = 999999;
                     SD.classSaves[3].funds = 999999;
                     SD.classSaves[4].funds = 999999;
                  }
                  if(this.ht(this.menfr.bt_reset))
                  {
                     SH.playSound(S_rocketExplode);
                     SD.eraseGame();
                     SD.Init();
                     this.menfr.txt_name.text = "Player";
                  }
               }
               break;
            case 1:
               if(this.ht(this.menfr.bt_continue))
               {
                  SH.playSound(S_Click,true);
                  this.menfr.gotoAndStop("home");
               }
               break;
            case 2:
               if(this.ht(this.menfr.bt_goto))
               {
                  SH.playSound(S_Click,true);
                  this.menfr.gotoAndStop("campaign");
               }
               if(this.ht(this.menfr.bt_continue))
               {
                  SH.playSound(S_Click,true);
                  this.menfr.gotoAndStop("quickmatch");
               }
               break;
            case 3:
               if(this.ht(this.menfr.bt_goto))
               {
                  SH.playSound(S_Click,true);
                  this.menfr.gotoAndStop("campaign");
               }
               if(this.ht(this.menfr.bt_continue))
               {
                  SH.playSound(S_Click,true);
                  this.menfr.gotoAndStop("challenges");
               }
               break;
            case 4:
               _loc1_ = 0;
               while(_loc1_ < Stats_Misc.gameModes.length)
               {
                  if(Stats_Misc.gameModes[_loc1_] != MatchSettings.qmMode)
                  {
                     if(this.ht(this.menfr["mc_icon" + _loc1_]))
                     {
                        MatchSettings.qmMode = Stats_Misc.gameModes[_loc1_];
                        MatchSettings.qmScore = Stats_Misc.getGameMode(MatchSettings.qmMode).startscore;
                        this.Init();
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               _loc1_ = 0;
               do
               {
                  if(_loc1_ >= this.tempAr.length)
                  {
                     break;
                  }
                  if(!this.ht(this.menfr["bt_" + this.tempAr[_loc1_]]))
                  {
                     continue;
                  }
                  switch(this.tempAr[_loc1_])
                  {
                     case "pscore":
                        §§push(0);
                        break;
                     case "nscore":
                        §§push(1);
                        break;
                     case "psoldiers":
                        §§push(2);
                        break;
                     case "nsoldiers":
                        §§push(3);
                        break;
                     case "pskills":
                        §§push(4);
                        break;
                     case "nskills":
                        §§push(5);
                        break;
                     case "pstreaks":
                        §§push(6);
                        break;
                     case "nstreaks":
                        §§push(7);
                        break;
                     case "pmod":
                        §§push(8);
                        break;
                     case "nmod":
                        §§push(9);
                        break;
                     case "pdiff":
                        §§push(10);
                        break;
                     case "ndiff":
                        §§push(11);
                        break;
                     default:
                        §§push(12);
                  }
                  2;
                  switch(§§pop())
                  {
                     case 0:
                        MatchSettings.qmScore = UT.getNextEl(MatchSettings.qmScore,false,this.tempOb.scorelist);
                        break;
                     case 1:
                        MatchSettings.qmScore = UT.getNextEl(MatchSettings.qmScore,true,this.tempOb.scorelist);
                        break;
                     case 2:
                        var _loc2_:MatchSettings = MatchSettings;
                        var _loc3_:Number = _loc2_.qmSoldiers - 1;
                        _loc2_.qmSoldiers = _loc3_;
                        if(MatchSettings.qmSoldiers < 0)
                        {
                           MatchSettings.qmSoldiers = 4;
                        }
                        break;
                     case 3:
                        _loc2_ = MatchSettings;
                        _loc3_ = _loc2_.qmSoldiers + 1;
                        _loc2_.qmSoldiers = _loc3_;
                        if(MatchSettings.qmSoldiers > 4)
                        {
                           MatchSettings.qmSoldiers = 0;
                        }
                        break;
                     case 4:
                     case 5:
                        MatchSettings.qmSkills = !MatchSettings.qmSkills;
                        break;
                     case 6:
                     case 7:
                        MatchSettings.qmStreaks = !MatchSettings.qmStreaks;
                        break;
                     case 8:
                        MatchSettings.qmMod = UT.getNextEl(MatchSettings.qmMod,false,Stats_Misc.mods);
                        break;
                     case 9:
                        MatchSettings.qmMod = UT.getNextEl(MatchSettings.qmMod,true,Stats_Misc.mods);
                        break;
                     case 10:
                        MatchSettings.qmDiff = UT.getNextEl(MatchSettings.qmDiff,false,[1,3,5,7,9]);
                        break;
                     case 11:
                        MatchSettings.qmDiff = UT.getNextEl(MatchSettings.qmDiff,true,[1,3,5,7,9]);
                  }
               }
               while(this.Init(), _loc1_++, 2 != 3);
               if(this.ht(this.menfr.mc_teams.bt_add0))
               {
                  MatchSettings.addBot(0);
                  trace("added");
                  this.Init();
               }
               if(this.ht(this.menfr.mc_teams.bt_add1))
               {
                  MatchSettings.addBot(1);
                  this.Init();
               }
               if(this.ht(this.menfr.mc_teams.bt_add2))
               {
                  MatchSettings.addBot(2);
                  this.Init();
               }
               if(this.ht(this.menfr.mc_teams.bt_rem0))
               {
                  MatchSettings.remBot(0);
                  this.Init();
               }
               if(this.ht(this.menfr.mc_teams.bt_rem1))
               {
                  MatchSettings.remBot(1);
                  this.Init();
               }
               if(this.ht(this.menfr.mc_teams.bt_rem2))
               {
                  MatchSettings.remBot(2);
                  this.Init();
               }
               if(this.ht(this.menfr.mc_map.bt_next))
               {
                  MatchSettings.qmMap = UT.getNextEl(MatchSettings.qmMap,true,Stats_Maps.mapOrder);
                  this.Init();
               }
               if(this.ht(this.menfr.mc_map.bt_prev))
               {
                  MatchSettings.qmMap = UT.getNextEl(MatchSettings.qmMap,false,Stats_Maps.mapOrder);
                  this.Init();
               }
               if(this.ht(this.menfr.bt_start))
               {
                  MatchSettings.startQuickmatch();
                  this.main.startClass(Game);
               }
               if(this.ht(this.menfr.bt_back))
               {
                  SH.playSound(S_Click,true);
                  CURPLAYLABEL = "";
                  this.menfr.gotoAndStop("play");
               }
               break;
            case 5:
               _loc1_ = 1;
               while(_loc1_ <= SD.curCampaign)
               {
                  if(this.ht(this.menfr["bar" + _loc1_]))
                  {
                     this.selectMission(_loc1_);
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               if(this.ht(this.menfr.bt_start))
               {
                  MatchSettings.startCampaign();
                  if(MatchSettings.preCutFrames)
                  {
                     this.main.startClass(Cutscene,{"type":"pre"});
                  }
                  else
                  {
                     this.main.startClass(Game);
                  }
               }
               if(this.ht(this.menfr.bt_back))
               {
                  SH.playSound(S_Click,true);
                  CURPLAYLABEL = "";
                  this.menfr.gotoAndStop("play");
               }
               break;
            case 6:
               _loc1_ = 1;
               while(_loc1_ <= SD.curChallenge)
               {
                  if(this.ht(this.menfr["bar" + _loc1_]))
                  {
                     this.selectMission(_loc1_);
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               if(this.ht(this.menfr.bt_start))
               {
                  MatchSettings.startCampaign();
                  if(MatchSettings.preCutFrames)
                  {
                     this.main.startClass(Cutscene,{"type":"pre"});
                  }
                  else
                  {
                     this.main.startClass(Game);
                  }
               }
               if(this.ht(this.menfr.bt_back))
               {
                  SH.playSound(S_Click,true);
                  CURPLAYLABEL = "";
                  this.menfr.gotoAndStop("play");
               }
               break;
            case 7:
               _loc1_ = 1;
               while(_loc1_ <= 4)
               {
                  if(SD.selClass != _loc1_)
                  {
                     if(this.ht(this.menfr["bt_icon" + _loc1_]))
                     {
                        SD.selClass = _loc1_;
                        switch(_loc1_)
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
                           default:
                              §§push(4);
                        }
                        2;
                        switch(§§pop())
                        {
                           case 0:
                              SH.playVoice(UT.randEl([V_Medic1,V_Medic2]));
                              break;
                           case 1:
                              SH.playVoice(UT.randEl([V_Sniper1,V_Sniper2]));
                              break;
                           case 2:
                              SH.playVoice(UT.randEl([V_Soldier1,V_Soldier2]));
                              break;
                           case 3:
                              SH.playVoice(UT.randEl([V_Tank1,V_Tank2,V_Tank3]));
                        }
                        this.Init();
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               _loc1_ = 1;
               while(_loc1_ <= 5)
               {
                  if(SD.classSaves[SD.selClass].skin != _loc1_)
                  {
                     if(this.ht(this.menfr["bt_color" + _loc1_]))
                     {
                        SD.classSaves[SD.selClass].skin = _loc1_;
                        this.Init();
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               if(this.ht(this.menfr.bt_primary.mc_gun))
               {
                  SH.playSound(S_Click,true);
                  this.menfr.gotoAndStop("primary");
                  return;
               }
               if(this.ht(this.menfr.bt_secondary.mc_gun))
               {
                  SH.playSound(S_Click,true);
                  this.menfr.gotoAndStop("secondary");
                  return;
               }
               if(this.ht(this.menfr.bt_skill))
               {
                  SH.playSound(S_Click,true);
                  this.menfr.gotoAndStop("skill");
                  return;
               }
               if(this.ht(this.menfr.bt_killstreak))
               {
                  SH.playSound(S_Click,true);
                  this.menfr.gotoAndStop("killstreak");
                  return;
               }
               break;
            case 8:
               this.menfr.scrollbar.MouseDown(this.menfr);
               _loc1_ = 0;
               while(_loc1_ < this.tempAr.length)
               {
                  if(this.tempAr[_loc1_].gun.id != this.tempStr)
                  {
                     if(this.ht(this.tempAr[_loc1_]) && this.ht(this.menfr.gunMask))
                     {
                        this.tempAr[_loc1_].gotoAndStop(3);
                        this.tempStr = this.tempAr[_loc1_].gun.id;
                        this.menfr.bt_gun.mc_gun.setGun(this.tempAr[_loc1_].gun,"",this.menfr);
                        if(SD.classSaves[SD.selClass].primary == this.tempAr[_loc1_].gun.id)
                        {
                           this.menfr.bt_equip.textColor = 13421772;
                           this.menfr.bt_equip.text = "Equipped";
                        }
                        else if(SD.classSaves[SD.selClass].level < this.tempAr[_loc1_].gun.lvlReq)
                        {
                           this.menfr.bt_equip.textColor = 16750899;
                           this.menfr.bt_equip.text = "Req lvl " + this.tempAr[_loc1_].gun.lvlReq;
                        }
                        else if(SD.unlocks.indexOf(this.tempAr[_loc1_].gun.id) != -1)
                        {
                           this.menfr.bt_equip.textColor = 16777215;
                           this.menfr.bt_equip.text = "Equip";
                        }
                        else if(SD.classSaves[SD.selClass].funds < this.tempAr[_loc1_].gun.cost)
                        {
                           this.menfr.bt_equip.textColor = 16750899;
                           this.menfr.bt_equip.text = "Req $" + this.tempAr[_loc1_].gun.cost;
                        }
                        else
                        {
                           this.menfr.bt_equip.textColor = 16776960;
                           this.menfr.bt_equip.text = "Buy $" + this.tempAr[_loc1_].gun.cost;
                        }
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               if(this.ht(this.menfr.bt_back))
               {
                  SH.playSound(S_Click,true);
                  this.tempStr = "return";
                  this.menfr.gotoAndStop("soldiers");
                  return;
               }
               if(this.ht(this.menfr.bt_equip))
               {
                  if(this.menfr.bt_equip.text == "Equip")
                  {
                     SD.classSaves[SD.selClass].primary = this.tempStr;
                     this.tempStr = "return";
                     this.menfr.gotoAndStop("soldiers");
                     SH.playSound(S_Equip);
                  }
                  else if(this.menfr.bt_equip.text.substring(0,3) == "Buy" && SD.classSaves[SD.selClass].funds >= Stats_Guns.gunOb[this.tempStr].cost)
                  {
                     SD.classSaves[SD.selClass].funds -= Stats_Guns.gunOb[this.tempStr].cost;
                     SD.unlocks.push(this.tempStr);
                     SD.classSaves[SD.selClass].primary = this.tempStr;
                     this.tempStr = "return";
                     this.menfr.gotoAndStop("soldiers");
                     Stats_Guns.checkWeapMedal();
                     SH.playSound(S_Equip);
                  }
                  else
                  {
                     SH.playSound(S_Error);
                  }
                  return;
               }
               break;
            case 9:
               this.menfr.scrollbar.MouseDown(this.menfr);
               _loc1_ = 0;
               while(_loc1_ < this.tempAr.length)
               {
                  if(this.tempAr[_loc1_].gun.id != this.tempStr)
                  {
                     if(this.ht(this.tempAr[_loc1_]) && this.ht(this.menfr.gunMask))
                     {
                        this.tempAr[_loc1_].gotoAndStop(3);
                        this.tempStr = this.tempAr[_loc1_].gun.id;
                        this.menfr.bt_gun.mc_gun.setGun(this.tempAr[_loc1_].gun,"",this.menfr);
                        if(SD.classSaves[SD.selClass].secondary == this.tempAr[_loc1_].gun.id)
                        {
                           this.menfr.bt_equip.textColor = 13421772;
                           this.menfr.bt_equip.text = "Equipped";
                        }
                        else if(SD.classSaves[SD.selClass].level < this.tempAr[_loc1_].gun.lvlReq)
                        {
                           this.menfr.bt_equip.textColor = 16750899;
                           this.menfr.bt_equip.text = "Req lvl " + this.tempAr[_loc1_].gun.lvlReq;
                        }
                        else if(SD.unlocks.indexOf(this.tempAr[_loc1_].gun.id) != -1)
                        {
                           this.menfr.bt_equip.textColor = 16777215;
                           this.menfr.bt_equip.text = "Equip";
                        }
                        else if(SD.classSaves[SD.selClass].funds < this.tempAr[_loc1_].gun.cost)
                        {
                           this.menfr.bt_equip.textColor = 16750899;
                           this.menfr.bt_equip.text = "Req $" + this.tempAr[_loc1_].gun.cost;
                        }
                        else
                        {
                           this.menfr.bt_equip.textColor = 16776960;
                           this.menfr.bt_equip.text = "Buy $" + this.tempAr[_loc1_].gun.cost;
                        }
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               if(this.ht(this.menfr.bt_back))
               {
                  SH.playSound(S_Click,true);
                  this.tempStr = "return";
                  this.menfr.gotoAndStop("soldiers");
                  return;
               }
               if(this.ht(this.menfr.bt_equip))
               {
                  if(this.menfr.bt_equip.text == "Equip")
                  {
                     SD.classSaves[SD.selClass].secondary = this.tempStr;
                     this.tempStr = "return";
                     this.menfr.gotoAndStop("soldiers");
                     SH.playSound(S_Equip);
                  }
                  else if(this.menfr.bt_equip.text.substring(0,3) == "Buy" && SD.classSaves[SD.selClass].funds >= Stats_Guns.gunOb[this.tempStr].cost)
                  {
                     SD.classSaves[SD.selClass].funds -= Stats_Guns.gunOb[this.tempStr].cost;
                     SD.unlocks.push(this.tempStr);
                     SD.classSaves[SD.selClass].secondary = this.tempStr;
                     this.tempStr = "return";
                     this.menfr.gotoAndStop("soldiers");
                     SH.playSound(S_Equip);
                  }
                  else
                  {
                     SH.playSound(S_Error);
                  }
                  return;
               }
               break;
            case 10:
               this.menfr.scrollbar.MouseDown(this.menfr);
               _loc1_ = 0;
               while(_loc1_ < this.tempAr.length)
               {
                  if(this.tempAr[_loc1_].skill.id != this.tempStr)
                  {
                     if(this.ht(this.tempAr[_loc1_]) && this.ht(this.menfr.gunMask))
                     {
                        this.tempAr[_loc1_].gotoAndStop(3);
                        this.tempStr = this.tempAr[_loc1_].skill.id;
                        this.menfr.bt_skillbox.mc_skill.setSkill(this.tempAr[_loc1_].skill);
                        this.menfr.bt_skillbox.mc_skill.setText(this.menfr);
                        if(SD.classSaves[SD.selClass].skill == this.tempAr[_loc1_].skill.id)
                        {
                           this.menfr.bt_equip.textColor = 13421772;
                           this.menfr.bt_equip.text = "Equipped";
                        }
                        else if(SD.classSaves[SD.selClass].level < this.tempAr[_loc1_].skill.lvlReq)
                        {
                           this.menfr.bt_equip.textColor = 16750899;
                           this.menfr.bt_equip.text = "Req lvl " + this.tempAr[_loc1_].skill.lvlReq;
                        }
                        else if(SD.unlocks.indexOf(this.tempAr[_loc1_].skill.id) != -1)
                        {
                           this.menfr.bt_equip.textColor = 16777215;
                           this.menfr.bt_equip.text = "Equip";
                        }
                        else if(SD.classSaves[SD.selClass].funds < this.tempAr[_loc1_].skill.cost)
                        {
                           this.menfr.bt_equip.textColor = 16750899;
                           this.menfr.bt_equip.text = "Req $" + this.tempAr[_loc1_].skill.cost;
                        }
                        else
                        {
                           this.menfr.bt_equip.textColor = 16776960;
                           this.menfr.bt_equip.text = "Buy $" + this.tempAr[_loc1_].skill.cost;
                        }
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               if(this.ht(this.menfr.bt_back))
               {
                  SH.playSound(S_Click,true);
                  this.tempStr = "return";
                  this.menfr.gotoAndStop("soldiers");
                  return;
               }
               if(this.ht(this.menfr.bt_equip))
               {
                  if(this.menfr.bt_equip.text == "Equip")
                  {
                     SD.classSaves[SD.selClass].skill = this.tempStr;
                     this.tempStr = "return";
                     this.menfr.gotoAndStop("soldiers");
                     SH.playSound(S_Equip);
                  }
                  else if(this.menfr.bt_equip.text.substring(0,3) == "Buy" && SD.classSaves[SD.selClass].funds >= Stats_Skills.skillOb[this.tempStr].cost)
                  {
                     SD.classSaves[SD.selClass].funds -= Stats_Skills.skillOb[this.tempStr].cost;
                     SD.unlocks.push(this.tempStr);
                     SD.classSaves[SD.selClass].skill = this.tempStr;
                     this.tempStr = "return";
                     if(SD.unlocks.indexOf(Stats_Skills.classAr[SD.selClass][1].id) != -1 && SD.unlocks.indexOf(Stats_Skills.classAr[SD.selClass][2].id) != -1 && SD.unlocks.indexOf(Stats_Skills.classAr[SD.selClass][3].id) != -1 && SD.unlocks.indexOf(Stats_Skills.classAr[SD.selClass][4].id) != -1)
                     {
                        Stats_Achievements.setAchievement("allskills");
                     }
                     this.menfr.gotoAndStop("soldiers");
                     SH.playSound(S_Equip);
                  }
                  else
                  {
                     SH.playSound(S_Error);
                  }
                  return;
               }
               break;
            case 11:
               this.menfr.scrollbar.MouseDown(this.menfr);
               _loc1_ = 0;
               while(_loc1_ < this.tempAr.length)
               {
                  if(this.tempAr[_loc1_].streak.id != this.tempStr)
                  {
                     if(this.ht(this.tempAr[_loc1_]) && this.ht(this.menfr.gunMask))
                     {
                        this.tempAr[_loc1_].gotoAndStop(3);
                        this.tempStr = this.tempAr[_loc1_].streak.id;
                        this.menfr.bt_skillbox.mc_skill.setStreak(this.tempAr[_loc1_].streak);
                        this.menfr.bt_skillbox.mc_skill.setText(this.menfr);
                        if(SD.classSaves[SD.selClass].streak == this.tempAr[_loc1_].streak.id)
                        {
                           this.menfr.bt_equip.textColor = 13421772;
                           this.menfr.bt_equip.text = "Equipped";
                        }
                        else if(SD.classSaves[SD.selClass].level < this.tempAr[_loc1_].streak.lvlReq)
                        {
                           this.menfr.bt_equip.textColor = 16750899;
                           this.menfr.bt_equip.text = "Req lvl " + this.tempAr[_loc1_].streak.lvlReq;
                        }
                        else if(SD.unlocks.indexOf(this.tempAr[_loc1_].streak.id) != -1)
                        {
                           this.menfr.bt_equip.textColor = 16777215;
                           this.menfr.bt_equip.text = "Equip";
                        }
                        else if(SD.classSaves[SD.selClass].funds < this.tempAr[_loc1_].streak.cost)
                        {
                           this.menfr.bt_equip.textColor = 16750899;
                           this.menfr.bt_equip.text = "Req $" + this.tempAr[_loc1_].streak.cost;
                        }
                        else
                        {
                           this.menfr.bt_equip.textColor = 16776960;
                           this.menfr.bt_equip.text = "Buy $" + this.tempAr[_loc1_].streak.cost;
                        }
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               if(this.ht(this.menfr.bt_back))
               {
                  SH.playSound(S_Click,true);
                  this.tempStr = "return";
                  this.menfr.gotoAndStop("soldiers");
                  return;
               }
               if(this.ht(this.menfr.bt_equip))
               {
                  if(this.menfr.bt_equip.text == "Equip")
                  {
                     SD.classSaves[SD.selClass].streak = this.tempStr;
                     this.tempStr = "return";
                     this.menfr.gotoAndStop("soldiers");
                     SH.playSound(S_Equip);
                  }
                  else if(this.menfr.bt_equip.text.substring(0,3) == "Buy" && SD.classSaves[SD.selClass].funds >= Stats_Streaks.streakOb[this.tempStr].cost)
                  {
                     SD.classSaves[SD.selClass].funds -= Stats_Streaks.streakOb[this.tempStr].cost;
                     SD.unlocks.push(this.tempStr);
                     SD.classSaves[SD.selClass].streak = this.tempStr;
                     this.tempStr = "return";
                     if(SD.unlocks.indexOf(Stats_Streaks.classAr[SD.selClass][1].id) != -1 && SD.unlocks.indexOf(Stats_Streaks.classAr[SD.selClass][2].id) != -1 && SD.unlocks.indexOf(Stats_Streaks.classAr[SD.selClass][3].id) != -1 && SD.unlocks.indexOf(Stats_Streaks.classAr[SD.selClass][4].id) != -1)
                     {
                        Stats_Achievements.setAchievement("allstreaks");
                     }
                     this.menfr.gotoAndStop("soldiers");
                     SH.playSound(S_Equip);
                  }
                  else
                  {
                     SH.playSound(S_Error);
                  }
                  return;
               }
               break;
            case 12:
               _loc1_ = 0;
               do
               {
                  if(_loc1_ >= this.tempAr.length)
                  {
                     break;
                  }
                  if(!this.tempAr[_loc1_].hitTestPoint(mouseX,mouseY,false))
                  {
                     continue;
                  }
                  if(this.tempAr[_loc1_].name.charAt(0) == "r")
                  {
                     this.tempAr[_loc1_].selected = true;
                  }
                  else
                  {
                     this.tempAr[_loc1_].enabled = false;
                     this.tempAr[_loc1_].selected = !this.tempAr[_loc1_].selected;
                  }
                  switch(this.tempAr[_loc1_].name)
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
                        SD.graphLights = this.menfr.cb_light.selected;
                        break;
                     case 7:
                        SD.music = this.menfr.cb_music.selected;
                        break;
                     case 8:
                        SD.sound = this.menfr.cb_sound.selected;
                        break;
                     case 9:
                        SD.voices = this.menfr.cb_voices.selected;
                        break;
                     case 10:
                        SD.screenShake = this.menfr.cb_shake.selected;
                        break;
                     case 11:
                        SD.screenBlood = this.menfr.cb_bloody.selected;
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
         }
      }
      
      public function selectMission(param1:*) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.menfr["bar" + param1].gotoAndStop(3);
         Stats_Campaign.setMatch(param1);
         this.menfr.mc_map.gotoAndStop(MatchSettings.caMap);
         this.menfr.txt_desc.text = MatchSettings.caDesc;
         this.menfr.txt_name.text = Stats_Maps.getMap(MatchSettings.caMap).name;
         this.menfr.txt_mapdesc.text = Stats_Maps.getMap(MatchSettings.caMap).desc;
         this.menfr.txt_mode.text = Stats_Misc.getGameMode(MatchSettings.caMode).name;
         this.menfr.txt_scoretype.text = Stats_Misc.getGameMode(MatchSettings.caMode).scoretype;
         this.menfr.txt_score.text = MatchSettings.caScore;
         this.menfr.txt_special.text = MatchSettings.caSpecial ? MatchSettings.caSpecial : "None";
         this.menfr.txt_diff.text = Stats_Classes.getDiffName(MatchSettings.caDiff);
         this.menfr.txt_recc.text = "Recommended Level: " + Stats_Classes.getReccLevel(MatchSettings.caDiff);
         this.menfr.mc_map.bt_prev.visible = this.menfr.mc_map.bt_next.visible = false;
      }
      
      public function ht(param1:*) : Boolean
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return Boolean(param1) && Boolean(param1.visible) && Boolean(param1.hitTestPoint(mouseX,mouseY,false));
      }
      
      public function MouseUp() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         switch(this.curLabel)
         {
            case "primary":
               §§push(0);
               break;
            case "secondary":
               §§push(1);
               break;
            case "skill":
               §§push(2);
               break;
            case "killstreak":
               §§push(3);
               break;
            case "options":
               §§push(4);
               break;
            default:
               §§push(5);
         }
         2;
         switch(§§pop())
         {
            case 0:
            case 1:
            case 2:
            case 3:
               this.menfr.scrollbar.MouseUp();
               break;
            case 4:
               _loc1_ = 0;
               while(_loc1_ < this.tempAr.length)
               {
                  this.tempAr[_loc1_].enabled = true;
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
         }
      }
      
      public function MouseWheel(param1:MouseEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         switch(this.curLabel)
         {
            case "primary":
               §§push(0);
               break;
            case "secondary":
               §§push(1);
               break;
            case "skill":
               §§push(2);
               break;
            case "killstreak":
               §§push(3);
               break;
            default:
               §§push(4);
         }
         2;
         switch(§§pop())
         {
            case 0:
            case 1:
            case 2:
            case 3:
               this.menfr.scrollbar.MouseUp();
               this.menfr.scrollbar.MouseWheel(param1);
         }
      }
      
      public function KeyDown(param1:KeyboardEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(Main.DEBUGMODE && param1.keyCode == 32)
         {
            SH.playSound(S_rocketExplode);
            SD.eraseGame();
            SD.Init();
            this.menfr.txt_name.text = "Player";
         }
      }
      
      public function KeyUp(param1:KeyboardEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
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
      }
      
      private function destroy() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

