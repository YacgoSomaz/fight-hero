package
{
   public class Killstreak_Helicopter
   {
      
      §§push(Killstreak_Helicopter);
      if(37 == 34)
      {
         return;
      }
      
      private var game:Game;
      
      public var unit:*;
      
      private var MC:Helicopter;
      
      private var maxWidth:Number;
      
      public var x:Number;
      
      public var y:Number;
      
      private var _x:Number;
      
      private var _y:Number;
      
      private var toX:Number;
      
      private var toY:Number;
      
      private var rot1:Number;
      
      private var rot2:Number;
      
      private var rotX:Number;
      
      private var rotY:Number;
      
      private var rot:Number;
      
      private var fc:uint = 0;
      
      private var target:*;
      
      private var done:Number = 0;
      
      private var gunRot:Number;
      
      private var timer:uint;
      
      public function Killstreak_Helicopter(param1:Game, param2:*)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.game = param1;
         this.unit = param2;
         this.MC = new Helicopter();
         this.game.unitCont.addChild(this.MC);
         this.maxWidth = this.game.arena.wall.width;
         this._x = this.MC.x = this.maxWidth / 2;
         this._y = this.MC.y = -100;
         this.rot1 = UT.rand(0,360);
         this.rot2 = UT.rand(0,360);
         this.rot = UT.getRotation(this._x,this._y,this.toX,this.toY);
         this.gunRot = 180;
         this.timer = 10 * 30;
         if(this.unit.unitInfo.extra.permaStreak)
         {
            this.timer = 9999999;
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
         var _loc2_:Killstreak_Helicopter = this;
         var _loc3_:Number = _loc2_.fc + 1;
         _loc2_.fc = _loc3_;
         this.rot1 += 1;
         this.rot2 += 2;
         this.rotX = UT.xMoveToRot(this.rot1,80);
         this.rotY = UT.yMoveToRot(this.rot2,35);
         if(this.done)
         {
            this._y -= this.done;
            this.done += 1;
            this.MC.x = this.x = this._x + this.rotX;
            this.MC.y = this.y = this._y + this.rotY;
            if(this.y < -100)
            {
               this.end();
            }
            return;
         }
         this._x += (this.unit.x - this._x) * 0.04;
         this._y += (this.unit.y - 200 - this._y) * 0.06;
         this.MC.x = this.x = this._x + this.rotX;
         this.MC.y = this.y = this._y + this.rotY;
         if(this.fc % 6 == 0)
         {
            this.target = null;
            _loc1_ = 0;
            while(_loc1_ < this.game.units.length)
            {
               if(this.game.units[_loc1_] != this.unit)
               {
                  if(!this.game.units[_loc1_].dead)
                  {
                     if(!(Boolean(this.unit.team) && this.game.units[_loc1_].team == this.unit.team))
                     {
                        if(UT.getDist(this.x,this.y,this.game.units[_loc1_].x,this.game.units[_loc1_].y) < 300)
                        {
                           this.target = this.game.units[_loc1_];
                        }
                     }
                  }
               }
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
         }
         if(this.target)
         {
            this.gunRot += UT.rotateDirection(this.gunRot,UT.getRotation(this.x,this.y,this.target.x,this.target.y)) * 3;
         }
         else
         {
            this.gunRot += UT.rotateDirection(this.gunRot,180) * 3;
         }
         this.MC.gun.rotation = this.gunRot;
         if(Boolean(this.target) && this.fc % 3 == 0)
         {
            this.game.playScreenSound(S_assaultFire,this.MC.x,this.MC.y);
            this.game.bullets.push(new Stats_Guns.gunOb["heli"].cls(this.game,this.unit,this.gunRot,this.x,this.y,0,"heli",{"noUnit":true}));
         }
         if(Boolean(this.unit.dead) || this.fc >= this.timer)
         {
            this.done = 1;
         }
      }
      
      public function end() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.unit.endKillstreak();
         this.game.unitCont.removeChild(this.MC);
         this.game.killstreaks.splice(this.game.killstreaks.indexOf(this),1);
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

