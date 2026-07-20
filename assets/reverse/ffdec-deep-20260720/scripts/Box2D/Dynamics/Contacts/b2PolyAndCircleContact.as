package Box2D.Dynamics.Contacts
{
   import Box2D.Collision.Shapes.b2CircleShape;
   import Box2D.Collision.Shapes.b2PolygonShape;
   import Box2D.Collision.Shapes.b2Shape;
   import Box2D.Collision.b2Collision;
   import Box2D.Common.b2Settings;
   import Box2D.Common.b2internal;
   import Box2D.Dynamics.b2Body;
   import Box2D.Dynamics.b2Fixture;
   
   use namespace b2internal;
   
   public class b2PolyAndCircleContact extends b2Contact
   {
      
      §§push(b2PolyAndCircleContact);
      if(37 == 34)
      {
         return;
      }
      
      public function b2PolyAndCircleContact()
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
         return new b2PolyAndCircleContact();
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
         b2Settings.b2Assert(param1.GetType() == b2Shape.e_polygonShape);
         b2Settings.b2Assert(param2.GetType() == b2Shape.e_circleShape);
      }
      
      override b2internal function Evaluate() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:b2Body = m_fixtureA.m_body;
         var _loc2_:b2Body = m_fixtureB.m_body;
         b2Collision.CollidePolygonAndCircle(m_manifold,m_fixtureA.GetShape() as b2PolygonShape,_loc1_.m_xf,m_fixtureB.GetShape() as b2CircleShape,_loc2_.m_xf);
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

