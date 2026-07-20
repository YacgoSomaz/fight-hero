package
{
   public class Particle
   {
      
      §§push(Particle);
      if(37 == 34)
      {
         return;
      }
      
      private var game:Game;
      
      public var remove:Boolean;
      
      private var behave:String;
      
      private var name:String;
      
      private var sub:String;
      
      private var x:Number;
      
      private var y:Number;
      
      private var hitFrame:uint;
      
      private var stats:Object;
      
      private var frame:uint;
      
      private var holdFrame:Boolean;
      
      private var xSpd:Number;
      
      private var ySpd:Number;
      
      private var xVel:Number;
      
      private var yVel:Number;
      
      private var extra:Object;
      
      private var hitCount:uint;
      
      private var rotation:Number;
      
      private var fc:uint;
      
      public function Particle(param1:Game, param2:Number, param3:Number, param4:String, param5:uint, param6:Object, param7:String, param8:String, param9:uint)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.game = param1;
         this.x = param2;
         this.y = param3;
         this.fc = 0;
         this.behave = param4;
         this.hitFrame = param5;
         this.name = param7;
         this.sub = param8;
         this.extra = param6 ? param6 : {};
         this.stats = BH.getBitAniStats(this.name + 0,this.sub);
         this.rotation = UT.irand(0,this.stats.rotAmt - 1);
         if(param9)
         {
            this.frame = param9;
            this.holdFrame = true;
         }
         else
         {
            this.frame = 1;
         }
         this.name += this.rotation;
         switch(this.behave)
         {
            case "fairy":
               §§push(0);
               break;
            case "waterdrop":
               §§push(1);
               break;
            case "water":
               §§push(2);
               break;
            case "snow":
               §§push(3);
               break;
            case "shell":
               §§push(4);
               break;
            case "spark":
               §§push(5);
               break;
            case "geiser":
               §§push(6);
               break;
            case "leaf":
               §§push(7);
               break;
            case "raise":
               §§push(8);
               break;
            case "move":
               §§push(9);
               break;
            case "fish":
               §§push(10);
               break;
            case "text":
               §§push(11);
               break;
            case "slowText":
               §§push(12);
               break;
            default:
               §§push(13);
         }
         2;
         switch(§§pop())
         {
            case 0:
               this.extra.rot1 = Math.random() * 360;
               this.extra.rot2 = Math.random() * 360;
               break;
            case 1:
               this.holdFrame = true;
               this.xSpd = UT.rand(-1,1);
               this.ySpd = UT.rand(0,1);
               break;
            case 2:
               this.xSpd = UT.rand(this.extra.min,this.extra.max);
               this.ySpd = UT.rand(-1,3);
               break;
            case 3:
               this.xSpd = UT.rand(0,1);
               this.ySpd = UT.rand(3,5);
               break;
            case 4:
               this.xSpd = UT.xMoveToRot(this.extra.rot - 110 * this.extra.flip + UT.rand(-15,15),8);
               this.ySpd = UT.yMoveToRot(this.extra.rot - 110 * this.extra.flip + UT.rand(-15,15),8);
               break;
            case 5:
               this.xSpd = UT.rand(-2,2);
               this.ySpd = UT.rand(-1,3);
               if(this.extra.xSpd)
               {
                  this.xSpd = this.extra.xSpd;
               }
               if(this.extra.ySpd)
               {
                  this.ySpd = this.extra.ySpd;
               }
               break;
            case 6:
               this.xSpd = UT.rand(-2,2);
               this.ySpd = UT.rand(-1,0);
               if(this.extra.xSpd)
               {
                  this.xSpd = this.extra.xSpd;
               }
               if(this.extra.ySpd)
               {
                  this.ySpd = this.extra.ySpd;
               }
               break;
            case 7:
               this.hitFrame = 10;
               this.xSpd = UT.rand(0,1);
               this.ySpd = UT.rand(0.5,3);
               this.rotation = Math.random() * 360;
               break;
            case 8:
               this.ySpd = UT.rand(1,3) * param6.spd;
               this.xSpd = this.ySpd * this.extra.xspd ? Number(this.extra.xspd) : 0;
               break;
            case 9:
               this.ySpd = this.extra.yspd;
               this.xSpd = this.extra.xspd;
               break;
            case 10:
               this.extra.rot1 = Math.random() * 360;
               this.extra.rot2 = Math.random() * 360;
               break;
            case 11:
               this.ySpd = -1;
               this.yVel = 20;
               this.holdFrame = true;
               this.frame = 1;
               break;
            case 12:
               this.ySpd = -0.7;
               this.yVel = 35;
         }
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         if(this.remove)
         {
            return;
         }
         var _loc2_:Particle = this;
         var _loc3_:Number = _loc2_.fc + 1;
         _loc2_.fc = _loc3_;
         switch(this.behave)
         {
            case "fairy":
               §§push(0);
               break;
            case "waterdrop":
               §§push(1);
               break;
            case "water":
               §§push(2);
               break;
            case "snow":
               §§push(3);
               break;
            case "shell":
               §§push(4);
               break;
            case "spark":
               §§push(5);
               break;
            case "geiser":
               §§push(6);
               break;
            case "leaf":
               §§push(7);
               break;
            case "raise":
               §§push(8);
               break;
            case "move":
               §§push(9);
               break;
            case "fish":
               §§push(10);
               break;
            case "text":
               §§push(11);
               break;
            case "slowText":
               §§push(12);
               break;
            default:
               §§push(13);
         }
         2;
         switch(§§pop())
         {
            case 0:
               this.extra.rot1 += 1;
               this.extra.rot2 += 2;
               this.x += UT.xMoveToRot(this.extra.rot1,1);
               this.y += UT.yMoveToRot(this.extra.rot2,0.6);
               this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,this.frame);
               break;
            case 1:
               this.x += this.xSpd;
               this.y += this.ySpd;
               this.ySpd += 0.5;
               if(!this.hitCount && (Boolean(this.hitTest()) || Boolean(this.hitTestPlayer())))
               {
                  this.y -= this.ySpd;
                  this.ySpd = 0;
                  this.hitCount = 1;
               }
               this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,this.frame);
               if(this.hitCount)
               {
                  _loc2_ = this;
                  _loc3_ = _loc2_.frame + 1;
                  _loc2_.frame = _loc3_;
                  if(this.frame == this.stats.frames)
                  {
                     this.remove = true;
                  }
               }
               break;
            case 2:
               this.x += this.xSpd;
               this.y += this.ySpd;
               this.ySpd += 0.5;
               if(!this.hitCount)
               {
                  if(this.fc >= this.hitFrame && Boolean(this.hitTest()))
                  {
                     this.hitCount = 1;
                  }
                  _loc1_ = 0;
                  while(_loc1_ < this.game.units.length)
                  {
                     if(!this.game.units[_loc1_].dead)
                     {
                        if(UT.inBox(this.x,this.y,this.game.units[_loc1_].x - 25,this.game.units[_loc1_].y - 70,50,50))
                        {
                           this.hitCount = 1;
                        }
                     }
                     _loc1_++;
                     if(2 == 3)
                     {
                        break;
                     }
                  }
               }
               if(this.hitCount == 1)
               {
                  this.xSpd *= 3;
                  this.y -= this.ySpd;
                  this.ySpd *= -UT.rand(0.2,0.5);
                  this.hitCount = 1;
                  this.game.createEffect(this.x,this.y,"snow_splash");
               }
               if(this.hitCount)
               {
                  _loc2_ = this;
                  _loc3_ = _loc2_.hitCount + 1;
                  _loc2_.hitCount = _loc3_;
                  if(this.hitCount == 20)
                  {
                     this.remove = true;
                  }
                  this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,uint(this.hitCount / 10) + 2);
               }
               else
               {
                  this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,1);
               }
               break;
            case 3:
               this.x += this.xSpd;
               this.y += this.ySpd;
               if(this.fc > 150 && this.fc % 3 == 0 && Boolean(this.hitTest()))
               {
                  this.game.createEffect(this.x,this.y,"snow_splash");
                  this.remove = true;
               }
               this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,this.frame);
               break;
            case 4:
               this.x += this.xSpd;
               this.y += this.ySpd;
               this.ySpd += 1;
               if(this.hitTest())
               {
                  this.remove = true;
               }
               this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,this.frame);
               break;
            case 5:
               this.x += this.xSpd;
               this.y += this.ySpd;
               this.ySpd += 0.5;
               if(!this.hitCount && (Boolean(this.hitTest()) || Boolean(this.hitTestPlayer())))
               {
                  this.xSpd *= 3;
                  this.y -= this.ySpd;
                  this.ySpd *= -UT.rand(0.2,0.5);
                  this.hitCount = 1;
               }
               if(this.hitCount)
               {
                  _loc2_ = this;
                  _loc3_ = _loc2_.hitCount + 1;
                  _loc2_.hitCount = _loc3_;
                  if(this.hitCount == 20)
                  {
                     this.remove = true;
                  }
                  this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,uint(this.hitCount / 10) + 2);
               }
               else
               {
                  this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,1);
               }
               break;
            case 6:
               this.x += this.xSpd;
               this.y += this.ySpd;
               this.ySpd += 0.5;
               if(!this.hitCount && (Boolean(this.hitTest()) || Boolean(this.hitTestPlayer())))
               {
                  this.xSpd *= 10;
                  this.ySpd = UT.rand(-2,2);
                  this.hitCount = 1;
               }
               if(!this.hitCount && this.ySpd > 0)
               {
                  this.hitCount = 1;
               }
               if(this.hitCount)
               {
                  _loc2_ = this;
                  _loc3_ = _loc2_.hitCount + 1;
                  _loc2_.hitCount = _loc3_;
                  if(this.hitCount == 20)
                  {
                     this.remove = true;
                  }
                  this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,uint(this.hitCount / 10) + 2);
               }
               else
               {
                  this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,1);
               }
               break;
            case 7:
               this.rotation += 5;
               this.x += UT.xMoveToRot(this.rotation,2);
               this.x += this.xSpd;
               this.y += this.ySpd;
               if(this.fc >= this.hitFrame && Boolean(this.hitTest()))
               {
                  this.remove = true;
               }
               this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,this.frame);
               break;
            case 8:
               this.x += this.xSpd;
               this.y -= this.ySpd;
               if(this.fc == 20)
               {
                  this.remove = true;
               }
               this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,this.frame);
               break;
            case 9:
               this.x += this.xSpd;
               this.y += this.ySpd;
               if(this.frame == this.stats.frames)
               {
                  this.remove = true;
               }
               this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,this.frame);
               break;
            case 10:
               this.extra.rot1 += 0.4;
               this.extra.rot2 += 2;
               this.xVel = UT.xMoveToRot(this.extra.rot1,1);
               this.yVel = UT.yMoveToRot(this.extra.rot2,0.1);
               this.x += this.xVel;
               this.y += this.yVel;
               this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,this.xVel > 0 ? 1 : 2);
               break;
            case 11:
            case 12:
               this.y += this.ySpd;
               this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,this.frame);
               if(this.fc > this.yVel)
               {
                  this.remove = true;
               }
         }
         if(!this.holdFrame)
         {
            _loc2_ = this;
            _loc3_ = _loc2_.frame + 1;
            _loc2_.frame = _loc3_;
            if(this.frame > this.stats.frames)
            {
               this.frame = 1;
            }
         }
      }
      
      private function hitTest(param1:Number = 0, param2:Number = 0) : uint
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.fc < this.hitFrame)
         {
            return 0;
         }
         var _loc3_:uint = this.game.arena.wall.getPixel32(this.x + param1,this.y + param2);
         if(!_loc3_)
         {
            return _loc3_;
         }
         return _loc3_.toString(16).substring(0,2) == "ff" ? _loc3_ : 0;
      }
      
      private function hitTestPlayer() : Boolean
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.game.player.dead)
         {
            return false;
         }
         if(this.fc < this.hitFrame)
         {
            return false;
         }
         return UT.inBox(this.x,this.y,this.game.player.x - 20,this.game.player.y - UT.rand(55,70),40,50);
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

