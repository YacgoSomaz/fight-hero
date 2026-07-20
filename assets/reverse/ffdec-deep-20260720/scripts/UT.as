package
{
   import flash.geom.Point;
   import flash.text.TextField;
   import flash.utils.getDefinitionByName;
   
   public class UT
   {
      
      §§push(UT);
      if(37 == 34)
      {
         return;
      }
      
      public function UT()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
      }
      
      public static function rotateDirection(param1:Number, param2:Number) : int
      {
         return fixRotation(param2 - param1) > 0 ? 1 : -1;
      }
      
      public static function fixRotation(param1:Number) : Number
      {
         if(param1 > 180)
         {
            param1 -= 360;
         }
         if(param1 < -180)
         {
            param1 += 360;
         }
         return param1;
      }
      
      public static function fixRotation360(param1:Number) : Number
      {
         if(param1 > 360)
         {
            param1 -= 360;
         }
         if(param1 < 0)
         {
            param1 += 360;
         }
         return param1;
      }
      
      public static function rotateDistance(param1:Number, param2:Number) : Number
      {
         return fixRotation(param2 - param1);
      }
      
      public static function getDist(param1:Number, param2:Number, param3:Number, param4:Number) : Number
      {
         var _loc5_:Number = param1 - param3;
         var _loc6_:Number = param2 - param4;
         return Math.sqrt(_loc5_ * _loc5_ + _loc6_ * _loc6_);
      }
      
      public static function getRotation(param1:Number, param2:Number, param3:Number, param4:Number) : Number
      {
         var _loc8_:Number = NaN;
         var _loc5_:Number = param1 - param3;
         var _loc6_:Number = param2 - param4;
         var _loc7_:Number = Math.sqrt(_loc5_ * _loc5_ + _loc6_ * _loc6_);
         if(_loc6_ < 0)
         {
            _loc8_ = Math.PI * 2 - Math.acos(_loc5_ / _loc7_);
         }
         else
         {
            _loc8_ = Math.acos(_loc5_ / _loc7_);
         }
         return UT.fixRotation(_loc8_ * 180 / Math.PI - 90);
      }
      
      public static function randLinePoint(param1:Number, param2:Number, param3:Number, param4:Number) : Point
      {
         var _loc5_:Point = new Point();
         _loc5_.x = UT.rand(param1,param3);
         _loc5_.y = param2 + (_loc5_.x - param1) / (param3 - param1) * (param4 - param2);
         return _loc5_;
      }
      
      public static function rand(param1:Number, param2:Number) : Number
      {
         return Math.random() * (param2 - param1) + param1;
      }
      
      public static function irand(param1:int, param2:int) : int
      {
         return uint(Math.random() * (param2 - param1 + 1)) + param1;
      }
      
      public static function getOrdinal(param1:uint) : String
      {
         var _loc2_:String = null;
         if(param1 % 100 > 10 && param1 % 100 < 14)
         {
            _loc2_ = "th";
         }
         else
         {
            switch(param1 % 10)
            {
               case 0:
                  _loc2_ = "th";
                  break;
               case 1:
                  _loc2_ = "st";
                  break;
               case 2:
                  _loc2_ = "nd";
                  break;
               case 3:
                  _loc2_ = "rd";
                  break;
               default:
                  _loc2_ = "th";
            }
         }
         return param1 + _loc2_;
      }
      
      public static function fixFloat(param1:Number) : Number
      {
         return int(Math.round(param1 * 10)) / 10;
      }
      
      public static function getRatio(param1:int, param2:int) : String
      {
         var _loc3_:String = "UT Error";
         if(!param1 && !param2 || param1 == param2)
         {
            _loc3_ = "1 : 1";
         }
         else if(Boolean(param1) && !param2)
         {
            _loc3_ = param1 + " : 0";
         }
         else if(!param1 && Boolean(param2))
         {
            _loc3_ = "0 : " + param2;
         }
         else if(param1 > param2)
         {
            _loc3_ = Math.round(param1 / param2 * 100) / 100 + " : 1";
         }
         else if(param2 > param1)
         {
            _loc3_ = "1 : " + Math.round(param2 / param1 * 100) / 100;
         }
         return _loc3_;
      }
      
      public static function inBox(param1:Number, param2:Number, param3:Number, param4:Number, param5:Number, param6:Number) : Boolean
      {
         return param1 > Math.min(param3,param3 + param5) && param1 < Math.max(param3,param3 + param5) && param2 > Math.min(param4,param4 + param6) && param2 < Math.max(param4,param4 + param6);
      }
      
      public static function xMoveToRot(param1:Number, param2:Number) : Number
      {
         return param1 == 0 || param1 == 180 || param1 == -180 ? 0 : Math.sin(param1 * (Math.PI / 180)) * param2;
      }
      
      public static function yMoveToRot(param1:Number, param2:Number) : Number
      {
         return param1 == 90 || param1 == -90 ? 0 : Math.cos(param1 * (Math.PI / 180)) * -param2;
      }
      
      public static function randEl(param1:Array) : *
      {
         return param1[uint(Math.random() * param1.length)];
      }
      
      public static function getPosNegSign(param1:*) : int
      {
         return param1 >= 0 ? 1 : -1;
      }
      
      public static function wordWrap(param1:String, param2:TextField) : String
      {
         param2.text = param1;
         var _loc3_:uint = 0;
         var _loc4_:uint = 0;
         while(_loc4_ < param2.numLines - 1)
         {
            _loc3_ += param2.getLineLength(_loc4_);
            param1 = param1.substring(0,_loc3_ + _loc4_) + "\n" + param1.substring(_loc3_ + _loc4_);
            _loc4_++;
         }
         param2.text = "";
         return param1;
      }
      
      public static function rotBounceOff(param1:Number, param2:Number, param3:Number, param4:Number, param5:Number) : Number
      {
         var _loc6_:Number = UT.getRotation(param2,param3,param4,param5);
         var _loc7_:Number = UT.fixRotation(param1 - _loc6_);
         return UT.fixRotation(param1 - _loc7_ + 180);
      }
      
      public static function getSideFacing(param1:Number) : String
      {
         param1 = UT.fixRotation(param1);
         var _loc2_:String = "";
         if(param1 >= -45 && param1 <= 45)
         {
            _loc2_ = "up";
         }
         else if(param1 >= -135 && param1 <= -45)
         {
            _loc2_ = "left";
         }
         else if(param1 <= 135 && param1 >= 45)
         {
            _loc2_ = "right";
         }
         else
         {
            _loc2_ = "down";
         }
         return _loc2_;
      }
      
      public static function getTimeString(param1:uint, param2:Boolean) : String
      {
         var _loc3_:uint = param1 / 30 % 60;
         var _loc4_:uint = param1 / 30 / 60;
         return (param2 && _loc4_ < 10 ? "0" + _loc4_ : _loc4_) + ":" + (_loc3_ < 10 ? "0" + _loc3_ : _loc3_);
      }
      
      public static function replaceString(param1:String, param2:String, param3:String = "") : String
      {
         while(param1.indexOf(param2) != -1)
         {
            param1 = param1.replace(param2,param3);
         }
         return param1;
      }
      
      public static function mergeObject(param1:Object, param2:Object) : void
      {
         var _loc3_:String = null;
         for(_loc3_ in param2)
         {
            param1[_loc3_] = param2[_loc3_];
         }
      }
      
      public static function cloneObject(param1:Object) : Object
      {
         var _loc3_:String = null;
         var _loc2_:Object = {};
         for(_loc3_ in param1)
         {
            _loc2_[_loc3_] = param1[_loc3_];
         }
         return _loc2_;
      }
      
      public static function addNumCommas(param1:uint) : String
      {
         var _loc2_:String = "" + param1;
         var _loc3_:uint = uint(_loc2_.length);
         var _loc4_:uint = 0;
         while(_loc4_ < _loc2_.length)
         {
            if(_loc3_ < _loc2_.length && _loc3_ > 0)
            {
               _loc2_ = _loc2_.substring(0,_loc3_) + "," + _loc2_.substring(_loc3_);
            }
            _loc3_ -= 3;
            _loc4_ += 3;
         }
         return _loc2_;
      }
      
      public static function getEl(param1:uint, param2:Array) : *
      {
         return param2[param1];
      }
      
      public static function getNextEl(param1:*, param2:Boolean, param3:Array) : *
      {
         var _loc4_:int = param3.indexOf(param1);
         _loc4_ = _loc4_ + (param2 ? 1 : -1);
         if(_loc4_ == param3.length)
         {
            _loc4_ = 0;
         }
         if(_loc4_ < 0)
         {
            _loc4_ = param3.length - 1;
         }
         return param3[_loc4_];
      }
      
      public static function roundToDecimal(param1:Number, param2:uint) : Number
      {
         var _loc3_:uint = Math.pow(10,param2);
         return Math.round(param1 * _loc3_) / _loc3_;
      }
      
      public static function getPythagorean(param1:Number, param2:Number) : Number
      {
         return Math.sqrt(param1 * param1 + param2 * param2);
      }
      
      public static function coinFlip(param1:*, param2:*) : *
      {
         return Math.random() < 0.5 ? param1 : param2;
      }
      
      public static function stringToClass(param1:String) : Class
      {
         return getDefinitionByName(param1) as Class;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

