package
{
   public class Movement
   {
      
      §§push(Movement);
      if(37 == 34)
      {
         return;
      }
      
      private var unit:Unit;
      
      public var xVel:Number = 0;
      
      public var xVelSlide:Number = 0;
      
      public const xAcc:Number = 1.8;
      
      public const xBrake:Number = 1.7;
      
      public const xCrouchBrake:Number = 0.5;
      
      public const xAirAcc:Number = 1.4;
      
      public const xAirBrake:Number = 0.4;
      
      public const xMax:Number = 9.5;
      
      public const xCrouchMax:Number = 4;
      
      public var yVel:Number = 0;
      
      public const yGrav:Number = 0.8;
      
      public const yMax:Number = 20;
      
      public const yJump:Number = 13;
      
      public const yJumpBoost:Number = 6;
      
      public const yDjump:Number = 10;
      
      public var manualJump:Boolean = false;
      
      public var jumping:Boolean = false;
      
      public var crouching:Boolean = false;
      
      public var tiltL:Number;
      
      public var tiltR:Number;
      
      public var modSpeed:Number;
      
      public var modMax:Number;
      
      public var modBrake:Number;
      
      public var modJump:Number;
      
      public var modSlide:Number;
      
      public var modMove:Number;
      
      public var modGrav:Number;
      
      public var modMegaJump:Boolean;
      
      public var climb:int;
      
      public var climbSize:uint;
      
      private var falltimer:uint = 0;
      
      public var landHard:Boolean;
      
      public var noJump:Boolean;
      
      public var parachute:Boolean;
      
      public function Movement(param1:Unit)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.unit = param1;
         this.reset();
      }
      
      public function reset() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.resetMods();
         this.manualJump = false;
         this.jumping = false;
         this.crouching = false;
         this.falltimer = 0;
         this.climb = 0;
         this.climbSize = 0;
         this.xVel = 0;
         this.yVel = 0;
         this.parachute = false;
         if(this.unit.unitInfo.extra.parachute)
         {
            this.parachute = true;
            if(this.unit.unitInfo.extra.paraOnce)
            {
               this.unit.unitInfo.extra.parachute = false;
            }
         }
      }
      
      public function resetMods() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.modMegaJump = false;
         this.modSpeed = 1;
         this.modMax = 1;
         this.modBrake = 1;
         this.modJump = 1;
         this.modGrav = 1;
         this.modSlide = 0;
         this.modMove = 0;
      }
      
      public function doJump(param1:int = 0) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!this.unit.game.gameStarted)
         {
            return;
         }
         if(this.crouching)
         {
            return;
         }
         if(this.climb)
         {
            return;
         }
         if(this.landHard)
         {
            return;
         }
         if(this.unit.constAnim)
         {
            this.unit.game.createParticle(this.unit.x,this.unit.y - 120,"move",0,{
               "xspd":-50,
               "yspd":0
            },this.unit.constAnim,"animate");
            this.unit.constAnim = "";
         }
         this.parachute = false;
         while(true)
         {
            if(param1)
            {
               this.climb = param1;
               while(true)
               {
                  if(this.climbSize == 1)
                  {
                     this.yVel = -7;
                     if(2 != 3)
                     {
                        break;
                     }
                  }
                  if(this.climbSize == 2)
                  {
                     this.yVel = -10;
                  }
                  break;
               }
               this.unit.MC.goto("climb" + (this.climbSize == 1 ? "small" : "big"));
               if(2 != 3)
               {
                  break;
               }
            }
            if(!this.jumping && !this.noJump)
            {
               this.unit.y -= this.yJumpBoost;
               this.yVel -= this.yJump * this.modJump;
               this.jumping = true;
               this.manualJump = true;
               this.unit.MC.goto("jump");
            }
            break;
         }
      }
      
      private function toggleCrouch(param1:*) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:Boolean = param1 != this.crouching;
         this.crouching = param1;
         if(_loc2_)
         {
            this.unit.gun.setShieldPos();
         }
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc4_:Number = NaN;
         var _loc5_:Number = NaN;
         var _loc6_:uint = 0;
         if(!this.unit.game.gameStarted)
         {
            return;
         }
         if(Boolean(!this.jumping) && Boolean(this.unit.keys & this.unit.DOWN) && !this.landHard)
         {
            this.toggleCrouch(true);
         }
         else if(this.crouching && (Boolean(this.hitTest(-17,-45)) || Boolean(this.hitTest(17,-45))))
         {
            this.toggleCrouch(true);
         }
         else
         {
            this.toggleCrouch(false);
         }
         if(this.parachute)
         {
            this.modGrav = 0.2;
         }
         var _loc1_:String = "back";
         if(Boolean(this.unit.keys & this.unit.LEFT) && !this.landHard)
         {
            if(this.unit.human && Boolean(this.unit.unitInfo.extra.noAim))
            {
               this.unit.aimX = this.unit.x - 200;
               this.unit.aimY = this.unit.y - 0;
               _loc1_ = "";
            }
            if(this.crouching)
            {
               this.unit.nextAnim = this.unit.flip ? "duckrun" : "duckrun" + _loc1_;
               this.xVel += (this.jumping ? -this.xAirAcc : -this.xAcc) * this.modSpeed;
               if(this.xVel < -this.xCrouchMax * this.modMax)
               {
                  this.xVel = -this.xCrouchMax * this.modMax;
               }
            }
            else
            {
               this.unit.nextAnim = (this.unit.flip ? "run" : "run" + _loc1_) + this.unit.unitInfo.runType;
               this.xVel += (this.jumping ? -this.xAirAcc : -this.xAcc) * this.modSpeed;
               if(this.xVel < -this.xMax * this.modMax)
               {
                  this.xVel = -this.xMax * this.modMax;
               }
            }
         }
         else if(Boolean(this.unit.keys & this.unit.RIGHT) && !this.landHard)
         {
            if(this.unit.human && Boolean(this.unit.unitInfo.extra.noAim))
            {
               this.unit.aimX = this.unit.x + 200;
               this.unit.aimY = this.unit.y - 0;
               _loc1_ = "";
            }
            if(this.crouching)
            {
               this.unit.nextAnim = this.unit.flip ? "duckrun" + _loc1_ : "duckrun";
               this.xVel += (this.jumping ? this.xAirAcc : this.xAcc) * this.modSpeed;
               if(this.xVel > this.xCrouchMax * this.modMax)
               {
                  this.xVel = this.xCrouchMax * this.modMax;
               }
            }
            else
            {
               this.unit.nextAnim = (this.unit.flip ? "run" + _loc1_ : "run") + this.unit.unitInfo.runType;
               this.xVel += (this.jumping ? this.xAirAcc : this.xAcc) * this.modSpeed;
               if(this.xVel > this.xMax * this.modMax)
               {
                  this.xVel = this.xMax * this.modMax;
               }
            }
         }
         else
         {
            this.unit.nextAnim = "idle";
            _loc5_ = (this.jumping ? this.xAirBrake : (this.crouching ? this.xCrouchBrake : this.xBrake)) * this.modBrake;
            if(this.xVel > _loc5_)
            {
               this.xVel -= _loc5_;
            }
            if(this.xVel < -_loc5_)
            {
               this.xVel += _loc5_;
            }
            if(this.xVel > -_loc5_ - 0.1 && this.xVel < _loc5_ + 0.1)
            {
               this.xVel = 0;
            }
         }
         if(this.climb == 1)
         {
            this.xVel = 5;
         }
         else if(this.climb == -1)
         {
            this.xVel = -5;
         }
         this.unit.x += this.xVel;
         this.unit.x += this.modMove;
         if(!this.modSlide)
         {
            this.xVel += this.xVelSlide;
         }
         this.xVelSlide = Math.round(this.unit.MC.rotation) * this.modSlide;
         if(this.xVelSlide > 0)
         {
            this.xVelSlide -= 0.05;
         }
         if(this.xVelSlide < 0)
         {
            this.xVelSlide += 0.05;
         }
         if(this.xVelSlide > -0.1 && this.xVelSlide < 0.1)
         {
            this.xVelSlide = 0;
         }
         this.unit.x += this.xVelSlide;
         this.unit.y += this.yVel;
         if(this.climb)
         {
            while(Boolean(this.hitTest(0,6)) && !this.hitTest(0,-1))
            {
               this.unit.y += 0.5;
            }
         }
         else
         {
            while(Boolean(this.hitTest(0,8)) && !this.hitTest(0,-1))
            {
               this.unit.y += 0.5;
            }
         }
         if(this.hitTest(0,1))
         {
            if(this.falltimer >= 1.3 * 30)
            {
               if(this.unit.human)
               {
                  this.unit.game.arena.setShake(4,8);
               }
               this.landHard = true;
            }
            if(this.yVel > 0)
            {
               if(this.unit.keys & this.unit.LEFT)
               {
                  this.unit.nextAnim = (this.unit.flip ? "landrun" : "landrunback") + this.unit.unitInfo.runType;
               }
               else if(this.unit.keys & this.unit.RIGHT)
               {
                  this.unit.nextAnim = (this.unit.flip ? "landrunback" : "landrun") + this.unit.unitInfo.runType;
               }
               else
               {
                  this.unit.nextAnim = "land";
               }
            }
            this.manualJump = false;
            this.jumping = false;
            this.yVel = 0;
            this.falltimer = 0;
            if(this.unit.constAnim)
            {
               this.unit.game.createParticle(this.unit.x,this.unit.y - 120,"move",0,{
                  "xspd":-50,
                  "yspd":0
               },this.unit.constAnim,"animate");
               this.unit.constAnim = "";
            }
            this.parachute = false;
         }
         else
         {
            if(this.yVel > 0)
            {
               var _loc7_:* = this;
               var _loc8_:Number = _loc7_.falltimer + 1;
               _loc7_.falltimer = _loc8_;
            }
            this.unit.nextAnim = "fall";
            this.jumping = true;
            this.yVel += this.yGrav * this.modGrav;
            if(this.yVel > this.yMax * this.modGrav)
            {
               this.yVel = this.yMax * this.modGrav;
               do
               {
                  if(!this.hitTest(0,-50))
                  {
                     addr0b25:
                     var _loc2_:Boolean = false;
                     if(Boolean(this.unit.keys & this.unit.RIGHT) && Boolean(this.hitTest(17,-40)) && !this.hitTest(17,-55))
                     {
                        this.climbSize = 2;
                        _loc2_ = true;
                     }
                     else if(Boolean(this.unit.keys & this.unit.RIGHT) && Boolean(this.hitTest(17,-20)) && !this.hitTest(17,-55))
                     {
                        this.climbSize = 1;
                        _loc2_ = true;
                     }
                     if(this.crouching)
                     {
                        while(Boolean(this.hitTest(17,-20)) || Boolean(this.hitTest(17,-25)) || Boolean(this.hitTest(17,-35)))
                        {
                           _loc7_ = this.unit;
                           _loc8_ = _loc7_.x - 1;
                           _loc7_.x = _loc8_;
                        }
                     }
                     else
                     {
                        while(Boolean(this.hitTest(17,-20)) || Boolean(this.hitTest(17,-25)) || Boolean(this.hitTest(17,-35)) || Boolean(this.hitTest(17,-45)))
                        {
                           _loc7_ = this.unit;
                           _loc8_ = _loc7_.x - 1;
                           _loc7_.x = _loc8_;
                        }
                     }
                     var _loc3_:Boolean = false;
                     if(Boolean(this.unit.keys & this.unit.LEFT) && Boolean(this.hitTest(-17,-40)) && !this.hitTest(-17,-55))
                     {
                        this.climbSize = 2;
                        _loc3_ = true;
                     }
                     else if(Boolean(this.unit.keys & this.unit.LEFT) && Boolean(this.hitTest(-17,-20)) && !this.hitTest(-17,-55))
                     {
                        this.climbSize = 1;
                        _loc3_ = true;
                     }
                     loop11:
                     while(true)
                     {
                        if(this.crouching)
                        {
                           while(Boolean(this.hitTest(-17,-20)) || Boolean(this.hitTest(-17,-25)) || Boolean(this.hitTest(-17,-35)))
                           {
                              _loc7_ = this.unit;
                              _loc8_ = _loc7_.x + 1;
                              _loc7_.x = _loc8_;
                           }
                           while(true)
                           {
                              if(2 == 3)
                              {
                                 break loop11;
                              }
                              this.unit.y -= 0.5;
                           }
                           break;
                           addr0f20:
                           addr0ee3:
                        }
                        else
                        {
                           while(Boolean(this.hitTest(-17,-20)) || Boolean(this.hitTest(-17,-25)) || Boolean(this.hitTest(-17,-35)) || Boolean(this.hitTest(-17,-45)))
                           {
                              _loc7_ = this.unit;
                              _loc8_ = _loc7_.x + 1;
                              _loc7_.x = _loc8_;
                           }
                        }
                        if(this.hitTest(0,0))
                        {
                           this.unit.y -= 0.5;
                           §§goto(addr0f20);
                        }
                        §§goto(addr0ee3);
                     }
                     if(_loc2_)
                     {
                        this.doJump(1);
                     }
                     if(_loc3_)
                     {
                        this.doJump(-1);
                     }
                     if(!this.jumping)
                     {
                        this.tiltL = this.tiltR = -10;
                        _loc6_ = 0;
                        while(_loc6_ < 30 && !this.hitTest(-10,this.tiltL))
                        {
                           _loc6_++;
                           _loc7_ = this;
                           _loc8_ = _loc7_.tiltL + 1;
                           _loc7_.tiltL = _loc8_;
                        }
                        _loc6_ = 0;
                        while(_loc6_ < 30 && !this.hitTest(10,this.tiltR))
                        {
                           _loc6_++;
                           _loc7_ = this;
                           _loc8_ = _loc7_.tiltR + 1;
                           _loc7_.tiltR = _loc8_;
                        }
                        if(this.tiltL < 20 && this.tiltR < 20)
                        {
                           _loc4_ = UT.getRotation(-10,this.tiltL,10,this.tiltR) - 90;
                        }
                        else
                        {
                           _loc4_ = 0;
                        }
                     }
                     else
                     {
                        _loc4_ = 0;
                     }
                     this.unit.MC.rotation += (_loc4_ - this.unit.MC.rotation) * 0.3;
                     if(this.crouching && !(this.unit.keys & this.unit.LEFT) && !(this.unit.keys & this.unit.RIGHT))
                     {
                        this.unit.nextAnim = "duck";
                     }
                     if(this.landHard)
                     {
                        this.unit.nextAnim = "landhard";
                     }
                     return;
                     addr0aa5:
                  }
                  _loc7_ = this.unit;
                  _loc8_ = _loc7_.y + 1;
                  _loc7_.y = _loc8_;
               }
               while(this.yVel >= 0);
               this.yVel = 0;
               addr0a8c:
            }
         }
         while(true)
         {
            if(2 != 3)
            {
               §§goto(addr0a8c);
            }
            §§goto(addr0b25);
            this.yVel = 0;
         }
         §§goto(addr0aa5);
      }
      
      public function hitTest(param1:Number = 0, param2:Number = 0) : uint
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:uint = this.unit.game.arena.wall.getPixel32(this.unit.x + param1,this.unit.y + param2);
         if(!_loc3_)
         {
            return _loc3_;
         }
         return _loc3_.toString(16).substring(0,2) == "ff" ? _loc3_ : 0;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

