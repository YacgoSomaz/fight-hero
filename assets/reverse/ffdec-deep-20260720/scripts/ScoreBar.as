package
{
   import flash.display.MovieClip;
   import flash.text.TextField;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol1555")]
   public class ScoreBar extends MovieClip
   {
      
      §§push(ScoreBar);
      if(37 == 34)
      {
         return;
      }
      
      public var txt_deaths:TextField;
      
      public var icon_status:MovieClip;
      
      public var txt_score:TextField;
      
      public var txt_kills:TextField;
      
      public var icon_class:MovieClip;
      
      public var txt_name:TextField;
      
      private var unit:*;
      
      public function ScoreBar(param1:Number, param2:* = null, param3:String = "", param4:String = "", param5:int = 0)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         y = param1;
         this.unit = param2;
         if(Boolean(param3) && !param4)
         {
            gotoAndStop(param3);
            this.icon_status.visible = false;
            this.icon_class.visible = false;
         }
         else if(Boolean(param3) && Boolean(param4))
         {
            gotoAndStop(param3);
            this.icon_status.visible = false;
            this.icon_class.visible = false;
            this.txt_name.text = param4;
            this.txt_score.text = "" + param5;
            this.txt_kills.text = "";
            this.txt_deaths.text = "";
         }
         else
         {
            if(!this.unit.team)
            {
               gotoAndStop("ffa_" + (this.unit.human ? "player" : "ai"));
            }
            else
            {
               gotoAndStop("team" + this.unit.team + "_" + (this.unit.human ? "player" : "ai"));
            }
            this.icon_class.gotoAndStop(this.unit.unitInfo.icon);
            this.txt_name.text = this.unit.name;
            this.txt_score.text = "" + this.unit.pscore;
            this.txt_kills.text = "" + this.unit.score.kills;
            this.txt_deaths.text = "" + this.unit.score.deaths;
            if(this.unit.dead)
            {
               this.icon_status.gotoAndStop("dm");
            }
            else
            {
               this.icon_status.visible = false;
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

