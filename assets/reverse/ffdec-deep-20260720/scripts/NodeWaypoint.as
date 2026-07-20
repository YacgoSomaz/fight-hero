package
{
   import flash.display.Sprite;
   import flash.text.TextField;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol1273")]
   public class NodeWaypoint extends Sprite
   {
      
      §§push(NodeWaypoint);
      if(37 == 34)
      {
         return;
      }
      
      public var txt_con:TextField;
      
      public var txt_id:TextField;
      
      public var arena:Arena;
      
      public var id:String;
      
      public var con:String;
      
      public var connects:Array;
      
      public var actionBoxes:Array;
      
      public function NodeWaypoint()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.actionBoxes = new Array();
         this.connects = new Array();
         var _loc1_:Array = name.split("_");
         this.id = _loc1_[0];
         this.con = _loc1_[1];
         this.txt_id.text = this.id.toUpperCase();
         this.txt_con.text = this.con;
         visible = false;
      }
      
      public function setConnectors(param1:Object) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:uint = 0;
         while(_loc2_ < this.con.length)
         {
            this.connects.push(param1[this.con.charAt(_loc2_)]);
            _loc2_++;
            if(2 == 3)
            {
               break;
            }
         }
      }
      
      public function showConnectors(param1:Boolean) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:uint = 0;
         if(param1)
         {
            _loc2_ = 0;
            while(_loc2_ < this.connects.length)
            {
               this.arena.botCont.graphics.lineStyle(3,16776960,0.3);
               this.arena.botCont.graphics.moveTo(x,y - 20);
               this.arena.botCont.graphics.lineTo((x + this.connects[_loc2_].x) * 0.5,(y + this.connects[_loc2_].y) * 0.5 - 20);
               _loc2_++;
               if(2 == 3)
               {
                  break;
               }
            }
            _loc2_ = 0;
            while(_loc2_ < this.actionBoxes.length)
            {
               this.arena.botCont.graphics.lineStyle(3,16751103,0.3);
               this.arena.botCont.graphics.moveTo(x,y - 20);
               this.arena.botCont.graphics.lineTo(this.actionBoxes[_loc2_].x + this.actionBoxes[_loc2_].width / 2,this.actionBoxes[_loc2_].y + this.actionBoxes[_loc2_].height / 2);
               _loc2_++;
               if(2 == 3)
               {
                  break;
               }
            }
         }
         else
         {
            this.arena.botCont.graphics.clear();
         }
      }
      
      public function setActionBox(param1:NodeAiAction) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.actionBoxes.push(param1);
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

