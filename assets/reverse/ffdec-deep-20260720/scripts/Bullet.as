package
{
   public class Bullet
   {
      
      §§push(Bullet);
      if(37 == 34)
      {
         return;
      }
      
      protected var game:Game;
      
      protected var unit:Unit;
      
      protected var stats:Stats_Guns;
      
      public var remove:Boolean;
      
      protected var rotation:Number;
      
      protected var x:Number;
      
      protected var y:Number;
      
      protected var ox:Number;
      
      protected var oy:Number;
      
      protected var xVel:Number;
      
      protected var yVel:Number;
      
      private var isProjectile:Boolean;
      
      protected var hitType:String;
      
      protected var hitObject:*;
      
      protected var curDist:Number;
      
      protected var maxDist:Number;
      
      protected var dmgMod:Number;
      
      protected var extra:Object;
      
      public function Bullet(param1:Game, param2:Unit, param3:Number, param4:Number, param5:Number, param6:uint, param7:String, param8:Boolean, param9:Object = null)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc10_:uint = 0;
         super();
         this.game = param1;
         this.unit = param2;
         if(param9)
         {
            this.extra = param9;
         }
         else
         {
            this.extra = {};
         }
         this.dmgMod = this.extra.dmgMod ? Number(this.extra.dmgMod) : 1;
         this.stats = Stats_Guns.gunOb[param7];
         this.isProjectile = param8;
         this.curDist = 0;
         this.maxDist = (this.extra.range ? this.extra.range : this.stats.range) + UT.irand(-3,3);
         this.maxDist *= 10;
         if(this.extra.noMove)
         {
            this.xVel = 0;
            this.yVel = 0;
         }
         else
         {
            this.rotation = param3;
            if(!this.extra.noUnit)
            {
               this.x = param4 + UT.xMoveToRot(this.rotation + 90 * this.unit.MC.scaleX,this.stats.yOff);
               this.y = param5 + UT.yMoveToRot(this.rotation + 90 * this.unit.MC.scaleX,this.stats.yOff);
            }
            else
            {
               this.x = param4;
               this.y = param5;
            }
            this.xVel = UT.xMoveToRot(this.rotation,10);
            this.yVel = UT.yMoveToRot(this.rotation,10);
            _loc10_ = 0;
            while(_loc10_ <= param6)
            {
               this.x += this.xVel * 0.5;
               this.y += this.yVel * 0.5;
               §§push(this);
               var _temp_1:* = this.hitTestAll();
               if(§§pop().hitObject = this.hitTestAll())
               {
                  break;
               }
               _loc10_++;
               if(2 == 3)
               {
                  break;
               }
            }
         }
         this.ox = this.x;
         this.oy = this.y;
         if(this.stats.effShoot)
         {
            this.game.createEffect(this.ox,this.oy,this.stats.effShoot);
         }
      }
      
      protected function doHitEffect(param1:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:uint = 0;
         var _loc3_:* = undefined;
         var _loc4_:Number = NaN;
         if(!this.hitType)
         {
            if(!param1)
            {
               return;
            }
            this.hitType = "wall";
         }
         if(Boolean(this.hitType) && Boolean(this.stats.extra.bounceShots))
         {
            if(this.hitType == "unit")
            {
               this.hitObject.status.damage(this.stats.dmg * this.dmgMod,this.unit,this.stats,this.extra);
            }
            this.x -= this.xVel * 3;
            this.y -= this.yVel * 3;
            _loc2_ = 0;
            while(_loc2_ < this.stats.extra.bounceShots)
            {
               this.unit.game.bullets.push(new Stats_Guns.gunOb["bouncer"].cls(this.unit.game,this.unit,UT.rand(0,360),this.x,this.y,0,"bouncer"));
               _loc2_++;
               if(2 == 3)
               {
                  break;
               }
            }
            if(this.isProjectile)
            {
               this.removeMe();
            }
            return;
         }
         if(this.hitType == "unit")
         {
            if(this.hitObject.status.sReflect)
            {
               if(this.extra.reflect)
               {
                  return;
               }
               _loc3_ = UT.rotBounceOff(this.rotation,this.x - this.xVel * 10,this.y - this.yVel * 10,this.hitObject.x,this.hitObject.y - 20);
               this.unit.game.bullets.push(new this.stats.cls(this.unit.game,this.hitObject,_loc3_ + UT.rand(-10,10),this.x,this.y,0,this.stats.id,{"reflect":this.unit}));
               if(this.isProjectile)
               {
                  this.removeMe();
               }
               return;
            }
            if(this.hitObject.gun.reflecting)
            {
               _loc4_ = this.hitObject.aimRoation - UT.getRotation(this.hitObject.x,this.hitObject.y,this.x,this.y);
               if(Math.abs(_loc4_) < 80)
               {
                  if(Math.random() < this.hitObject.gun.reflecting && this.stats.typeName != "Melee" && (this.stats.typeName != "Explosive" || this.stats.id == "Thumper" || this.stats.id == "Lawnchair"))
                  {
                     if(this.extra.reflect)
                     {
                        return;
                     }
                     _loc3_ = UT.rotBounceOff(this.rotation,this.x - this.xVel * 10,this.y - this.yVel * 10,this.hitObject.x,this.hitObject.y - 20);
                     this.unit.game.bullets.push(new this.stats.cls(this.unit.game,this.hitObject,_loc3_ + UT.rand(-10,10),this.x,this.y,0,this.stats.id,{"reflect":this.unit}));
                     if(this.isProjectile)
                     {
                        this.removeMe();
                     }
                     this.game.playScreenSound(UT.randEl([S_Reflect1,S_Reflect2,S_Reflect3]),this.x,this.y);
                     this.game.createEffect(this.x,this.y,"bulletspark");
                     return;
                  }
                  this.extra.shielded = true;
               }
            }
            if(!this.hitObject.status.sSpawn)
            {
               if(Boolean(this.extra.shielded) || Boolean(this.hitObject.status.shCur))
               {
                  this.game.createEffect(this.x,this.y,"bulletspark");
               }
               else if(SD.blood)
               {
                  this.game.createEffect(this.x,this.y,"bulletspark");
               }
            }
            if(this.isProjectile)
            {
               this.x -= this.xVel;
               this.y -= this.yVel;
               if(!this.stats.extra.pierce)
               {
                  this.removeMe();
               }
            }
            else
            {
               this.x -= this.xVel * 0.5;
               this.y -= this.yVel * 0.5;
            }
            if(this.stats.effHit)
            {
               this.game.createEffect(this.x,this.y,this.stats.effHit);
            }
            if(this.stats.splash)
            {
               this.extra.hitX = this.x;
               this.extra.hitY = this.y;
            }
            this.hitObject.status.damage(this.stats.dmg * this.dmgMod,this.unit,this.stats,this.extra);
         }
         if(this.hitType == "corpse")
         {
            if(SD.blood)
            {
               this.game.createEffect(this.x,this.y,"bloodmist");
            }
            if(this.isProjectile)
            {
               this.x -= this.xVel;
               this.y -= this.yVel;
               if(!this.stats.extra.pierce)
               {
                  this.removeMe();
               }
            }
            if(this.stats.effHit)
            {
               this.game.createEffect(this.x,this.y,this.stats.effHit);
            }
            if(this.stats.splash)
            {
               this.extra.hitX = this.x;
               this.extra.hitY = this.y;
            }
            this.game.physWorld.hitCorpse(this.hitObject,this.unit,this.stats,this.extra);
         }
         if(this.hitType == "wall")
         {
            if(this.isProjectile)
            {
               this.x -= this.xVel;
               this.y -= this.yVel;
               if(!this.stats.extra.burrow)
               {
                  this.removeMe();
               }
               else
               {
                  this.extra.burrowMult = 2;
                  this.yVel -= this.stats.params[2] * 0.1;
               }
            }
            if(!this.stats.extra.burrow)
            {
               if(this.stats.effHit)
               {
                  this.game.createEffect(this.x,this.y,this.stats.effHit);
               }
            }
            else
            {
               this.game.createEffect(this.x,this.y,"mud_splash");
            }
            switch(this.hitObject)
            {
               case "9900ff":
                  §§push(0);
                  break;
               case "":
                  §§push(1);
                  break;
               case "ff0000":
                  §§push(2);
                  break;
               case "00ffff":
                  §§push(3);
                  break;
               case "993300":
                  §§push(4);
                  break;
               case "670067":
                  §§push(5);
                  break;
               case "6699ff":
                  §§push(6);
                  break;
               case "ffffff":
                  §§push(7);
                  break;
               case "006600":
                  §§push(8);
                  break;
               default:
                  §§push(9);
            }
            2;
            switch(§§pop())
            {
               case 0:
                  if(Stats_Campaign.sn == 9)
                  {
                     this.game.hud.gotoAndStop("idle");
                     this.game.hud.setMsg(this.game.player,"It looks like the elevator\'s out.. I\'ll have to jump.",5,true,V_Ca1_7);
                     var _loc5_:Stats_Campaign = Stats_Campaign;
                     var _loc6_:Number = _loc5_.sn + 1;
                     _loc5_.sn = _loc6_;
                     this.game.player.gun.curAmmo.clipCur = 0;
                     this.game.player.gun.curAmmo.spareCur = 0;
                     this.game.arena.changeWallFrame(Stats_Campaign.sn);
                     this.game.arena.elevator.play();
                     _loc2_ = 0;
                     while(_loc2_ < this.unit.game.arena.downarrows.length)
                     {
                        this.unit.game.arena.downarrows[_loc2_].visible = false;
                        _loc2_++;
                        if(2 == 3)
                        {
                           break;
                        }
                     }
                  }
                  break;
               case 1:
               case 2:
               case 3:
                  break;
               case 4:
                  if(SD.graphPart)
                  {
                     this.game.createEffect(this.x,this.y,"mud_splash");
                  }
                  break;
               case 5:
               case 6:
                  break;
               case 7:
                  if(SD.graphPart)
                  {
                     this.game.createEffect(this.x,this.y,"snow_splash");
                  }
                  break;
               case 8:
                  this.game.createEffect(this.x,this.y,"leaf_splash");
                  _loc2_ = 0;
                  while(_loc2_ < SD.graphPart)
                  {
                     this.game.createParticle(this.x + UT.rand(-10,10),this.y,"leaf",null,"leaves","leaf" + UT.irand(1,4));
                     _loc2_++;
                     if(2 == 3)
                     {
                        break;
                     }
                  }
            }
         }
         if(this.stats.hitSound)
         {
            this.unit.game.playScreenSound(this.stats.hitSound,this.x,this.y);
         }
         this.checkSplash();
      }
      
      protected function hitTestAll(param1:Number = 0, param2:Number = 0, param3:Boolean = false) : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc5_:uint = 0;
         var _loc6_:uint = 0;
         var _loc4_:uint = this.game.arena.wall.getPixel32(this.x + param1,this.y + param2);
         if(!this.extra.ignoreAll)
         {
            if(Boolean(!param3) && Boolean(_loc4_) && _loc4_.toString(16).substring(0,2) == "ff")
            {
               this.hitType = "wall";
               return _loc4_.toString(16).substring(2);
            }
         }
         _loc5_ = 0;
         do
         {
            if(_loc5_ >= this.game.units.length)
            {
               break;
            }
            if(this.game.units[_loc5_] != this.unit)
            {
               if(!this.game.units[_loc5_].dead)
               {
                  if(!this.game.units[_loc5_].status.sBlur)
                  {
                     if(!(Boolean(this.unit.team) && this.unit.team == this.game.units[_loc5_].team))
                     {
                        _loc6_ = 0;
                        if(!this.game.units[_loc5_].mov.crouching)
                        {
                           if(!UT.inBox(this.x,this.y,this.game.units[_loc5_].x - 13,this.game.units[_loc5_].y - 66,26,66))
                           {
                              continue;
                           }
                           if(UT.inBox(this.x,this.y,this.game.units[_loc5_].x - 13,this.game.units[_loc5_].y - 44,26,44))
                           {
                              _loc6_ = 1;
                           }
                           else
                           {
                              _loc6_ = 2;
                           }
                        }
                        else
                        {
                           if(!UT.inBox(this.x,this.y,this.game.units[_loc5_].x - 13,this.game.units[_loc5_].y - 44,26,44))
                           {
                              continue;
                           }
                           if(UT.inBox(this.x,this.y,this.game.units[_loc5_].x - 13,this.game.units[_loc5_].y - 28,26,28))
                           {
                              _loc6_ = 1;
                           }
                           else
                           {
                              _loc6_ = 2;
                           }
                        }
                        if(_loc6_ == 1)
                        {
                           this.hitType = "unit";
                           if(this.stats.splash >= 80)
                           {
                              this.extra.splashDirect = true;
                           }
                           return this.game.units[_loc5_];
                        }
                        if(_loc6_ == 2)
                        {
                           if(UT.getPosNegSign(this.unit.x - this.game.units[_loc5_].x) != this.game.units[_loc5_].MC.scaleX)
                           {
                              this.extra.assassin = 1.5;
                           }
                           this.extra.headMult = 1.5;
                           this.hitType = "unit";
                           if(this.stats.splash >= 80)
                           {
                              this.extra.splashDirect = true;
                           }
                           return this.game.units[_loc5_];
                        }
                     }
                  }
               }
            }
         }
         while(_loc5_++, 2 != 3);
         _loc5_ = 0;
         while(_loc5_ < this.game.physWorld.actors.length)
         {
            if(UT.getDist(this.x,this.y,this.game.physWorld.actors[_loc5_].rdBody.GetDefinition().userData.x,this.game.physWorld.actors[_loc5_].rdBody.GetDefinition().userData.y) < 30)
            {
               this.hitType = "corpse";
               return this.game.physWorld.actors[_loc5_];
            }
            _loc5_++;
            if(2 == 3)
            {
               break;
            }
         }
         this.hitType = "";
         return null;
      }
      
      protected function hitTestWall(param1:Number = 0, param2:Number = 0) : Boolean
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:uint = this.game.arena.wall.getPixel32(this.x + param1,this.y + param2);
         return Boolean(_loc3_) && _loc3_.toString(16).substring(0,2) == "ff";
      }
      
      protected function checkSplash() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:Number = NaN;
         var _loc3_:uint = 0;
         if(!this.stats.splash)
         {
            return;
         }
         var _loc1_:uint = 0;
         while(_loc1_ < this.game.units.length)
         {
            if(!this.game.units[_loc1_].dead)
            {
               if(!(this.hitType == "unit" && this.hitObject == this.game.units[_loc1_]))
               {
                  if(UT.getDist(this.x,this.y,this.game.units[_loc1_].x,this.game.units[_loc1_].y - 45) < this.stats.splash)
                  {
                     this.cleanExtra();
                     _loc2_ = UT.getRotation(this.x,this.y,this.game.units[_loc1_].x,this.game.units[_loc1_].y - 45);
                     _loc3_ = this.game.arena.wall.getPixel32(this.x + UT.xMoveToRot(_loc2_,10),this.y + UT.yMoveToRot(_loc2_,10));
                     if(!(Boolean(_loc3_) && _loc3_.toString(16).substring(0,2) == "ff"))
                     {
                        if(Boolean(this.stats.splash) && this.stats.splash < 80)
                        {
                           this.extra.splashIndirect = true;
                        }
                        this.extra.hitX = this.x;
                        this.extra.hitY = this.y;
                        this.extra.splashMult = this.stats.splashMult;
                        this.game.units[_loc1_].status.damage(this.stats.dmg,this.unit,this.stats,this.extra);
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
      
      protected function removeMe() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.remove = true;
      }
      
      protected function cleanExtra() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:* = {};
         _loc1_.corpseStick = this.extra.corpseStick;
         _loc1_.reflect = this.extra.reflect;
         this.extra = _loc1_;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

