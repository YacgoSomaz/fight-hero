package Box2D.Collision
{
   import Box2D.Common.b2internal;
   
   use namespace b2internal;
   
   public class b2ContactID
   {
      
      §§push(b2ContactID);
      if(37 == 34)
      {
         return;
      }
      
      public var features:Features;
      
      b2internal var _key:uint;
      
      public function b2ContactID()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.features = new Features();
         super();
         this.features._m_id = this;
      }
      
      public function Set(param1:b2ContactID) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.key = param1._key;
      }
      
      public function Copy() : b2ContactID
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:b2ContactID = new b2ContactID();
         _loc1_.key = this.key;
         return _loc1_;
      }
      
      public function get key() : uint
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this._key;
      }
      
      public function set key(param1:uint) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this._key = param1;
         this.features._referenceEdge = this._key & 0xFF;
         this.features._incidentEdge = (this._key & 0xFF00) >> 8 & 0xFF;
         this.features._incidentVertex = (this._key & 0xFF0000) >> 16 & 0xFF;
         this.features._flip = (this._key & 0xFF000000) >> 24 & 0xFF;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

