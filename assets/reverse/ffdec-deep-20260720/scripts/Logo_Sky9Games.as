package
{
   import flash.display.MovieClip;
   import flash.display.SimpleButton;
   import flash.events.KeyboardEvent;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol1154")]
   public class Logo_Sky9Games extends MovieClip
   {
      
      §§push(Logo_Sky9Games);
      if(37 == 34)
      {
         return;
      }
      
      public var skip:SimpleButton;
      
      private var main:Main;
      
      public function Logo_Sky9Games(param1:Main, param2:Object = null)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         addFrameScript(153,this.frame154);
         this.main = param1;
         this.skip.visible = Main.SPONSORSITE;
         SH.playMusic(M_Menu);
         buttonMode = this.clickable();
      }
      
      public function logoDone() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.main.logoSky9Done();
         stop();
      }
      
      public function MouseDown() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.skip.visible && this.skip.hitTestPoint(mouseX,mouseY,false))
         {
            this.logoDone();
         }
         else if(this.clickable())
         {
            SD.urlSky9Games(true);
         }
      }
      
      public function clickable() : Boolean
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return !Main.SPONSORSITE;
      }
      
      public function MouseUp() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      public function KeyDown(param1:KeyboardEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      public function KeyUp(param1:KeyboardEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      public function flashActivate() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      public function flashDeactivate() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      internal function frame154() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         stop();
         this.logoDone();
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

