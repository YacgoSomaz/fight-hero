package
{
   import flash.display.MovieClip;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol1240")]
   public class NodeHoldpoint extends MovieClip
   {
      
      §§push(NodeHoldpoint);
      if(37 == 34)
      {
         return;
      }
      
      public var flag:MovieClip;
      
      public var curTeam:uint;
      
      public var unitCaptured:*;
      
      private var flagPos:Number;
      
      private var flagSpd:Number;
      
      public var letter:String = "X";
      
      public function NodeHoldpoint()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.curTeam = 0;
         this.flagPos = -65;
         this.flagSpd = 1;
         this.flag.y = this.flagPos;
         gotoAndStop(this.curTeam + 1);
         this.flag.gotoAndStop(this.curTeam + 1);
      }
      
      public function capture(param1:*) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(param1.team != this.curTeam)
         {
            this.flagPos += this.flagSpd;
            if(this.flagPos >= -10)
            {
               this.curTeam = param1.team;
               gotoAndStop(this.curTeam + 1);
               this.flag.gotoAndStop(this.curTeam + 1);
               this.unitCaptured = param1;
               param1.game.hud.addCustomFeed(param1,"holdpoint");
               if(param1.human)
               {
                  var _loc2_:* = param1.score;
                  var _loc3_:Number = _loc2_.domCap + 1;
                  _loc2_.domCap = _loc3_;
               }
               this.flagPos = -15;
            }
         }
         else
         {
            this.flagPos -= this.flagSpd;
            if(this.flagPos < -65)
            {
               this.flagPos = -65;
            }
         }
         this.flag.y = this.flagPos;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

