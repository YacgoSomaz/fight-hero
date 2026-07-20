package
{
   import flash.display.MovieClip;
   import flash.display.SimpleButton;
   import flash.events.KeyboardEvent;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol1177")]
   public class Logo_Armor extends MovieClip
   {
      
      §§push(Logo_Armor);
      if(37 == 34)
      {
         return;
      }
      
      public var skip:SimpleButton;
      
      private var main:Main;
      
      public function Logo_Armor(param1:Main, param2:Object = null)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         addFrameScript(206,this.frame207);
         this.main = param1;
         this.skip.visible = Main.SPONSORSITE;
         buttonMode = this.clickable();
      }
      
      public function logoDone() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.main.logoArmorDone();
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
            SD.urlArmor(true);
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
      
      internal function frame207() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.logoDone();
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

