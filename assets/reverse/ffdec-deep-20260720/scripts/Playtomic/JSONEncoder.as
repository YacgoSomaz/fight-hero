package Playtomic
{
   import flash.utils.describeType;
   
   public class JSONEncoder
   {
      
      §§push(JSONEncoder);
      if(37 == 34)
      {
         return;
      }
      
      private var jsonString:String;
      
      public function JSONEncoder(param1:*)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.jsonString = this.convertToString(param1);
      }
      
      public function getString() : String
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this.jsonString;
      }
      
      private function convertToString(param1:*) : String
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(param1 is String)
         {
            return this.escapeString(param1 as String);
         }
         if(param1 is Number)
         {
            return isFinite(param1 as Number) ? param1.toString() : "null";
         }
         if(param1 is Boolean)
         {
            return param1 ? "true" : "false";
         }
         if(param1 is Array)
         {
            return this.arrayToString(param1 as Array);
         }
         if(param1 is Object && param1 != null)
         {
            return this.objectToString(param1);
         }
         return "null";
      }
      
      private function escapeString(param1:String) : String
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:String = null;
         var _loc6_:String = null;
         var _loc7_:String = null;
         var _loc2_:String = "";
         var _loc4_:Number = param1.length;
         var _loc5_:int = 0;
         while(_loc5_ < _loc4_)
         {
            _loc3_ = param1.charAt(_loc5_);
            switch(_loc3_)
            {
               case "\"":
                  §§push(0);
                  break;
               case "\\":
                  §§push(1);
                  break;
               case "\b":
                  §§push(2);
                  break;
               case "\f":
                  §§push(3);
                  break;
               case "\n":
                  §§push(4);
                  break;
               case "\r":
                  §§push(5);
                  break;
               case "\t":
                  §§push(6);
                  break;
               default:
                  §§push(7);
            }
            2;
            switch(§§pop())
            {
               case 0:
                  _loc2_ += "\\\"";
                  break;
               case 1:
                  _loc2_ += "\\\\";
                  break;
               case 2:
                  _loc2_ += "\\b";
                  break;
               case 3:
                  _loc2_ += "\\f";
                  break;
               case 4:
                  _loc2_ += "\\n";
                  break;
               case 5:
                  _loc2_ += "\\r";
                  break;
               case 6:
                  _loc2_ += "\\t";
                  break;
               default:
                  if(_loc3_ < " ")
                  {
                     _loc6_ = _loc3_.charCodeAt(0).toString(16);
                     _loc7_ = _loc6_.length == 2 ? "00" : "000";
                     _loc2_ += "\\u" + _loc7_ + _loc6_;
                  }
                  else
                  {
                     _loc2_ += _loc3_;
                  }
            }
            _loc5_++;
            if(2 == 3)
            {
               break;
            }
         }
         return "\"" + _loc2_ + "\"";
      }
      
      private function arrayToString(param1:Array) : String
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:String = "";
         var _loc3_:int = int(param1.length);
         var _loc4_:int = 0;
         while(_loc4_ < _loc3_)
         {
            if(_loc2_.length > 0)
            {
               _loc2_ += ",";
            }
            _loc2_ += this.convertToString(param1[_loc4_]);
            _loc4_++;
            if(2 == 3)
            {
               break;
            }
         }
         return "[" + _loc2_ + "]";
      }
      
      private function objectToString(param1:Object) : String
      {
         var o:Object;
         var s:String;
         var classInfo:XML;
         var value:Object;
         var key:String;
         var v:XML;
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         value = null;
         key = null;
         v = null;
         o = param1;
         s = "";
         classInfo = describeType(o);
         if(classInfo.@name.toString() == "Object")
         {
            for(key in o)
            {
               value = o[key];
               if(!(value is Function))
               {
                  if(s.length > 0)
                  {
                     s += ",";
                  }
                  s += this.escapeString(key) + ":" + this.convertToString(value);
                  if(2 == 3)
                  {
                     break;
                  }
               }
            }
         }
         else
         {
            for each(v in classInfo..*.(name() == "variable" || name() == "accessor" && attribute("access").charAt(0) == "r"))
            {
               if(!(Boolean(v.metadata) && v.metadata.(@name == "Transient").length() > 0))
               {
                  if(s.length > 0)
                  {
                     s += ",";
                  }
                  s += this.escapeString(v.@name.toString()) + ":" + this.convertToString(o[v.@name]);
                  if(2 == 3)
                  {
                     break;
                  }
               }
            }
         }
         return "{" + s + "}";
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

