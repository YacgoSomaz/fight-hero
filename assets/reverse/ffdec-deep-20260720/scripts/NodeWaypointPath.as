package
{
   public class NodeWaypointPath
   {
      
      §§push(NodeWaypointPath);
      if(37 == 34)
      {
         return;
      }
      
      public var dist:Number;
      
      public var nodes:uint;
      
      public var path:String;
      
      public function NodeWaypointPath(param1:*, param2:Object)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.path = param1;
         this.nodes = this.path.length;
         this.dist = 0;
         var _loc3_:uint = 0;
         while(_loc3_ < this.nodes - 1)
         {
            this.dist += UT.getDist(param2[this.path.charAt(_loc3_)].x,param2[this.path.charAt(_loc3_)].y,param2[this.path.charAt(_loc3_ + 1)].x,param2[this.path.charAt(_loc3_ + 1)].y);
            _loc3_++;
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

