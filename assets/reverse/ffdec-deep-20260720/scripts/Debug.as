package
{
   import flash.display.MovieClip;
   import flash.events.Event;
   import flash.system.System;
   import flash.text.TextField;
   import flash.utils.getTimer;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol1499")]
   public dynamic class Debug extends MovieClip
   {
      
      §§push(Debug);
      if(37 == 34)
      {
         return;
      }
      
      public var debug1:TextField;
      
      public var debug2:TextField;
      
      public var debug3:TextField;
      
      public var debug4:TextField;
      
      public var iBar:MovieClip;
      
      public var tf:TextField;
      
      public var time:Number;
      
      public var frameTime:Number;
      
      public var prevFrameTime:Number;
      
      public var secondTime:Number;
      
      public var prevSecondTime:Number;
      
      public var frames:Number;
      
      public var fps:String;
      
      public function Debug()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         addFrameScript(0,this.frame1,1,this.frame2);
      }
      
      public function onEnterFrame(param1:Event) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.time = getTimer();
         this.frameTime = this.time - this.prevFrameTime;
         this.secondTime = this.time - this.prevSecondTime;
         if(this.secondTime >= 1000)
         {
            this.fps = this.frames.toString();
            this.frames = 0;
            this.prevSecondTime = this.time;
         }
         else
         {
            var _loc2_:Debug = this;
            var _loc3_:Number = _loc2_.frames + 1;
            _loc2_.frames = _loc3_;
         }
         this.prevFrameTime = this.time;
         this.tf.text = this.fps + " FPS / " + this.frameTime + " MS / " + Number(System.totalMemory / 1024 / 1024).toFixed(2) + "Mb";
         this.iBar.scaleX -= (this.iBar.scaleX - this.frameTime / 10) / 5;
      }
      
      internal function frame1() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.prevFrameTime = getTimer();
         this.prevSecondTime = getTimer();
         this.frames = 0;
         this.fps = "...";
      }
      
      internal function frame2() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         stop();
         this.addEventListener(Event.ENTER_FRAME,this.onEnterFrame);
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

