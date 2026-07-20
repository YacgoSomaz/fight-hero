package
{
   import flash.display.MovieClip;
   import flash.events.KeyboardEvent;
   import flash.text.TextField;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol49")]
   public class LoaderScreen extends MovieClip
   {
      
      §§push(LoaderScreen);
      if(37 == 34)
      {
         return;
      }
      
      public var txt_size:TextField;
      
      public var logo1:MovieClip;
      
      public var logo2:MovieClip;
      
      public var smoke:MovieClip;
      
      public var txt_loading:TextField;
      
      public var txt_play:TextField;
      
      public var pslight:MovieClip;
      
      private var main:Main;
      
      private var otxtHeight:Number;
      
      private var helpNum:uint;
      
      private var helpAr:Array;
      
      public function LoaderScreen(param1:Main = null, param2:Object = null)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         addFrameScript(0,this.frame1);
         if(!param1)
         {
            return;
         }
         this.main = param1;
         this.otxtHeight = this.txt_play.y;
         this.txt_play.y = 2000;
         SD.setLogos(this.logo1,this.logo2);
      }
      
      public function MouseDown() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.txt_play.hitTestPoint(mouseX,mouseY,false))
         {
            this.main.loadDone();
            this.txt_play.y = 2000;
            this.txt_loading.text = "Rendering\nPlease wait";
            this.txt_size.text = "";
         }
         SD.pressLogos(this,this.logo1,this.logo2);
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
         if(this.main.loaderInfo.bytesLoaded >= this.main.loaderInfo.bytesTotal)
         {
            this.txt_play.y = this.otxtHeight;
            this.txt_loading.text = "";
            this.txt_size.text = "";
         }
         else
         {
            this.txt_loading.text = "Loading\n" + Math.ceil(this.main.loaderInfo.bytesLoaded / this.main.loaderInfo.bytesTotal * 100) + "%";
            this.txt_size.text = Math.round(this.main.loaderInfo.bytesLoaded / 1024 / 1024 * 10) / 10 + "mb / " + Math.round(this.main.loaderInfo.bytesTotal / 1024 / 1024 * 10) / 10 + "mb";
         }
         if(this.txt_play.hitTestPoint(mouseX,mouseY,false))
         {
            this.txt_play.textColor = 16777215;
         }
         else
         {
            this.txt_play.textColor = 12303291;
         }
      }
      
      internal function frame1() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.smoke.mask = this.pslight;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

