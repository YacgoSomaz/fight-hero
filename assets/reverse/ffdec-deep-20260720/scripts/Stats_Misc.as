package
{
   public class Stats_Misc
   {
      
      public static var gameModes:Array;
      
      public static var mods:Array;
      
      §§push(Stats_Misc);
      if(37 == 34)
      {
         return;
      }
      
      public function Stats_Misc()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
      }
      
      public static function Init() : void
      {
         gameModes = ["dm","jug","tdm","ctf","dom"];
      }
      
      public static function buildModList() : void
      {
         mods = ["none","clips"];
         if(SD.achievements.indexOf(Stats_Achievements.achOrder.indexOf("drown")) != -1)
         {
            mods.push("ammo");
         }
         if(SD.achievements.indexOf(Stats_Achievements.achOrder.indexOf("lava")) != -1)
         {
            mods.push("party");
         }
         if(SD.achievements.indexOf(Stats_Achievements.achOrder.indexOf("plug")) != -1)
         {
            mods.push("sky9");
         }
         if(SD.achievements.indexOf(Stats_Achievements.achOrder.indexOf("tutbody")) != -1)
         {
            mods.push("bodypop");
         }
      }
      
      public static function getMod(param1:String) : Object
      {
         var _loc2_:Object = {"id":param1};
         switch(param1)
         {
            case "none":
               _loc2_.name = "None";
               _loc2_.desc = "No mod selected.";
               _loc2_.expmod = 1;
               break;
            case "sky9":
               _loc2_.name = "Sky9";
               _loc2_.desc = "Physics are exaggerated.";
               _loc2_.expmod = 1;
               break;
            case "clips":
               _loc2_.name = "Pack Mule";
               _loc2_.desc = "Infinite spare ammo.";
               _loc2_.expmod = 0.3;
               break;
            case "ammo":
               _loc2_.name = "Bottomless Clip";
               _loc2_.desc = "Infinite ammo, no reloads.";
               _loc2_.expmod = 0.1;
               break;
            case "party":
               _loc2_.name = "Party Time";
               _loc2_.desc = "Random weapons, every spawn.";
               _loc2_.expmod = 0.4;
               break;
            case "bodypop":
               _loc2_.name = "Tin Man";
               _loc2_.desc = "Joints are held on with glue.";
               _loc2_.expmod = 1;
         }
         if(_loc2_.expmod == 1)
         {
            _loc2_.exp = "";
         }
         else
         {
            _loc2_.exp = "This modifier gives -" + (100 - _loc2_.expmod * 100) + "% Exp";
         }
         return _loc2_;
      }
      
      public static function getGameMode(param1:String) : Object
      {
         var _loc2_:Object = {"id":param1};
         _loc2_.sprite = param1;
         switch(param1)
         {
            case "dm":
               _loc2_.name = "Deathmatch";
               _loc2_.desc = "Kill enough enemies to reach the score limit.";
               _loc2_.scoretype = "Kills to win";
               _loc2_.startscore = 10;
               _loc2_.scorelist = [5,10,15,25,50];
               _loc2_.teams = 1;
               break;
            case "tdm":
               _loc2_.name = "Team Deathmatch";
               _loc2_.desc = "Kill enough enemies with your team to reach the score limit.";
               _loc2_.scoretype = "Kills to win";
               _loc2_.startscore = 25;
               _loc2_.scorelist = [10,15,25,50,100];
               _loc2_.teams = 2;
               break;
            case "ctf":
               _loc2_.name = "Capture the Flag";
               _loc2_.desc = "Capture the enemy\'s flag and bring it to your base.";
               _loc2_.scoretype = "Flags to win";
               _loc2_.startscore = 3;
               _loc2_.scorelist = [3,5,7,15];
               _loc2_.teams = 2;
               break;
            case "dom":
               _loc2_.name = "Domination";
               _loc2_.desc = "Capture enemy zones and hold them to gain points.";
               _loc2_.scoretype = "Points to win";
               _loc2_.startscore = 50;
               _loc2_.scorelist = [50,75,100,150,200];
               _loc2_.teams = 2;
               break;
            case "jug":
               _loc2_.name = "Juggernaut";
               _loc2_.desc = "Work as a team to kill the Juggernaut. Kill him: become him.";
               _loc2_.scoretype = "Kills to win";
               _loc2_.startscore = 10;
               _loc2_.scorelist = [5,10,25,50,100];
               _loc2_.teams = 1;
               break;
            case "zom":
               _loc2_.name = "Outbreak";
               _loc2_.desc = "Survive the zombies. Get killed by one, and become one.";
               _loc2_.scoretype = "Survivals";
               _loc2_.startscore = 10;
               _loc2_.scorelist = [5,10,25,50,100];
               _loc2_.teams = 1;
         }
         return _loc2_;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

