package Box2D.Dynamics
{
   import Box2D.Collision.Shapes.b2Shape;
   
   public class b2FixtureDef
   {
      
      §§push(b2FixtureDef);
      if(37 == 34)
      {
         return;
      }
      
      public var shape:b2Shape;
      
      public var userData:*;
      
      public var friction:Number;
      
      public var restitution:Number;
      
      public var density:Number;
      
      public var isSensor:Boolean;
      
      public var filter:b2FilterData;
      
      public function b2FixtureDef()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.filter = new b2FilterData();
         super();
         this.shape = null;
         this.userData = null;
         this.friction = 0.2;
         this.restitution = 0;
         this.density = 0;
         this.filter.categoryBits = 1;
         this.filter.maskBits = 65535;
         this.filter.groupIndex = 0;
         this.isSensor = false;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

