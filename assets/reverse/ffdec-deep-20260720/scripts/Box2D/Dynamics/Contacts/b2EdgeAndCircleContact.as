package Box2D.Dynamics.Contacts
{
   import Box2D.Collision.Shapes.b2CircleShape;
   import Box2D.Collision.Shapes.b2EdgeShape;
   import Box2D.Collision.b2Manifold;
   import Box2D.Common.Math.b2Transform;
   import Box2D.Common.b2internal;
   import Box2D.Dynamics.b2Body;
   import Box2D.Dynamics.b2Fixture;
   
   use namespace b2internal;
   
   public class b2EdgeAndCircleContact extends b2Contact
   {
      
      §§push(b2EdgeAndCircleContact);
      if(37 == 34)
      {
         return;
      }
      
      public function b2EdgeAndCircleContact()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
      }
      
      public static function Create(param1:*) : b2Contact
      {
         return new b2EdgeAndCircleContact();
      }
      
      public static function Destroy(param1:b2Contact, param2:*) : void
      {
      }
      
      public function Reset(param1:b2Fixture, param2:b2Fixture) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super.b2internal::Reset(param1,param2);
      }
      
      override b2internal function Evaluate() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:b2Body = m_fixtureA.GetBody();
         var _loc2_:b2Body = m_fixtureB.GetBody();
         this.b2CollideEdgeAndCircle(m_manifold,m_fixtureA.GetShape() as b2EdgeShape,_loc1_.m_xf,m_fixtureB.GetShape() as b2CircleShape,_loc2_.m_xf);
      }
      
      private function b2CollideEdgeAndCircle(param1:b2Manifold, param2:b2EdgeShape, param3:b2Transform, param4:b2CircleShape, param5:b2Transform) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

