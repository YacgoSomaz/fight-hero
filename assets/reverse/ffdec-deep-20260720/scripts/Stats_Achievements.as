package
{
   import Playtomic.*;
   import flash.display.MovieClip;
   import flash.text.TextField;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol716")]
   public class Stats_Achievements extends MovieClip
   {
      
      public static var achOrder:Array;
      
      public static var ach:Stats_Achievements;
      
      §§push(Stats_Achievements);
      if(37 == 34)
      {
         return;
      }
      
      public var icon:MovieClip;
      
      public var txt_desc:TextField;
      
      public var txt_name:TextField;
      
      public var txt_unlock:TextField;
      
      public function Stats_Achievements()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         addFrameScript(0,this.frame1);
         stop();
         Stats_Achievements.ach = this;
      }
      
      public static function Init() : void
      {
         achOrder = ["campaign","challenges","level50","allguns","allstreaks","allskills","plug","lava","drown","tutbody"];
      }
      
      public static function getAchievementNum(param1:*) : Object
      {
         return getAchievement(achOrder[param1]);
      }
      
      public static function getAchievement(param1:String) : Object
      {
         var _loc2_:Object = {};
         _loc2_.id = param1;
         _loc2_.sprite = param1;
         switch(param1)
         {
            case "campaign":
               _loc2_.name = "The End?";
               _loc2_.desc = "Complete the Campaign.";
               break;
            case "challenges":
               _loc2_.name = "Strike Force Hero";
               _loc2_.desc = "Defeat the creators of the game.";
               break;
            case "level50":
               _loc2_.name = "Maxed";
               _loc2_.desc = "Reach level 50 with any soldier.";
               break;
            case "allguns":
               _loc2_.name = "Guns and Ammo";
               _loc2_.desc = "Buy all primary guns with any soldier.";
               break;
            case "allstreaks":
               _loc2_.name = "Streaking";
               _loc2_.desc = "Buy all killstreaks with any soldier.";
               break;
            case "allskills":
               _loc2_.name = "Skilled";
               _loc2_.desc = "Buy all skills with any soldier.";
               break;
            case "plug":
               _loc2_.name = "Human Plug";
               _loc2_.desc = "Hold the flow.";
               _loc2_.unlock = "sky9";
               _loc2_.secret = true;
               break;
            case "lava":
               _loc2_.name = "Embarassing!";
               _loc2_.desc = "Die by falling lava during your killstreak.";
               _loc2_.unlock = "party";
               _loc2_.secret = true;
               break;
            case "drown":
               _loc2_.name = "Waterwings";
               _loc2_.desc = "Drown in the dirty water.";
               _loc2_.unlock = "ammo";
               _loc2_.secret = true;
               break;
            case "tutbody":
               _loc2_.name = "Detective";
               _loc2_.desc = "Investigate the facility.";
               _loc2_.unlock = "bodypop";
               _loc2_.secret = true;
         }
         return _loc2_;
      }
      
      private static function idToNum(param1:String) : uint
      {
         return achOrder.indexOf(param1);
      }
      
      public static function setAchievement(param1:*) : void
      {
         var _loc2_:uint = idToNum(param1);
         if(SD.achievements.indexOf(_loc2_) != -1)
         {
            return;
         }
         var _loc3_:Object = getAchievement(param1);
         SD.achievements.push(_loc2_);
         SH.playSound(S_Medal,true);
         SD.saveGame();
         trace("Got achievement",_loc3_.name);
         Log.CustomMetric(_loc3_.name,"Achievemens");
         ach.icon.gotoAndStop(_loc3_.sprite);
         ach.txt_name.text = _loc3_.name;
         ach.txt_desc.text = _loc3_.desc;
         ach.txt_unlock.text = _loc3_.unlock ? Stats_Misc.getMod(_loc3_.unlock).name + " mod unlocked!" : "";
         ach.gotoAndPlay(2);
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

