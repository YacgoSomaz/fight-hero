package Box2D.Common
{
   import Box2D.Common.Math.b2Math;
   
   public class b2Color
   {
      
      §§push(b2Color);
      if(37 == 34)
      {
         return;
      }
      
      private var _r:uint = 0;
      
      private var _g:uint = 0;
      
      private var _b:uint = 0;
      
      public function b2Color(param1:Number, param2:Number, param3:Number)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this._r = uint(255 * b2Math.Clamp(param1,0,1));
         this._g = uint(255 * b2Math.Clamp(param2,0,1));
         this._b = uint(255 * b2Math.Clamp(param3,0,1));
      }
      
      public function Set(param1:Number, param2:Number, param3:Number) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this._r = uint(255 * b2Math.Clamp(param1,0,1));
         this._g = uint(255 * b2Math.Clamp(param2,0,1));
         this._b = uint(255 * b2Math.Clamp(param3,0,1));
      }
      
      public function set r(param1:Number) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this._r = uint(255 * b2Math.Clamp(param1,0,1));
      }
      
      public function set g(param1:Number) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this._g = uint(255 * b2Math.Clamp(param1,0,1));
      }
      
      public function set b(param1:Number) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this._b = uint(255 * b2Math.Clamp(param1,0,1));
      }
      
      public function get color() : uint
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this._r << 16 | this._g << 8 | this._b;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

