package
{
   import flash.display.MovieClip;
   import flash.filters.BevelFilter;
   
   public class Guns
   {
      
      §§push(Guns);
      if(37 == 34)
      {
         return;
      }
      
      private var unit:Unit;
      
      private var shootDelay:uint;
      
      private var shotPressed:Boolean;
      
      public var reloading:Boolean;
      
      public var reflecting:Number;
      
      public var curFrame:String;
      
      public var dynRecoil:Number;
      
      public var dynRecoilMod:Number;
      
      public var primary:Stats_Guns;
      
      private var secondary:Stats_Guns;
      
      public var curGun:Stats_Guns;
      
      private var primaryAmmo:Object;
      
      private var secondaryAmmo:Object;
      
      public var curAmmo:Object;
      
      private var hud:Hud;
      
      private var soundFrames:uint = 0;
      
      private var shotTimer:uint = 0;
      
      public function Guns(param1:Unit)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.unit = param1;
         if(this.unit.human)
         {
            this.hud = this.unit.game.hud;
         }
      }
      
      public function setGuns(param1:String, param2:String) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         trace("setGUN",param1,param2);
         this.primary = Stats_Guns.gunOb[param1];
         this.secondary = Stats_Guns.gunOb[param2];
         if(this.unit.unitInfo.skill.id == "clip" && this.primary.typeName == "Machine Gun")
         {
            this.primaryAmmo = {};
            this.primaryAmmo.total = Math.ceil(this.primary.clipSize * (this.primary.clipSpare + 1) * this.unit.unitInfo.amm);
            this.primaryAmmo.clipCur = this.primaryAmmo.clipMax = 2;
            §§push(this.primaryAmmo);
            §§push(this.primaryAmmo);
            var _temp_2:* = this.primaryAmmo.total;
            var _loc3_:*;
            §§pop().spareMax = _loc3_ = this.primaryAmmo.total;
            §§pop().spareCur = _loc3_;
         }
         else
         {
            this.primaryAmmo = {};
            this.primaryAmmo.total = Math.ceil(this.primary.clipSize * (this.primary.clipSpare + 1) * this.unit.unitInfo.amm);
            if(this.primary.clipSize)
            {
               this.primaryAmmo.clipCur = this.primaryAmmo.clipMax = this.primary.clipSize;
            }
            else
            {
               §§push(this.primaryAmmo);
               this.primaryAmmo.clipMax = _loc3_ = 1;
               §§pop().clipCur = _loc3_;
            }
            this.primaryAmmo.spareCur = this.primaryAmmo.spareMax = this.primaryAmmo.total - this.primary.clipSize;
         }
         this.secondaryAmmo = {};
         this.secondaryAmmo.total = Math.ceil(this.secondary.clipSize * (this.secondary.clipSpare + 1) * this.unit.unitInfo.amm);
         if(this.secondary.clipSize)
         {
            this.secondaryAmmo.clipCur = this.secondaryAmmo.clipMax = this.secondary.clipSize;
         }
         else
         {
            §§push(this.secondaryAmmo);
            this.secondaryAmmo.clipMax = _loc3_ = 1;
            §§pop().clipCur = _loc3_;
         }
         this.secondaryAmmo.spareCur = this.secondaryAmmo.spareMax = this.secondaryAmmo.total - this.secondary.clipSize;
         if(!this.unit.human && this.primary.typeName == "Shield")
         {
            this.secondaryAmmo.spareCur = this.secondaryAmmo.spareMax = 999999;
         }
         if(!this.unit.human && this.secondary.type == 0)
         {
            this.secondaryAmmo.spareCur = this.secondaryAmmo.spareMax = 999999;
         }
         this.unit.MC.gun.gotoAndStop(this.primary.sprite);
         this.unit.MC.legup1.gun.gotoAndStop(this.secondary.sprite);
         this.reset();
      }
      
      public function setShield(param1:MovieClip) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.primary.typeName == "Shield")
         {
            param1.gotoAndStop(this.primary.sprite + (this.reflecting ? "b" : ""));
         }
         if(this.unit.hasFlag)
         {
            param1.gotoAndStop("flag" + this.unit.hasFlag.team);
         }
      }
      
      public function setShieldPos() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.primary.typeName != "Shield" || this.reloading || Boolean(this.shootDelay))
         {
            return;
         }
         this.setFrame("idle");
      }
      
      public function reset() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.reflecting = 0;
         this.shootDelay = 0;
         this.curGun = null;
         this.swapGuns();
         if(this.unit.unitInfo.extra.forcePistol)
         {
            this.swapGuns();
         }
      }
      
      public function swapGuns() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.primary.typeName == "Shield" || Boolean(this.unit.hasFlag))
         {
            this.curGun = this.primary;
         }
         if(this.curGun != this.primary)
         {
            this.curGun = this.primary;
            this.curAmmo = this.primaryAmmo;
            this.unit.MC.gun.visible = false;
            this.unit.MC.legup1.gun.visible = true;
            if(this.hud)
            {
               this.hud.setGuns(this.primary,this.secondary);
            }
         }
         else
         {
            this.curGun = this.secondary;
            this.curAmmo = this.secondaryAmmo;
            this.unit.MC.gun.visible = Boolean(this.unit.hasFlag) || this.primary.typeName != "Shield";
            this.unit.MC.legup1.gun.visible = false;
            if(this.hud)
            {
               this.hud.setGuns(this.secondary,this.primary);
            }
         }
         this.dynRecoil = this.curGun.recoil;
         this.unit.MC.arm1.gun.gotoAndStop(this.curGun.sprite);
         this.setFrame("idle");
         if(this.unit.mDown)
         {
            this.shotPressed = true;
         }
         if(this.hud)
         {
            trace("GUN",this.curGun.extra.vision);
            if(this.curGun.extra.vision)
            {
               this.unit.game.arena.setFocus(this.unit,true,this.curGun.extra.vision);
            }
            else
            {
               this.unit.game.arena.setFocus(this.unit,true);
            }
            this.hud.setAmmoImage(this.curAmmo.clipCur,this.curAmmo.clipMax,this.curGun.effHudBullet,this.curAmmo.spareCur);
         }
         this.reloading = false;
         this.checkReload();
      }
      
      public function addAmmo(param1:Number, param2:Boolean = true) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.primaryAmmo.spareCur += int(this.primaryAmmo.spareMax * param1);
         if(this.primaryAmmo.spareCur > this.primaryAmmo.spareMax)
         {
            this.primaryAmmo.spareCur = this.primaryAmmo.spareMax;
         }
         this.secondaryAmmo.spareCur += int(this.secondaryAmmo.spareMax * param1);
         if(this.secondaryAmmo.spareCur > this.secondaryAmmo.spareMax)
         {
            this.secondaryAmmo.spareCur = this.secondaryAmmo.spareMax;
         }
         if(this.hud)
         {
            this.hud.setAmmoImage(this.curAmmo.clipCur,this.curAmmo.clipMax,this.curGun.effHudBullet,this.curAmmo.spareCur);
         }
         if(param2)
         {
            this.unit.game.createEffect(this.unit.x,this.unit.y - 40,"ammoPickup");
         }
         this.checkReload();
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.shootDelay)
         {
            var _loc1_:Guns = this;
            var _loc2_:Number = _loc1_.shootDelay - 1;
            _loc1_.shootDelay = _loc2_;
         }
         if(this.dynRecoil > this.curGun.recoil)
         {
            this.dynRecoil -= 0.05;
         }
         if(this.reflecting)
         {
            this.dynRecoilMod = this.dynRecoil * 2;
         }
         else if(this.unit.mov.crouching)
         {
            this.dynRecoilMod = this.dynRecoil * 0.6;
         }
         else if(this.unit.mov.jumping)
         {
            this.dynRecoilMod = this.dynRecoil * 1.2;
         }
         else if(this.unit.mov.xVel)
         {
            this.dynRecoilMod = this.dynRecoil * 1.1;
         }
         else
         {
            this.dynRecoilMod = this.dynRecoil;
         }
         if(this.reflecting)
         {
            this.dynRecoilMod *= 2 - this.unit.unitInfo.aim * 0.5;
         }
         else
         {
            this.dynRecoilMod *= 2 - this.unit.unitInfo.aim;
         }
         if(this.soundFrames)
         {
            _loc1_ = this;
            _loc2_ = _loc1_.soundFrames - 1;
            _loc1_.soundFrames = _loc2_;
         }
      }
      
      public function resetFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.unit.MC.arm1.gotoAndStop(this.curGun.frameIdle);
         this.unit.MC.arm2.gotoAndStop(this.curGun.frameIdle);
      }
      
      public function setFrame(param1:String) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.curFrame = param1;
         var _loc2_:String = "";
         switch(param1)
         {
            case "idle":
               §§push(0);
               break;
            case "fire":
               §§push(1);
               break;
            case "reload":
               §§push(2);
               break;
            default:
               §§push(3);
         }
         2;
         switch(§§pop())
         {
            case 0:
               _loc2_ = this.curGun.frameIdle;
               break;
            case 1:
               _loc2_ = this.curGun.frameFire;
               break;
            case 2:
               _loc2_ = this.curGun.frameReload;
         }
         if(this.unit.hasFlag)
         {
            _loc2_ = "shield";
            this.reflecting = 0;
         }
         else if(this.primary.typeName == "Shield")
         {
            if(!this.unit.mov.crouching)
            {
               _loc2_ = "shield";
               this.reflecting = 0;
            }
            else
            {
               _loc2_ = "shieldCrouch";
               this.reflecting = this.primary.extra.reflect;
            }
         }
         switch(param1)
         {
            case "idle":
               §§push(0);
               break;
            case "fire":
               §§push(1);
               break;
            case "reload":
               §§push(2);
               break;
            default:
               §§push(3);
         }
         2;
         switch(§§pop())
         {
            case 0:
               this.unit.MC.arm1.gotoAndStop(_loc2_);
               this.unit.MC.arm2.gotoAndStop(_loc2_);
               break;
            case 1:
            case 2:
               _loc2_ += "_" + param1;
               this.unit.MC.arm1.gotoAndPlay(_loc2_);
               this.unit.MC.arm2.gotoAndPlay(_loc2_);
         }
      }
      
      public function changeGun(param1:String) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.curGun = Stats_Guns.gunOb[param1];
         this.unit.MC.arm1.gotoAndStop(this.curGun.frameIdle);
         this.unit.MC.arm2.gotoAndStop(this.curGun.frameIdle);
         this.unit.MC.arm1.gun.gotoAndStop(this.curGun.id);
         if(this.unit.mDown)
         {
            this.shotPressed = true;
         }
         this.dynRecoil = this.curGun.recoil;
      }
      
      public function releaseMouse() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.shotPressed = false;
      }
      
      public function shoot() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         if(Boolean(this.shootDelay) || Boolean(this.shotPressed) || this.reloading)
         {
            return;
         }
         if(!this.curAmmo.clipCur || this.unit.unitInfo.skill.id == "clip" && this.curGun.typeName == "Machine Gun" && !this.curAmmo.spareCur)
         {
            this.unit.game.playScreenSound(S_GunClick,this.unit.x,this.unit.y);
            return;
         }
         if(this.curGun.extra.noShoot)
         {
            return;
         }
         this.unit.status.setStealthDelay();
         if(!this.curGun.autoFire && this.unit.human)
         {
            this.shotPressed = true;
         }
         this.setFrame("fire");
         this.makeBullet(this.curGun);
         if(this.curGun.extra.extraShots)
         {
            _loc1_ = 0;
            while(_loc1_ < this.curGun.extra.extraShots)
            {
               this.makeBullet(this.curGun);
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
         }
         if(this.curGun.shotSound)
         {
            if(this.curGun.extra.soundFrames)
            {
               if(!this.soundFrames)
               {
                  this.unit.game.playScreenSound(this.curGun.shotSound,this.unit.x,this.unit.y);
                  this.soundFrames = this.curGun.extra.soundFrames;
               }
            }
            else
            {
               this.unit.game.playScreenSound(this.curGun.shotSound,this.unit.x,this.unit.y);
            }
         }
         if(Boolean(this.curGun.effShell) && Boolean(SD.graphPart))
         {
            this.unit.game.createParticle(this.unit.x + UT.xMoveToRot(this.unit.aimRoation,28),this.unit.y + this.unit.MC.arm1.y + UT.yMoveToRot(this.unit.aimRoation,28),"shell",0,{
               "rot":this.unit.aimRoation,
               "flip":this.unit.MC.scaleX
            },"shell",this.curGun.effShell);
         }
         if(SD.graphPart == 2 || SD.graphPart == 1 && this.unit.human)
         {
            this.unit.MCfilters.push(new BevelFilter(7,this.unit.aimRoation + 90,Math.random() < 0.5 ? 16777164 : 16777113,1,0,0.5,10,10,1,1));
         }
         this.shootDelay = this.curGun.shootDelay * 30;
         if(!this.curGun.extra.noAmmo && MatchSettings.useMod != "ammo")
         {
            if(this.unit.unitInfo.skill.id == "clip" && this.curGun.typeName == "Machine Gun")
            {
               var _loc2_:Object = this.curAmmo;
               var _loc3_:Number = _loc2_.spareCur - 1;
               _loc2_.spareCur = _loc3_;
            }
            else
            {
               _loc2_ = this.curAmmo;
               _loc3_ = _loc2_.clipCur - 1;
               _loc2_.clipCur = _loc3_;
            }
         }
         if(this.hud)
         {
            this.hud.setAmmoImage(this.curAmmo.clipCur,this.curAmmo.clipMax,this.curGun.effHudBullet,this.curAmmo.spareCur);
            this.unit.game.arena.setShake(2,2);
            if(this.dynRecoil < this.curGun.recoil * 1.7)
            {
               this.dynRecoil += 0.3;
            }
         }
         this.checkReload();
      }
      
      public function makeBullet(param1:Stats_Guns) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.unit.game.bullets.push(new param1.cls(this.unit.game,this.unit,this.unit.aimRoation + UT.rand(-this.dynRecoil,this.dynRecoilMod),this.unit.x + this.unit.MC.rotation * 1.2,this.unit.y + this.unit.MC.arm1.y,param1.xOff,param1.id));
      }
      
      public function reloaded() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.reloading = false;
         this.setFrame("idle");
         var _loc1_:uint = this.curAmmo.clipMax - this.curAmmo.clipCur;
         if(this.curAmmo.spareCur < _loc1_)
         {
            this.curAmmo.clipCur += this.curAmmo.spareCur;
            if(MatchSettings.useMod != "clips")
            {
               this.curAmmo.spareCur = 0;
            }
         }
         else
         {
            this.curAmmo.clipCur = this.curAmmo.clipMax;
            if(MatchSettings.useMod != "clips")
            {
               this.curAmmo.spareCur -= _loc1_;
            }
         }
         if(this.hud)
         {
            this.hud.setAmmoImage(this.curAmmo.clipCur,this.curAmmo.clipMax,this.curGun.effHudBullet,this.curAmmo.spareCur);
         }
      }
      
      public function manualReload() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.curAmmo.clipCur == this.curAmmo.clipMax || !this.curAmmo.spareCur)
         {
            return;
         }
         if(this.reloading || Boolean(this.shootDelay))
         {
            return;
         }
         if(this.curGun.extra.noShoot)
         {
            return;
         }
         this.checkReload(true);
      }
      
      public function checkReload(param1:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.curGun.extra.noShoot)
         {
            return;
         }
         if(!this.unit.human && (!this.curAmmo.clipCur && !this.curAmmo.spareCur))
         {
            this.swapGuns();
         }
         if(!param1 && (Boolean(this.curAmmo.clipCur) || Boolean(!this.curAmmo.spareCur)))
         {
            return;
         }
         this.setFrame("reload");
         this.reloading = true;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

