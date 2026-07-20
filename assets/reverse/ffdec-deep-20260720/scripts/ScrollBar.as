package
{
   import flash.display.MovieClip;
   import flash.events.MouseEvent;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol960")]
   public class ScrollBar extends MovieClip
   {
      
      §§push(ScrollBar);
      if(37 == 34)
      {
         return;
      }
      
      public var but_down:MovieClip;
      
      public var but_up:MovieClip;
      
      public var bar:MovieClip;
      
      public var scrollPos:Number;
      
      private var barGrab:Number;
      
      public function ScrollBar()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.scrollPos = 0;
      }
      
      public function EnterFrame(param1:MovieClip) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.barGrab >= 0)
         {
            this.bar.y = mouseY - this.barGrab;
         }
         if(this.bar.y < 24)
         {
            this.bar.y = 24;
         }
         if(this.bar.y > 240)
         {
            this.bar.y = 240;
         }
         this.scrollPos = (this.bar.y - 24) / (240 - 24);
         if(this.bar.hitTestPoint(param1.mouseX,param1.mouseY,false) || this.barGrab >= 0)
         {
            this.bar.alpha = 1;
         }
         else
         {
            this.bar.alpha = 0.5;
         }
         if(this.but_up.hitTestPoint(param1.mouseX,param1.mouseY,false) && this.barGrab < 0)
         {
            this.but_up.alpha = 1;
         }
         else
         {
            this.but_up.alpha = 0.5;
         }
         if(this.but_down.hitTestPoint(param1.mouseX,param1.mouseY,false) && this.barGrab < 0)
         {
            this.but_down.alpha = 1;
         }
         else
         {
            this.but_down.alpha = 0.5;
         }
      }
      
      public function MouseDown(param1:MovieClip) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.bar.hitTestPoint(param1.mouseX,param1.mouseY,false))
         {
            this.barGrab = mouseY - this.bar.y;
         }
         if(this.but_down.hitTestPoint(param1.mouseX,param1.mouseY,false) && this.barGrab < 0)
         {
            this.bar.y += 50;
            if(this.bar.y > 240)
            {
               this.bar.y = 240;
            }
         }
         if(this.but_up.hitTestPoint(param1.mouseX,param1.mouseY,false) && this.barGrab < 0)
         {
            this.bar.y -= 50;
            if(this.bar.y < 24)
            {
               this.bar.y = 24;
            }
         }
      }
      
      public function MouseUp() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.barGrab = -1;
      }
      
      public function MouseWheel(param1:MouseEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.barGrab < 0)
         {
            this.bar.y += param1.delta > 0 ? -20 : 20;
            if(this.bar.y < 24)
            {
               this.bar.y = 24;
            }
            if(this.bar.y > 240)
            {
               this.bar.y = 240;
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

