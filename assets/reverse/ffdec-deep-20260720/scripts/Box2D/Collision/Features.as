package Box2D.Collision
{
   import Box2D.Common.b2internal;
   
   use namespace b2internal;
   
   public class Features
   {
      
      §§push(Features);
      if(37 == 34)
      {
         return;
      }
      
      b2internal var _referenceEdge:int;
      
      b2internal var _incidentEdge:int;
      
      b2internal var _incidentVertex:int;
      
      b2internal var _flip:int;
      
      b2internal var _m_id:b2ContactID;
      
      public function Features()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
      }
      
      public function get referenceEdge() : int
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this._referenceEdge;
      }
      
      public function set referenceEdge(param1:int) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this._referenceEdge = param1;
         this._m_id._key = this._m_id._key & 0xFFFFFF00 | this._referenceEdge & 0xFF;
      }
      
      public function get incidentEdge() : int
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this._incidentEdge;
      }
      
      public function set incidentEdge(param1:int) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this._incidentEdge = param1;
         this._m_id._key = this._m_id._key & 0xFFFF00FF | this._incidentEdge << 8 & 0xFF00;
      }
      
      public function get incidentVertex() : int
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this._incidentVertex;
      }
      
      public function set incidentVertex(param1:int) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this._incidentVertex = param1;
         this._m_id._key = this._m_id._key & 0xFF00FFFF | this._incidentVertex << 16 & 0xFF0000;
      }
      
      public function get flip() : int
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this._flip;
      }
      
      public function set flip(param1:int) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this._flip = param1;
         this._m_id._key = this._m_id._key & 0xFFFFFF | this._flip << 24 & 0xFF000000;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

