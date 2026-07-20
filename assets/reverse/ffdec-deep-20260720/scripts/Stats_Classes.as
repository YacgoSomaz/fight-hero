package
{
   public class Stats_Classes
   {
      
      public static var classNums:Array;
      
      §§push(Stats_Classes);
      if(37 == 34)
      {
         return;
      }
      
      public function Stats_Classes()
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
         classNums = ["rand","medic","sniper","soldier","tank"];
      }
      
      public static function getClass(param1:uint, param2:uint = 1) : Object
      {
         var _loc3_:Object = {};
         switch(param1)
         {
            case 0:
               _loc3_.num = 0;
               _loc3_.name = "Random";
               _loc3_.id = _loc3_.icon = "rand";
               break;
            case 1:
               _loc3_.num = 1;
               _loc3_.name = "Medic";
               _loc3_.id = _loc3_.icon = "medic";
               _loc3_.startFrame = 50;
               _loc3_.hpMin = 85;
               _loc3_.critMin = 6;
               _loc3_.aimMin = 70;
               _loc3_.ammMin = 90;
               _loc3_.hpMax = 190;
               _loc3_.critMax = 30;
               _loc3_.aimMax = 110;
               _loc3_.ammMax = 190;
               _loc3_.runType = 1;
               break;
            case 2:
               _loc3_.num = 2;
               _loc3_.name = "Assassin";
               _loc3_.id = _loc3_.icon = "sniper";
               _loc3_.startFrame = 0;
               _loc3_.hpMin = 70;
               _loc3_.critMin = 10;
               _loc3_.aimMin = 80;
               _loc3_.ammMin = 65;
               _loc3_.hpMax = 140;
               _loc3_.critMax = 50;
               _loc3_.aimMax = 130;
               _loc3_.ammMax = 130;
               _loc3_.runType = 1;
               break;
            case 3:
               _loc3_.num = 3;
               _loc3_.name = "Commando";
               _loc3_.id = _loc3_.icon = "soldier";
               _loc3_.startFrame = 150;
               _loc3_.hpMin = 100;
               _loc3_.critMin = 4;
               _loc3_.aimMin = 60;
               _loc3_.ammMin = 130;
               _loc3_.hpMax = 230;
               _loc3_.critMax = 20;
               _loc3_.aimMax = 90;
               _loc3_.ammMax = 300;
               _loc3_.runType = 2;
               break;
            case 4:
               _loc3_.num = 4;
               _loc3_.name = "Tank";
               _loc3_.id = _loc3_.icon = "tank";
               _loc3_.startFrame = 100;
               _loc3_.hpMin = 130;
               _loc3_.critMin = 2;
               _loc3_.aimMin = 55;
               _loc3_.ammMin = 100;
               _loc3_.hpMax = 300;
               _loc3_.critMax = 10;
               _loc3_.aimMax = 80;
               _loc3_.ammMax = 230;
               _loc3_.runType = 2;
         }
         _loc3_.hp = _loc3_.hpMin + (_loc3_.hpMax - _loc3_.hpMin) / 49 * (param2 - 1);
         _loc3_.crit = _loc3_.critMin + (_loc3_.critMax - _loc3_.critMin) / 49 * (param2 - 1);
         _loc3_.aim = _loc3_.aimMin + (_loc3_.aimMax - _loc3_.aimMin) / 49 * (param2 - 1);
         _loc3_.amm = _loc3_.ammMin + (_loc3_.ammMax - _loc3_.ammMin) / 49 * (param2 - 1);
         return _loc3_;
      }
      
      public static function getNextExp(param1:uint) : uint
      {
         return param1 * param1 * 3 + 40;
      }
      
      public static function getUnitExp(param1:uint) : uint
      {
         return 4 + param1 * 1.4;
      }
      
      public static function getAiLevel(param1:int) : int
      {
         var _loc2_:int = param1 * 3 + UT.irand(-3,4);
         return _loc2_ > 0 ? _loc2_ : 1;
      }
      
      public static function getReccLevel(param1:int) : String
      {
         var _loc2_:int = (param1 - 1) * 3;
         if(_loc2_ <= 1)
         {
            _loc2_ = 1;
         }
         var _loc3_:int = (param1 + 1) * 3;
         return _loc2_ + "-" + _loc3_;
      }
      
      public static function getItemCost(param1:uint, param2:String = "") : uint
      {
         var _loc3_:* = param1 * param1 * 3.5 + param1 * 18;
         if(param2 == "skill")
         {
            _loc3_ *= 0.9;
            _loc3_ += 0;
         }
         if(param2 == "streak")
         {
            _loc3_ *= 1.1;
            _loc3_ += 50;
         }
         return Math.round(_loc3_ / 25) * 25;
      }
      
      public static function getDiffName(param1:uint) : String
      {
         return UT.getEl(param1,["-TEST-","Very Easy","Very Easy","Easy","Easy","Normal","Normal","Hard","Hard","Insane","Insane","Unreal","Unreal","Nightmare","Nightmare","Impossible"]);
      }
      
      public static function getLevelUnlock(param1:uint, param2:uint) : String
      {
         var _loc4_:uint = 0;
         var _loc3_:String = "";
         _loc4_ = 0;
         while(_loc4_ < Stats_Guns.classAr[param2].length)
         {
            if(Stats_Guns.classAr[param2][_loc4_].lvlReq == param1)
            {
               if(Stats_Guns.classAr[param2][_loc4_].typeName == "Melee")
               {
                  _loc3_ += "\nMelee Weapon Unlocked!";
               }
               else
               {
                  _loc3_ += "\n" + Stats_Guns.classAr[param2][_loc4_].typeName + " Unlocked!";
               }
               break;
            }
            _loc4_++;
         }
         _loc4_ = 0;
         while(_loc4_ < Stats_Guns.classAr[0].length)
         {
            if(Stats_Guns.classAr[0][_loc4_].lvlReq == param1)
            {
               _loc3_ += "\n" + Stats_Guns.classAr[0][_loc4_].typeName + " Unlocked!";
               break;
            }
            _loc4_++;
         }
         _loc4_ = 0;
         while(_loc4_ < Stats_Skills.classAr[param2].length)
         {
            if(Stats_Skills.classAr[SD.selClass][_loc4_].lvlReq == param1)
            {
               _loc3_ += "\nSkill Unlocked!";
               break;
            }
            _loc4_++;
         }
         _loc4_ = 0;
         while(_loc4_ < Stats_Streaks.classAr[param2].length)
         {
            if(Stats_Streaks.classAr[SD.selClass][_loc4_].lvlReq == param1)
            {
               _loc3_ += "\nKillstreak Unlocked!";
               break;
            }
            _loc4_++;
         }
         return _loc3_;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

