package Box2D.Dynamics.Controllers
{
   import Box2D.Common.b2internal;
   import Box2D.Dynamics.b2Body;
   import Box2D.Dynamics.b2DebugDraw;
   import Box2D.Dynamics.b2TimeStep;
   import Box2D.Dynamics.b2World;
   
   use namespace b2internal;
   
   public class b2Controller
   {
      
      §§push(b2Controller);
      if(37 == 34)
      {
         return;
      }
      
      b2internal var m_next:b2Controller;
      
      b2internal var m_prev:b2Controller;
      
      protected var m_bodyList:b2ControllerEdge;
      
      protected var m_bodyCount:int;
      
      b2internal var m_world:b2World;
      
      public function b2Controller()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
      }
      
      public function Step(param1:b2TimeStep) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      public function Draw(param1:b2DebugDraw) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      public function AddBody(param1:b2Body) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:b2ControllerEdge = new b2ControllerEdge();
         _loc2_.controller = this;
         _loc2_.body = param1;
         _loc2_.nextBody = this.m_bodyList;
         _loc2_.prevBody = null;
         this.m_bodyList = _loc2_;
         if(_loc2_.nextBody)
         {
            _loc2_.nextBody.prevBody = _loc2_;
         }
         var _loc3_:* = this;
         var _loc4_:Number = _loc3_.m_bodyCount + 1;
         _loc3_.m_bodyCount = _loc4_;
         _loc2_.nextController = param1.m_controllerList;
         _loc2_.prevController = null;
         param1.m_controllerList = _loc2_;
         if(_loc2_.nextController)
         {
            _loc2_.nextController.prevController = _loc2_;
         }
         var _temp_2:* = param1;
         _loc3_ = param1;
         _loc4_ = _loc3_.b2internal::m_controllerCount + 1;
         _loc3_.b2internal::m_controllerCount = _loc4_;
      }
      
      public function RemoveBody(param1:b2Body) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:b2ControllerEdge = param1.m_controllerList;
         while(Boolean(_loc2_) && _loc2_.controller != this)
         {
            _loc2_ = _loc2_.nextController;
         }
         if(_loc2_.prevBody)
         {
            _loc2_.prevBody.nextBody = _loc2_.nextBody;
         }
         if(_loc2_.nextBody)
         {
            _loc2_.nextBody.prevBody = _loc2_.prevBody;
         }
         if(_loc2_.nextController)
         {
            _loc2_.nextController.prevController = _loc2_.prevController;
         }
         if(_loc2_.prevController)
         {
            _loc2_.prevController.nextController = _loc2_.nextController;
         }
         if(this.m_bodyList == _loc2_)
         {
            this.m_bodyList = _loc2_.nextBody;
         }
         if(param1.m_controllerList == _loc2_)
         {
            param1.m_controllerList = _loc2_.nextController;
         }
         var _loc3_:* = param1;
         var _loc4_:Number = _loc3_.b2internal::m_controllerCount - 1;
         _loc3_.b2internal::m_controllerCount = _loc4_;
         _loc3_ = this;
         _loc4_ = _loc3_.m_bodyCount - 1;
         _loc3_.m_bodyCount = _loc4_;
      }
      
      public function Clear() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         while(this.m_bodyList)
         {
            this.RemoveBody(this.m_bodyList.body);
            if(2 == 3)
            {
               break;
            }
         }
      }
      
      public function GetNext() : b2Controller
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this.m_next;
      }
      
      public function GetWorld() : b2World
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this.m_world;
      }
      
      public function GetBodyList() : b2ControllerEdge
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this.m_bodyList;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

