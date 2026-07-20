package
{
   import flash.display.MovieClip;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   import flash.text.TextField;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol1890")]
   public class Cutscene extends MovieClip
   {
      
      §§push(Cutscene);
      if(37 == 34)
      {
         return;
      }
      
      public var but_next:TextField;
      
      public var txt_title:TextField;
      
      public var downarrow10:DownArrow;
      
      public var but_prev:TextField;
      
      private var main:Main;
      
      private var type:String;
      
      private var song:*;
      
      private var frames:Array;
      
      private var curFrame:uint = 0;
      
      public function Cutscene(param1:Main, param2:Object)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         addFrameScript(2,this.frame3,8,this.frame9,10,this.frame11,19,this.frame20,22,this.frame23,24,this.frame25,26,this.frame27,30,this.frame31,31,this.frame32,43,this.frame44,44,this.frame45,45,this.frame46);
         this.main = param1;
         this.txt_title.text = MatchSettings.caName;
         this.type = param2.type;
         this.song = MatchSettings[this.type + "CutSong"];
         this.frames = MatchSettings[this.type + "CutFrames"];
         if(this.song)
         {
            SH.playMusic(this.song);
         }
         gotoAndStop(this.frames[this.curFrame]);
         this.setButs();
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.but_prev.alpha = this.ht(this.but_prev) ? 1 : 0.5;
         this.but_next.alpha = this.ht(this.but_next) ? 1 : 0.5;
      }
      
      public function MouseDown() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.ht(this.but_prev) && this.but_prev.text == "Previous")
         {
            var _loc1_:Cutscene = this;
            var _loc2_:Number = _loc1_.curFrame - 1;
            _loc1_.curFrame = _loc2_;
            this.setButs();
            gotoAndStop(this.frames[this.curFrame]);
         }
         else if(this.ht(this.but_next) && this.but_next.text == "Next")
         {
            _loc1_ = this;
            _loc2_ = _loc1_.curFrame + 1;
            _loc1_.curFrame = _loc2_;
            this.setButs();
            gotoAndStop(this.frames[this.curFrame]);
         }
         else if(this.ht(this.but_next) && this.but_next.text == "Start Game")
         {
            this.main.startClass(Game);
         }
         else if(this.ht(this.but_next) && this.but_next.text == "Back to Menu")
         {
            this.main.startClass(Menu);
         }
      }
      
      public function setButs() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.curFrame == this.frames.length - 1 && this.type == "pre")
         {
            if(this.frames.length > 1)
            {
               this.but_prev.visible = true;
               this.but_prev.text = "Previous";
            }
            else
            {
               this.but_prev.visible = false;
               this.but_prev.text = "";
            }
            this.but_next.visible = true;
            this.but_next.text = "Start Game";
         }
         else if(this.curFrame == this.frames.length - 1 && this.type == "post")
         {
            if(this.frames.length > 1)
            {
               this.but_prev.visible = true;
               this.but_prev.text = "Previous";
            }
            else
            {
               this.but_prev.visible = false;
               this.but_prev.text = "";
            }
            this.but_next.visible = true;
            this.but_next.text = "Back to Menu";
         }
         else if(this.curFrame == 0)
         {
            this.but_prev.visible = false;
            this.but_next.visible = true;
            this.but_prev.text = "";
            this.but_next.text = "Next";
         }
         else
         {
            this.but_prev.visible = true;
            this.but_next.visible = true;
            this.but_prev.text = "Previous";
            this.but_next.text = "Next";
         }
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
      
      public function MouseWheel(param1:MouseEvent) : void
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
      
      private function ht(param1:*) : Boolean
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!param1 || !param1.visible)
         {
            return false;
         }
         return param1.hitTestPoint(mouseX,mouseY,false);
      }
      
      internal function frame3() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         SH.playMusic(M_Train);
         SH.playSound(S_rocketExplode);
      }
      
      internal function frame9() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         SH.playSound(S_Jet);
      }
      
      internal function frame11() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         SH.playSound(S_rocketExplode);
      }
      
      internal function frame20() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         SH.playSound(S_rocketExplode);
      }
      
      internal function frame23() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         SH.playSound(S_Missile);
      }
      
      internal function frame25() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         SH.playSound(S_Jet);
      }
      
      internal function frame27() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         SH.playSound(S_Jet);
      }
      
      internal function frame31() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         SH.playSound(S_Missile);
      }
      
      internal function frame32() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         SH.playMusic(M_Slow);
         SH.playSound(S_rocketExplode);
      }
      
      internal function frame44() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.but_next.visible = false;
         this.but_prev.visible = false;
      }
      
      internal function frame45() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         SH.playMusic(M_Silence);
      }
      
      internal function frame46() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         SH.playMusic(M_Theme,true);
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

