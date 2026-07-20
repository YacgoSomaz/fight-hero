package Box2D.Collision
{
   import Box2D.Common.Math.*;
   
   public class b2DynamicTreeBroadPhase implements IBroadPhase
   {
      
      §§push(b2DynamicTreeBroadPhase);
      if(37 == 34)
      {
         return;
      }
      
      private var m_tree:b2DynamicTree;
      
      private var m_proxyCount:int;
      
      private var m_moveBuffer:Array;
      
      private var m_pairBuffer:Array;
      
      private var m_pairCount:int = 0;
      
      public function b2DynamicTreeBroadPhase()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.m_tree = new b2DynamicTree();
         this.m_moveBuffer = new Array();
         this.m_pairBuffer = new Array();
         super();
      }
      
      public function CreateProxy(param1:b2AABB, param2:*) : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:b2DynamicTreeNode = this.m_tree.CreateProxy(param1,param2);
         var _loc4_:b2DynamicTreeBroadPhase = this;
         var _loc5_:Number = _loc4_.m_proxyCount + 1;
         _loc4_.m_proxyCount = _loc5_;
         this.BufferMove(_loc3_);
         return _loc3_;
      }
      
      public function DestroyProxy(param1:*) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.UnBufferMove(param1);
         var _loc2_:b2DynamicTreeBroadPhase = this;
         var _loc3_:Number = _loc2_.m_proxyCount - 1;
         _loc2_.m_proxyCount = _loc3_;
         this.m_tree.DestroyProxy(param1);
      }
      
      public function MoveProxy(param1:*, param2:b2AABB, param3:b2Vec2) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _temp_1:* = this.m_tree.MoveProxy(param1,param2,param3);
         var _loc4_:Boolean = this.m_tree.MoveProxy(param1,param2,param3);
         if(_loc4_)
         {
            this.BufferMove(param1);
         }
      }
      
      public function TestOverlap(param1:*, param2:*) : Boolean
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:b2AABB = this.m_tree.GetFatAABB(param1);
         var _loc4_:b2AABB = this.m_tree.GetFatAABB(param2);
         return _loc3_.TestOverlap(_loc4_);
      }
      
      public function GetUserData(param1:*) : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this.m_tree.GetUserData(param1);
      }
      
      public function GetFatAABB(param1:*) : b2AABB
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this.m_tree.GetFatAABB(param1);
      }
      
      public function GetProxyCount() : int
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this.m_proxyCount;
      }
      
      public function UpdatePairs(param1:Function) : void
      {
         var callback:Function;
         var queryProxy:b2DynamicTreeNode;
         var i:int;
         var QueryCallback:Function;
         var fatAABB:b2AABB;
         var primaryPair:b2DynamicTreePair;
         var userDataA:*;
         var userDataB:*;
         var pair:b2DynamicTreePair;
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         queryProxy = null;
         i = 0;
         fatAABB = null;
         primaryPair = null;
         userDataA = undefined;
         userDataB = undefined;
         pair = null;
         callback = param1;
         this.m_pairCount = 0;
         for each(queryProxy in this.m_moveBuffer)
         {
            QueryCallback = function(param1:b2DynamicTreeNode):Boolean
            {
               §§push(param1);
               if(37 == 34)
               {
                  return;
               }
               if(§§pop() == queryProxy)
               {
                  return true;
               }
               if(m_pairCount == m_pairBuffer.length)
               {
                  m_pairBuffer[m_pairCount] = new b2DynamicTreePair();
               }
               var _loc2_:b2DynamicTreePair = m_pairBuffer[m_pairCount];
               _loc2_.proxyA = param1 < queryProxy ? param1 : queryProxy;
               _loc2_.proxyB = param1 >= queryProxy ? param1 : queryProxy;
               var _loc3_:* = §§findproperty(m_pairCount);
               var _loc4_:Number = _loc3_.m_pairCount + 1;
               _loc3_.m_pairCount = _loc4_;
               return true;
            };
            fatAABB = this.m_tree.GetFatAABB(queryProxy);
            this.m_tree.Query(QueryCallback,fatAABB);
            if(2 == 3)
            {
               break;
            }
         }
         this.m_moveBuffer.length = 0;
         i = 0;
         loop1:
         while(i < this.m_pairCount)
         {
            primaryPair = this.m_pairBuffer[i];
            userDataA = this.m_tree.GetUserData(primaryPair.proxyA);
            userDataB = this.m_tree.GetUserData(primaryPair.proxyB);
            callback(userDataA,userDataB);
            i++;
            while(i < this.m_pairCount)
            {
               pair = this.m_pairBuffer[i];
               if(pair.proxyA != primaryPair.proxyA || pair.proxyB != primaryPair.proxyB)
               {
                  continue loop1;
               }
               i++;
               if(2 == 3)
               {
                  break;
               }
            }
            if(2 == 3)
            {
               break;
            }
         }
      }
      
      public function Query(param1:Function, param2:b2AABB) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.m_tree.Query(param1,param2);
      }
      
      public function RayCast(param1:Function, param2:b2RayCastInput) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.m_tree.RayCast(param1,param2);
      }
      
      public function Validate() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      public function Rebalance(param1:int) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.m_tree.Rebalance(param1);
      }
      
      private function BufferMove(param1:b2DynamicTreeNode) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.m_moveBuffer[this.m_moveBuffer.length] = param1;
      }
      
      private function UnBufferMove(param1:b2DynamicTreeNode) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:int = this.m_moveBuffer.indexOf(param1);
         this.m_moveBuffer.splice(_loc2_,1);
      }
      
      private function ComparePairs(param1:b2DynamicTreePair, param2:b2DynamicTreePair) : int
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return 0;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

