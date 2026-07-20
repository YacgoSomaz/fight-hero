package Box2D.Dynamics.Joints
{
   import Box2D.Common.Math.b2Vec2;
   
   public class b2Jacobian
   {
      
      §§push(b2Jacobian);
      if(37 == 34)
      {
         return;
      }
      
      public var linearA:b2Vec2;
      
      public var angularA:Number;
      
      public var linearB:b2Vec2;
      
      public var angularB:Number;
      
      public function b2Jacobian()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.linearA = new b2Vec2();
         this.linearB = new b2Vec2();
         super();
      }
      
      public function SetZero() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.linearA.SetZero();
         this.angularA = 0;
         this.linearB.SetZero();
         this.angularB = 0;
      }
      
      public function Set(param1:b2Vec2, param2:Number, param3:b2Vec2, param4:Number) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.linearA.SetV(param1);
         this.angularA = param2;
         this.linearB.SetV(param3);
         this.angularB = param4;
      }
      
      public function Compute(param1:b2Vec2, param2:Number, param3:b2Vec2, param4:Number) : Number
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this.linearA.x * param1.x + this.linearA.y * param1.y + this.angularA * param2 + (this.linearB.x * param3.x + this.linearB.y * param3.y) + this.angularB * param4;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

