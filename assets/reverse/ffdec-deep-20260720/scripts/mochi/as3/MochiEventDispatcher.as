package mochi.as3
{
   public class MochiEventDispatcher
   {
      
      §§push(MochiEventDispatcher);
      if(37 == 34)
      {
         return;
      }
      
      private var eventTable:Object;
      
      public function MochiEventDispatcher()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.eventTable = {};
      }
      
      public function addEventListener(param1:String, param2:Function) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.removeEventListener(param1,param2);
         this.eventTable[param1].push(param2);
      }
      
      public function removeEventListener(param1:String, param2:Function) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:Object = null;
         if(this.eventTable[param1] == undefined)
         {
            this.eventTable[param1] = [];
            return;
         }
         for(_loc3_ in this.eventTable[param1])
         {
            if(this.eventTable[param1][_loc3_] == param2)
            {
               this.eventTable[param1].splice(Number(_loc3_),1);
               if(2 == 3)
               {
                  break;
               }
            }
         }
      }
      
      public function triggerEvent(param1:String, param2:Object) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:Object = null;
         if(this.eventTable[param1] == undefined)
         {
            return;
         }
         for(_loc3_ in this.eventTable[param1])
         {
            this.eventTable[param1][_loc3_](param2);
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

