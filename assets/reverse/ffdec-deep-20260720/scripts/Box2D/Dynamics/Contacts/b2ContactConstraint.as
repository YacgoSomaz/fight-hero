package Box2D.Dynamics.Contacts
{
   import Box2D.Collision.*;
   import Box2D.Common.*;
   import Box2D.Common.Math.*;
   import Box2D.Dynamics.*;
   
   use namespace b2internal;
   
   public class b2ContactConstraint
   {
      
      §§push(b2ContactConstraint);
      if(37 == 34)
      {
         return;
      }
      
      public var points:Array;
      
      public var localPlaneNormal:b2Vec2;
      
      public var localPoint:b2Vec2;
      
      public var normal:b2Vec2;
      
      public var normalMass:b2Mat22;
      
      public var K:b2Mat22;
      
      public var bodyA:b2Body;
      
      public var bodyB:b2Body;
      
      public var type:int;
      
      public var radius:Number;
      
      public var friction:Number;
      
      public var restitution:Number;
      
      public var pointCount:int;
      
      public var manifold:b2Manifold;
      
      public function b2ContactConstraint()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.localPlaneNormal = new b2Vec2();
         this.localPoint = new b2Vec2();
         this.normal = new b2Vec2();
         this.normalMass = new b2Mat22();
         this.K = new b2Mat22();
         super();
         this.points = new Array(b2Settings.b2_maxManifoldPoints);
         var _loc1_:int = 0;
         while(_loc1_ < b2Settings.b2_maxManifoldPoints)
         {
            this.points[_loc1_] = new b2ContactConstraintPoint();
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

