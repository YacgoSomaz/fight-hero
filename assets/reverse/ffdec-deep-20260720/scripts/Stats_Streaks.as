package
{
   public class Stats_Streaks
   {
      
      public static var streakOb:Object;
      
      public static var streakAr:Array;
      
      public static var classAr:Array;
      
      §§push(Stats_Streaks);
      if(37 == 34)
      {
         return;
      }
      
      public var id:String;
      
      public var sprite:String;
      
      public var name:String;
      
      public var global:Boolean;
      
      public var cost:int;
      
      public var lvlReq:uint;
      
      public var kills:Number;
      
      public var special:String;
      
      public var desc:String;
      
      public var allyUse:String;
      
      public var allySound:*;
      
      public var enemyUse:String;
      
      public var enemySound:*;
      
      public function Stats_Streaks()
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
         streakOb = {};
         streakAr = [];
         classAr = [];
         var _loc1_:uint = 0;
         while(_loc1_ < 5)
         {
            classAr.push([]);
            _loc1_++;
         }
         addStreak(0,"hotdog","none","None",false,0,1,0,"","No killstreak equipped.","",null,"",null);
         addStreak(1,"none","none","None",false,0,1,0,"","No killstreak equipped.","",null,"",null);
         addStreak(1,"surge","surge","Surge",false,0,3,3,"","Gain a sudden surge of power, increasing the damage you deal by 30%, while reducing the damage you take by 30% for 5 seconds.","",null,"",null);
         addStreak(1,"rapid","rapid","Rapid Regen",false,0,5,4,"","Give all allies rapid health regeneration for 8 seconds.","Health regeneration up!",V_k3,"Enemy is regenerating their health!",V_k4);
         addStreak(1,"vest","vest","Kevlar Vests",false,0,12,4,"","Equip the entire team with kevlar vests that block some damage.","Kevlar Vests out!",V_k5,"Enemy has a Kevlar Vests, focus fire!",V_k6);
         addStreak(1,"chopper","chopper","Attack Chopper",true,0,19,5,"*No effect on indoor maps*","An attack chopper follows you around for 10 seconds.","Chopper inbound!",V_k1,"Attack Chopper, take cover!",V_k2);
         addStreak(2,"none","none","None",false,0,1,0,"","No killstreak equipped.","",null,"",null);
         addStreak(2,"surge","surge","Surge",false,0,3,3,"","Gain a sudden surge of power, increasing the damage you deal by 30%, while reducing the damage you take by 30% for 5 seconds.","",null,"",null);
         addStreak(2,"smoke","smoke","Smoke Bomb",false,0,5,2,"","Throw down a smoke bomb and teleport to a new area.","",null,"",null);
         addStreak(2,"radar","radar","Full Radar",true,0,12,3,"","Grants vision of enemies on radar for 10 seconds.\nAllies will also be much more effective in combat.","Full Radar up, let \'em have it!",V_k7,"Enemy has Full Radar, stay sharp!",V_k8);
         addStreak(2,"chopper","chopper","Attack Chopper",true,0,19,5,"*No effect on indoor maps*","An attack chopper follows you around for 10 seconds.","Chopper inbound!",V_k1,"Attack Chopper, take cover!",V_k2);
         addStreak(3,"none","none","None",false,0,1,0,"","No killstreak equipped.","",null,"",null);
         addStreak(3,"surge","surge","Surge",false,0,3,3,"","Gain a sudden surge of power, increasing the damage you deal by 30%, while reducing the damage you take by 30% for 5 seconds.","",null,"",null);
         addStreak(3,"mine","mine","Bouncing Betty",false,0,5,2,"","Drop a landmine that launches into the air and explodes when an enemy comes near.\n\n(Moving while crouched will not activate the mine)","",null,"",null);
         addStreak(3,"gas","gas","Tear Gas",true,0,12,3,"","Fills the map with a thick tear gas for 8 seconds, making all enemies much less effective in combat.","Enemies are gassed, let \'em have it!",V_k11,"We\'ve been gassed, stay sharp!",V_k12);
         addStreak(3,"airstrike","airstrike","Air Strike",true,0,19,4,"*No effect on indoor maps*","Rain bombs from the sky.","Airstrike inbound!",V_k9,"Enemy Airstrike, take cover!",V_k10);
         addStreak(4,"none","none","None",false,0,1,0,"","No killstreak equipped.","",null,"",null);
         addStreak(4,"surge","surge","Surge",false,0,3,3,"","Gain a sudden surge of power, increasing the damage you deal by 30%, while reducing the damage you take by 30% for 5 seconds.","",null,"",null);
         addStreak(4,"fire","fire","Combustion",false,0,5,3,"","Burst into flames, dealing damage to everyone around you for 10 seconds.","HUUURRAAAAAAAGH!!",V_k15,"Enemy tank is on fire, literally!",V_k16);
         addStreak(4,"mirror","mirror","Ricochet",false,0,12,3,"","Reflect all bullets and projectiles for 5 seconds.","Quit hitting yourself!",V_k13,"Enemy tank reflecting bullets!",V_k14);
         addStreak(4,"airstrike","airstrike","Air Strike",true,0,19,4,"*No effect on indoor maps*","Rain bombs from the sky.","Airstrike inbound!",V_k9,"Enemy Airstrike, take cover!",V_k10);
      }
      
      public static function addStreak(param1:uint, param2:String, param3:String, param4:String, param5:Boolean, param6:int, param7:uint, param8:Number, param9:String, param10:String, param11:String, param12:*, param13:String, param14:*) : void
      {
         var _loc15_:Stats_Streaks = new Stats_Streaks();
         _loc15_.id = param2;
         _loc15_.sprite = param3;
         _loc15_.name = param4;
         _loc15_.global = param5;
         _loc15_.cost = param6;
         _loc15_.lvlReq = param7;
         _loc15_.kills = param8;
         _loc15_.special = param9;
         _loc15_.desc = param10;
         _loc15_.allyUse = param11;
         _loc15_.allySound = param12;
         _loc15_.enemyUse = param13;
         _loc15_.enemySound = param14;
         _loc15_.cost = Stats_Classes.getItemCost(param7,"streak");
         streakOb[param2] = _loc15_;
         streakAr.push(_loc15_);
         classAr[param1].push(_loc15_);
      }
      
      public static function getRandStreak(param1:Object) : String
      {
         var _loc2_:String = null;
         do
         {
            _loc2_ = UT.randEl(classAr[param1.soldier]).id;
         }
         while(streakOb[_loc2_].id == "none");
         return _loc2_;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

