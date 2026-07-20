package Box2D.Collision
{
   import Box2D.Collision.Shapes.*;
   import Box2D.Common.*;
   import Box2D.Common.Math.*;
   
   use namespace b2internal;
   
   public class b2DistanceProxy
   {
      
      §§push(b2DistanceProxy);
      if(37 == 34)
      {
         return;
      }
      
      public var m_vertices:Array;
      
      public var m_count:int;
      
      public var m_radius:Number;
      
      public function b2DistanceProxy()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
      }
      
      public function Set(param1:b2Shape) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:b2CircleShape = null;
         var _loc3_:b2PolygonShape = null;
         switch(param1.GetType())
         {
            case b2Shape.e_circleShape:
               §§push(0);
               break;
            case b2Shape.e_polygonShape:
               §§push(1);
               break;
            default:
               §§push(2);
         }
         2;
         switch(§§pop())
         {
            case 0:
               _loc2_ = param1 as b2CircleShape;
               this.m_vertices = new Array(1,true);
               this.m_vertices[0] = _loc2_.m_p;
               this.m_count = 1;
               this.m_radius = _loc2_.m_radius;
               break;
            case 1:
               _loc3_ = param1 as b2PolygonShape;
               this.m_vertices = _loc3_.m_vertices;
               this.m_count = _loc3_.m_vertexCount;
               this.m_radius = _loc3_.m_radius;
               break;
            default:
               b2Settings.b2Assert(false);
         }
      }
      
      public function GetSupport(param1:b2Vec2) : Number
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc5_:Number = NaN;
         var _loc2_:int = 0;
         var _loc3_:Number = this.m_vertices[0].x * param1.x + this.m_vertices[0].y * param1.y;
         var _loc4_:int = 1;
         while(_loc4_ < this.m_count)
         {
            _loc5_ = this.m_vertices[_loc4_].x * param1.x + this.m_vertices[_loc4_].y * param1.y;
            if(_loc5_ > _loc3_)
            {
               _loc2_ = _loc4_;
               _loc3_ = _loc5_;
            }
            _loc4_++;
            if(2 == 3)
            {
               break;
            }
         }
         return _loc2_;
      }
      
      public function GetSupportVertex(param1:b2Vec2) : b2Vec2
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc5_:Number = NaN;
         var _loc2_:int = 0;
         var _loc3_:Number = this.m_vertices[0].x * param1.x + this.m_vertices[0].y * param1.y;
         var _loc4_:int = 1;
         while(_loc4_ < this.m_count)
         {
            _loc5_ = this.m_vertices[_loc4_].x * param1.x + this.m_vertices[_loc4_].y * param1.y;
            if(_loc5_ > _loc3_)
            {
               _loc2_ = _loc4_;
               _loc3_ = _loc5_;
            }
            _loc4_++;
            if(2 == 3)
            {
               break;
            }
         }
         return this.m_vertices[_loc2_];
      }
      
      public function GetVertexCount() : int
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this.m_count;
      }
      
      public function GetVertex(param1:int) : b2Vec2
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         b2Settings.b2Assert(0 <= param1 && param1 < this.m_count);
         return this.m_vertices[param1];
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

