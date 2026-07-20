package
{
   import flash.display.MovieClip;
   import flash.display.Shape;
   
   public class Water extends Shape
   {
      
      §§push(Water);
      if(37 == 34)
      {
         return;
      }
      
      private var game:Game;
      
      private var dots:Array;
      
      private var waterSet:Boolean;
      
      private var MC:MovieClip;
      
      private var fc:uint;
      
      public function Water(param1:Game)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.game = param1;
         this.fc = 0;
         blendMode = "hardlight";
      }
      
      public function setWater(param1:MovieClip) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:Object = null;
         this.MC = param1;
         this.MC.visible = false;
         this.dots = [];
         var _loc2_:uint = 0;
         while(_loc2_ < this.MC.width / 20)
         {
            _loc3_ = {};
            _loc3_.x = _loc2_ * 20 + this.MC.x;
            §§push(_loc3_);
            §§push(_loc3_);
            var _temp_2:* = _loc3_.toY = this.MC.y;
            §§pop().y = §§pop().oy = _loc3_.toY = this.MC.y;
            _loc3_.yVel = 0;
            _loc3_.yAcc = 0;
            _loc3_.mass = 10;
            this.dots.push(_loc3_);
            _loc2_++;
            if(2 == 3)
            {
               break;
            }
         }
         this.waterSet = true;
      }
      
      public function disableWater(param1:MovieClip) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.MC = param1;
         this.MC.visible = false;
         this.dots = [];
         this.waterSet = false;
      }
      
      public function inWater(param1:Number, param2:Number) : Boolean
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!this.waterSet)
         {
            return false;
         }
         return UT.inBox(param1,param2,this.MC.x,this.MC.y,this.MC.width,this.MC.height);
      }
      
      public function startWave(param1:int, param2:Number) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!this.waterSet)
         {
            return;
         }
         if(param1 < 0 || param1 >= this.dots.length)
         {
            return;
         }
         this.dots[param1].yVel = param2;
      }
      
      public function startWaveAtPos(param1:Number, param2:Number) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!this.waterSet)
         {
            return;
         }
         var _loc3_:int = Math.round((param1 - this.MC.x) / 20);
         if(_loc3_ < 0 || _loc3_ >= this.dots.length)
         {
            return;
         }
         this.dots[_loc3_].yVel = param2;
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         var _loc2_:uint = 0;
         var _loc3_:Number = NaN;
         var _loc4_:Number = NaN;
         var _loc5_:Number = NaN;
         var _loc6_:Number = NaN;
         var _loc7_:Number = NaN;
         if(!this.waterSet)
         {
            return;
         }
         var _loc8_:Water = this;
         var _loc9_:Number = _loc8_.fc + 1;
         _loc8_.fc = _loc9_;
         if(this.fc % 20 == 0)
         {
            this.startWave(0,2);
            this.startWave(this.dots.length - 1,2);
            this.startWave(uint(this.dots.length / 2),1);
         }
         _loc1_ = 0;
         while(_loc1_ < this.game.units.length)
         {
            if(!this.game.units[_loc1_].dead)
            {
               if(this.inWater(this.game.units[_loc1_].x,this.game.units[_loc1_].y))
               {
                  _loc2_ = Math.round((this.game.units[_loc1_].x - this.MC.x) / 20);
                  if(Boolean(this.game.units[_loc1_].mov.jumping) && this.game.units[_loc1_].mov.yVel > 0)
                  {
                     this.startWave(_loc2_,4);
                  }
                  else if(Boolean(this.game.units[_loc1_].mov.jumping) && this.game.units[_loc1_].mov.yVel < 0)
                  {
                     this.startWave(_loc2_,-5);
                  }
                  else if(this.game.units[_loc1_].mov.xVel < 0)
                  {
                     this.startWave(_loc2_ - 1,2);
                     this.startWave(_loc2_ - 3,-2);
                     this.startWave(_loc2_ + 1,-1);
                  }
                  else if(this.game.units[_loc1_].mov.xVel > 0)
                  {
                     this.startWave(_loc2_ + 1,2);
                     this.startWave(_loc2_ + 3,-2);
                     this.startWave(_loc2_ - 1,-1);
                  }
                  else if(this.game.units[_loc1_].mov.crouching)
                  {
                     this.startWave(_loc2_,0.5);
                  }
               }
            }
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         _loc1_ = 0;
         while(_loc1_ < this.dots.length)
         {
            _loc3_ = 0;
            _loc4_ = 0;
            _loc5_ = 5;
            _loc6_ = 1.05;
            _loc7_ = 0.7;
            if(_loc1_ > 0)
            {
               _loc3_ = this.dots[_loc1_ - 1].y - this.dots[_loc1_].y;
               _loc4_ += _loc3_ * -_loc7_;
            }
            if(_loc1_ < this.dots.length - 1)
            {
               _loc3_ = this.dots[_loc1_].y - this.dots[_loc1_ + 1].y;
               _loc4_ += _loc3_ * _loc7_;
            }
            _loc3_ = this.dots[_loc1_].y - this.dots[_loc1_].oy;
            _loc4_ += _loc7_ / _loc5_ * _loc3_;
            this.dots[_loc1_].yAcc = -_loc4_ / this.dots[_loc1_].mass;
            this.dots[_loc1_].yVel += this.dots[_loc1_].yAcc;
            this.dots[_loc1_].toY += this.dots[_loc1_].yVel;
            this.dots[_loc1_].yVel /= _loc6_;
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         _loc1_ = 0;
         while(_loc1_ < this.dots.length)
         {
            this.dots[_loc1_].y = this.dots[_loc1_].toY;
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         graphics.clear();
         graphics.lineStyle(2,MatchSettings.useMap.water,1);
         graphics.beginFill(MatchSettings.useMap.water,0.8);
         graphics.moveTo(this.dots[0].x,this.dots[0].y);
         _loc1_ = 1;
         while(_loc1_ < this.dots.length)
         {
            if(_loc1_ == 1)
            {
               graphics.lineTo((this.dots[_loc1_ - 1].x + this.dots[_loc1_].x) / 2,(this.dots[_loc1_ - 1].y + this.dots[_loc1_].y) / 2);
            }
            else if(_loc1_ < this.dots.length - 1)
            {
               graphics.curveTo(this.dots[_loc1_ - 1].x,this.dots[_loc1_ - 1].y,(this.dots[_loc1_ - 1].x + this.dots[_loc1_].x) / 2,(this.dots[_loc1_ - 1].y + this.dots[_loc1_].y) / 2);
            }
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         graphics.lineTo(this.dots[this.dots.length - 1].x,this.dots[this.dots.length - 1].y);
         graphics.lineTo(this.MC.x + this.MC.width,this.MC.y + this.MC.height);
         graphics.lineTo(this.MC.x,this.MC.y + this.MC.height);
         graphics.lineTo(this.dots[0].x,this.dots[0].y);
         graphics.endFill();
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

