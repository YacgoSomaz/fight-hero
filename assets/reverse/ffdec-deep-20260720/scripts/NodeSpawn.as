package
{
   import flash.display.Sprite;
   import flash.text.TextField;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol1276")]
   public class NodeSpawn extends Sprite
   {
      
      §§push(NodeSpawn);
      if(37 == 34)
      {
         return;
      }
      
      public var txt_id:TextField;
      
      public var id:String;
      
      public var team:uint;
      
      public var waypoint:NodeWaypoint;
      
      public var initialSpawned:Boolean;
      
      public function NodeSpawn()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         var _loc1_:Array = name.split("_");
         this.id = _loc1_[0];
         if(_loc1_[1] != "")
         {
            this.team = _loc1_[1];
         }
         else
         {
            this.team = 0;
         }
         this.txt_id.text = this.id.toUpperCase();
         visible = false;
      }
      
      public function setWaypoint(param1:NodeWaypoint) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.waypoint = param1;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

