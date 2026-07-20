package mochi.as3
{
   public final class MochiDigits
   {
      
      §§push(MochiDigits);
      if(37 == 34)
      {
         return;
      }
      
      private var Fragment:Number;
      
      private var Sibling:MochiDigits;
      
      private var Encoder:Number;
      
      public function MochiDigits(param1:Number = 0, param2:uint = 0)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.Encoder = 0;
         this.setValue(param1,param2);
      }
      
      public function get value() : Number
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return Number(this.toString());
      }
      
      public function set value(param1:Number) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.setValue(param1);
      }
      
      public function addValue(param1:Number) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.value += param1;
      }
      
      public function setValue(param1:Number = 0, param2:uint = 0) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:String = param1.toString();
         §§push(this);
         §§push(_loc3_);
         var _temp_1:* = param2;
         §§pop().Fragment = §§pop().charCodeAt(param2++) ^ this.Encoder;
         if(param2 < _loc3_.length)
         {
            this.Sibling = new MochiDigits(param1,param2);
         }
         else
         {
            this.Sibling = null;
         }
         this.reencode();
      }
      
      public function reencode() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = uint(int(2147483647 * Math.random()));
         this.Fragment ^= _loc1_ ^ this.Encoder;
         this.Encoder = _loc1_;
      }
      
      public function toString() : String
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:String = String.fromCharCode(this.Fragment ^ this.Encoder);
         if(this.Sibling != null)
         {
            _loc1_ += this.Sibling.toString();
         }
         return _loc1_;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

