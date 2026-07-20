package
{
   import flash.display.BitmapData;
   import flash.display.MovieClip;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol2082")]
   public class BH extends MovieClip
   {
      
      private static var BitAr:Array;
      
      public static var BITS:Object;
      
      §§push(BH);
      if(37 == 34)
      {
         return;
      }
      
      public var MC:MovieClip;
      
      public var complete:Boolean;
      
      private var main:Main;
      
      private var i:uint;
      
      public var rotate:int;
      
      public function BH(param1:Main)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         addFrameScript(0,this.frame1,1,this.frame2,2,this.frame3,3,this.frame4,4,this.frame5,5,this.frame6,6,this.frame7,7,this.frame8,8,this.frame9,9,this.frame10,10,this.frame11,11,this.frame12,12,this.frame13,13,this.frame14,14,this.frame15,15,this.frame16,16,this.frame17,17,this.frame18,18,this.frame19,19,this.frame20,20,this.frame21,21,this.frame22,22,this.frame23,23,this.frame24,24,this.frame25,25,this.frame26,26,this.frame27,27,this.frame28,28,this.frame29,29,this.frame30,30,this.frame31,31,this.frame32,32,this.frame33,33,this.frame34,34,this.frame35,35,this.frame36,36,this.frame37,37,this.frame38,38,this.frame39);
         this.main = param1;
         BitAr = new Array();
         BITS = new Object();
         this.i = 1;
         this.complete = false;
      }
      
      public static function getBitAniStats(param1:String, param2:String) : Object
      {
         if(!BITS[param1] || !BITS[param1].sub[param2])
         {
            trace("Bit",param1,param2,"not found!");
         }
         return {
            "name":param1,
            "sub":param2,
            "width":BITS[param1].width,
            "height":BITS[param1].height,
            "frames":BITS[param1].sub[param2].frames,
            "pos":BITS[param1].sub[param2].pos,
            "rotAmt":BITS[param1].rotAmt
         };
      }
      
      public static function getBit(param1:String, param2:String = "", param3:uint = 1) : BitmapData
      {
         var name:String = param1;
         var sub:String = param2;
         var frame:uint = param3;
         try
         {
            if(!sub)
            {
               return BitAr[BITS[name].pos];
            }
            return BitAr[BITS[name].sub[sub].pos + (frame - 1)];
         }
         catch(e:Error)
         {
            trace("Error: Could not find bit: " + name + ", " + sub + ", " + frame);
         }
         return BitAr[BITS["error"].pos];
      }
      
      public function setup() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:BitmapData = null;
         var _loc2_:uint = 0;
         var _loc3_:Number = NaN;
         var _loc4_:uint = 0;
         var _loc5_:Object = null;
         var _loc6_:String = null;
         var _loc7_:uint = 0;
         if(this.MC)
         {
            _loc2_ = this.rotate ? uint(this.rotate) : 1;
            _loc3_ = 360 / _loc2_;
            _loc4_ = 0;
            while(_loc4_ < _loc2_)
            {
               this.MC.rotation = _loc4_ * _loc3_;
               _loc5_ = new Object();
               _loc6_ = "";
               _loc7_ = 1;
               while(_loc7_ <= this.MC.totalFrames)
               {
                  this.MC.gotoAndStop(_loc7_);
                  if(this.MC.currentLabel != _loc6_)
                  {
                     _loc6_ = this.MC.currentLabel;
                     _loc5_[_loc6_] = {
                        "pos":BitAr.length,
                        "frames":0
                     };
                  }
                  var _loc8_:* = _loc5_[_loc6_];
                  var _loc9_:Number = _loc8_.frames + 1;
                  _loc8_.frames = _loc9_;
                  _loc1_ = new BitmapData(width,height,true,0);
                  _loc1_.draw(this);
                  BitAr.push(_loc1_);
                  _loc7_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               BITS[currentLabel + "" + _loc4_] = {
                  "sub":_loc5_,
                  "width":width,
                  "height":height,
                  "rot":this.rotate,
                  "rotAmt":_loc2_
               };
               _loc4_++;
               if(2 == 3)
               {
                  break;
               }
            }
         }
         else
         {
            _loc1_ = new BitmapData(width,height,true,0);
            _loc1_.draw(this);
            BitAr.push(_loc1_);
            BITS[currentLabel + "" + 0] = {
               "pos":BitAr.length - 1,
               "width":width,
               "height":height,
               "rot":this.rotate,
               "rotAmt":1
            };
         }
         if(this.i == totalFrames)
         {
            this.doComplete();
         }
         else
         {
            var _temp_2:* = this;
            _loc8_ = this;
            _loc9_ = _loc8_.i + 1;
            _loc8_.i = _loc9_;
            gotoAndStop(this.i);
         }
      }
      
      public function doComplete() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.complete = true;
         this.main.renderDone();
      }
      
      internal function frame1() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame2() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 3;
      }
      
      internal function frame3() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 3;
      }
      
      internal function frame4() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 3;
      }
      
      internal function frame5() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame6() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame7() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 4;
      }
      
      internal function frame8() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame9() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame10() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame11() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame12() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame13() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame14() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 4;
      }
      
      internal function frame15() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame16() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 4;
      }
      
      internal function frame17() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 4;
      }
      
      internal function frame18() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame19() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 3;
      }
      
      internal function frame20() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame21() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame22() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame23() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame24() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame25() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame26() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame27() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame28() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame29() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame30() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame31() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame32() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame33() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame34() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame35() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame36() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame37() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame38() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
      
      internal function frame39() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rotate = 0;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

