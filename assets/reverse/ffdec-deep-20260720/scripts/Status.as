package
{
   import flash.filters.BlurFilter;
   import flash.filters.GlowFilter;
   
   public class Status
   {
      
      §§push(Status);
      if(37 == 34)
      {
         return;
      }
      
      private var unit:Unit;
      
      public var hpCur:Number;
      
      public var hpMax:Number;
      
      public var shCur:Number;
      
      private var bar_width:Number;
      
      private var regenDelay:uint;
      
      public var stealthDelay:uint;
      
      public var sSpawn:uint = 0;
      
      public var sInvis:Number = 0;
      
      public var sSurge:Number = 0;
      
      public var sRapidHeal:Number = 0;
      
      public var sReflect:Number = 0;
      
      public var sFire:Number = 0;
      
      public var sBlur:Number = 0;
      
      private var fc:uint = 0;
      
      private var bigSkillCooldown:* = 0;
      
      public function Status(param1:Unit)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.unit = param1;
         this.unit.bar_hurt.width = 0;
         this.stealthDelay = 60;
      }
      
      public function reset() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.hpCur = this.hpMax = this.unit.unitInfo.hp;
         this.shCur = 0;
         this.sInvis = 0;
         this.sSurge = 0;
         this.sRapidHeal = 0;
         this.sReflect = 0;
         this.sFire = 0;
         this.sBlur = 0;
         this.bar_width = 40 + this.hpMax / 10;
         this.heal(this.hpMax,false,true);
         if(this.unit.human)
         {
            this.unit.game.hud.bloodyscreen.alpha = 0;
            this.unit.game.hud.bloodyscreen.scaleX = UT.coinFlip(1,-1);
            this.unit.game.hud.bloodyscreen.scaleY = UT.coinFlip(1,-1);
            this.unit.game.hud.bloodyscreen.gotoAndStop(SD.screenBlood ? 1 : 2);
         }
      }
      
      public function heal(param1:Number, param2:Boolean = true, param3:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(Boolean(this.unit.dead) && !param3)
         {
            return;
         }
         this.hpCur += param1;
         if(this.hpCur > this.hpMax)
         {
            this.hpCur = this.hpMax;
         }
         if(param2)
         {
            this.unit.game.createEffect(this.unit.x,this.unit.y - 40,"heal");
         }
         this.setBars();
      }
      
      public function damage(param1:Number, param2:Unit, param3:Stats_Guns, param4:Object, param5:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc7_:Number = NaN;
         var _loc8_:Number = NaN;
         if(this.unit.dead)
         {
            return;
         }
         if((Boolean(this.sSpawn) || Boolean(this.sReflect)) && !param5)
         {
            return;
         }
         if(this.unit == param2)
         {
            if(param3.extra.noAllyDmg)
            {
               param1 *= 0.4;
            }
         }
         else if(this.unit.human)
         {
            param1 *= 0.3 + param2.diff * 0.07;
         }
         else if(MatchSettings.isCampaign && !this.unit.human && !param2.human)
         {
            param1 *= 0.4 + param2.diff * 0.03;
         }
         else if(!this.unit.human && !param2.human)
         {
            param1 *= 0.6 + param2.diff * 0.04;
         }
         if(this.unit.isJug)
         {
            param1 *= 0.7;
         }
         if(this.unit.unitInfo.skill.id == "will" && this.bigSkillCooldown == 0)
         {
            param1 *= 0.3;
            this.bigSkillCooldown = this.unit.unitInfo.skill.value * 20;
            this.unit.game.createParticle(this.unit.x + UT.rand(-5,5),this.unit.y - UT.rand(40,65),"text",0,null,"bigText","ironwill");
         }
         if(this.sSurge)
         {
            param1 *= 0.7;
         }
         if(param2.status.sSurge)
         {
            param1 *= 1.3;
         }
         if(Boolean(this.unit.team) && Boolean(this.unit.team == param2.team) && this.unit != param2)
         {
            param1 *= 0.3;
            param4.teamkill = true;
            if(param3.extra.noAllyDmg)
            {
               return;
            }
         }
         var _loc6_:Number = Number(param2.unitInfo.crit);
         if(param2.unitInfo.skill.id == "shadow" && param2.status.sInvis == 1 && param2.gun.curGun.typeName == "Melee")
         {
            _loc6_ += param2.unitInfo.skill.value;
         }
         if(param2.gun.curGun.extra.critical)
         {
            _loc6_ += param2.gun.curGun.extra.critical;
         }
         if(Boolean(param4.headMult && param3.typeName != "Explosive") && Boolean(param3.typeName != "Melee") && this.unit != param2)
         {
            _loc7_ = Number(param2.unitInfo.headBonus);
            if(param2.gun.curGun.extra.headDmg)
            {
               _loc8_ += param2.gun.curGun.extra.headDmg;
            }
            param1 *= _loc7_;
            this.unit.game.createParticle(this.unit.x + UT.rand(-5,5),this.unit.y - UT.rand(50,55),"text",0,null,"bigText","headshot");
         }
         else if(Math.random() <= _loc6_ && this.unit != param2)
         {
            param4.critMult = true;
            _loc8_ = Number(param2.unitInfo.critBonus);
            if(param2.gun.curGun.extra.criticalDmg)
            {
               _loc8_ += param2.gun.curGun.extra.criticalDmg;
            }
            param1 *= _loc8_;
            this.unit.game.createParticle(this.unit.x + UT.rand(-5,5),this.unit.y - UT.rand(25,50),"text",0,null,"bigText","critical");
         }
         if(param4.splashMult)
         {
            param1 *= param4.splashMult;
         }
         if(param2.gun.curGun.typeName == "Explosive" && this.unit.unitInfo.skill.id == "resist")
         {
            param1 *= this.unit.unitInfo.skill.value;
         }
         if(param2.gun.curGun.typeName == "Explosive" && Boolean(this.unit.gun.primary.extra.resist))
         {
            param1 *= this.unit.gun.primary.extra.resist;
         }
         if(param4.shielded)
         {
            param1 *= 1 - this.unit.gun.primary.extra.reduce;
         }
         else if(this.unit.gun.primary.typeName == "Shield" && this.unit.unitInfo.skill.id == "iron")
         {
            param1 *= this.unit.unitInfo.skill.value;
         }
         if(Boolean(this.shCur) && !param5)
         {
            this.shCur -= param1;
            if(this.shCur <= 0)
            {
               param1 = -this.shCur;
               this.shCur = 0;
            }
            else
            {
               param1 = 0;
            }
         }
         this.hpCur -= param1;
         if(!param5 && this.hpCur <= 0 && this.unit.unitInfo.skill.id == "operation" && !this.bigSkillCooldown)
         {
            this.bigSkillCooldown = this.unit.unitInfo.skill.value * 30;
            this.heal(this.hpMax * 0.5);
         }
         if(this.hpCur <= 0)
         {
            this.hpCur = 0;
            this.unit.die(param2,param3,param4);
            if(this.unit.human)
            {
               this.unit.game.hud.bloodyscreen.alpha = 1;
            }
            if(this.unit.unitInfo.skill.id == "bomb" && !this.bigSkillCooldown)
            {
               this.bigSkillCooldown = this.unit.unitInfo.skill.value * 30;
               this.unit.gun.makeBullet(Stats_Guns.gunOb["bomb"]);
            }
         }
         else if((this.unit.unitInfo.skill.id == "blur" || this.unit.unitInfo.skill.id == "blur2") && !this.bigSkillCooldown && this.hpCur < this.hpMax * 0.3)
         {
            this.bigSkillCooldown = this.unit.unitInfo.skill.value * 30;
            this.sBlur = 2 * 30;
         }
         this.setStealthDelay();
         if(this.unit.unitInfo.skill.id != "regen")
         {
            this.regenDelay = 30 * 3;
         }
         this.setBars();
      }
      
      public function setBars() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:Number = this.unit.bar_hp.width;
         this.unit.bar_hp.width = this.hpCur / this.hpMax * this.bar_width;
         if(_loc1_ - this.unit.bar_hp.width <= 0)
         {
            this.unit.bar_hurt.width = 0;
         }
         else
         {
            this.unit.bar_hurt.width += _loc1_ - this.unit.bar_hp.width;
         }
         this.unit.bar_hurt.x = this.unit.bar_hp.x + this.unit.bar_hp.width;
         if(this.unit.human)
         {
            this.unit.game.hud.txt_hp.text = Math.ceil(this.hpCur) + " Hp";
         }
      }
      
      public function setStealthDelay() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.unit.unitInfo.skill.id == "shadow2")
         {
            this.stealthDelay = 10;
         }
         else
         {
            this.stealthDelay = 60;
         }
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:Number = NaN;
         var _loc2_:Status = this;
         var _loc3_:Number = _loc2_.fc + 1;
         _loc2_.fc = _loc3_;
         if(this.bigSkillCooldown)
         {
            _loc2_ = this;
            _loc3_ = _loc2_.bigSkillCooldown - 1;
            _loc2_.bigSkillCooldown = _loc3_;
         }
         if(this.unit.unitInfo.extra.permaSurge)
         {
            this.sSurge = 99;
         }
         if(this.sSurge)
         {
            if(this.sSurge > 10 || this.sSurge % 2 != 0)
            {
               if(SD.graphGlow)
               {
                  this.unit.MCfilters.push(new GlowFilter(16711680,1,20,20,1.5,1,true,false),new GlowFilter(16711680,1,5,5,1));
               }
               else
               {
                  this.unit.MCfilters.push(new GlowFilter(16711680,1,10,10,1.5));
               }
            }
            if(this.sSurge == 1)
            {
               this.unit.endKillstreak();
            }
            _loc2_ = this;
            _loc3_ = _loc2_.sSurge - 1;
            _loc2_.sSurge = _loc3_;
         }
         if(this.sReflect)
         {
            if(this.sReflect > 10 || this.sReflect % 2 != 0)
            {
               this.unit.MCfilters.push(new GlowFilter(10092543,1,20,20,1.5,1,true));
               this.unit.game.bitscreen.paint(this.unit.x + this.unit.game.arena.x,this.unit.y + this.unit.game.arena.y - 30,true,"mirror0","ball");
            }
            if(this.sReflect == 1)
            {
               this.unit.endKillstreak();
            }
            _loc2_ = this;
            _loc3_ = _loc2_.sReflect - 1;
            _loc2_.sReflect = _loc3_;
         }
         if(this.sBlur)
         {
            if(this.sBlur > 10 || this.sBlur % 2 != 0)
            {
               this.unit.MCfilters.push(new BlurFilter(10,0,1));
            }
            var _temp_8:* = this;
            _loc2_ = this;
            _loc3_ = _loc2_.sBlur - 1;
            _loc2_.sBlur = _loc3_;
         }
         if(this.sFire)
         {
            if(this.sFire % 17 == 0)
            {
               this.unit.game.playScreenSound(S_Fire,this.unit.x,this.unit.y);
            }
            if(this.sFire > 10 || this.sFire % 2 != 0)
            {
               if(SD.graphGlow)
               {
                  this.unit.MCfilters.push(new GlowFilter(16758272,1,20,20,1.5,1,true,false),new GlowFilter(16758272,1,5,5,1));
               }
               else
               {
                  this.unit.MCfilters.push(new GlowFilter(16758272,1,10,10,1.5));
               }
               this.unit.game.createEffect(this.unit.x + UT.rand(-10,10),this.unit.y + UT.rand(-55,-10),"flame");
            }
            if(this.fc % 10 == 0)
            {
               this.unit.gun.makeBullet(Stats_Guns.gunOb["fire"]);
            }
            if(this.unit.unitInfo.streak.id == "fire" && this.unit.streakInProgress && this.sFire == 1)
            {
               this.unit.endKillstreak();
            }
            _loc2_ = this;
            _loc3_ = _loc2_.sFire - 1;
            _loc2_.sFire = _loc3_;
         }
         if(this.sSpawn)
         {
            if(this.sSpawn > 10 || this.sSpawn % 2 != 0)
            {
               if(SD.graphGlow)
               {
                  this.unit.MCfilters.push(new GlowFilter(10092543,1,10,10,1.5,1,true,false),new GlowFilter(16777215,1,5,5,1));
               }
               else
               {
                  this.unit.MCfilters.push(new GlowFilter(13434879,1,10,10,1.5));
               }
            }
            _loc2_ = this;
            _loc3_ = _loc2_.sSpawn - 1;
            _loc2_.sSpawn = _loc3_;
         }
         if(this.shCur)
         {
            if(SD.graphGlow)
            {
               this.unit.MCfilters.push(new GlowFilter(16777164,this.shCur / 120 + 0.2,15,15,1,1,true,false),new GlowFilter(16777164,this.shCur / 120 + 0.5,4,4,1));
            }
            else
            {
               this.unit.MCfilters.push(new GlowFilter(16777164,this.shCur / 120 + 0.5,10,10,1.5));
            }
         }
         if(this.unit.isJug)
         {
            this.unit.MCfilters.push(new GlowFilter(16724736,1,8,8,2));
         }
         if(this.sInvis)
         {
            if(this.unit.human || this.unit.team == 1)
            {
               this.unit.MC.alpha = 1 - this.sInvis * 0.8;
            }
            else
            {
               this.unit.alpha = 1 - this.sInvis;
            }
         }
         else
         {
            this.unit.alpha = 1;
            this.unit.MC.alpha = 1;
         }
         if(this.unit.bar_hurt.width > 0)
         {
            this.unit.bar_hurt.width += (0 - this.unit.bar_hurt.width) * 0.1;
         }
         else
         {
            this.unit.bar_hurt.width = 0;
         }
         if(this.unit.unitInfo.skill.id == "shadow")
         {
            if(!this.unit.mov.crouching || Boolean(this.unit.hasFlag))
            {
               this.stealthDelay = 60;
            }
            if(this.stealthDelay)
            {
               _loc2_ = this;
               _loc3_ = _loc2_.stealthDelay - 1;
               _loc2_.stealthDelay = _loc3_;
               this.sInvis -= 0.1;
               if(this.sInvis < 0)
               {
                  this.sInvis = 0;
               }
            }
            else
            {
               this.sInvis += 0.05;
               if(this.sInvis > 1)
               {
                  this.sInvis = 1;
               }
            }
         }
         else if(this.unit.unitInfo.skill.id == "shadow2")
         {
            if(this.unit.hasFlag)
            {
               this.stealthDelay = 60;
            }
            if(this.stealthDelay)
            {
               _loc2_ = this;
               _loc3_ = _loc2_.stealthDelay - 1;
               _loc2_.stealthDelay = _loc3_;
               this.sInvis -= 0.1;
               if(this.sInvis < 0)
               {
                  this.sInvis = 0;
               }
            }
            else
            {
               this.sInvis += 0.1;
               if(this.sInvis > 1)
               {
                  this.sInvis = 1;
               }
            }
         }
         if(this.sRapidHeal)
         {
            this.heal(this.hpMax * 0.003,false);
            if(this.fc % 3 == 0)
            {
               this.unit.game.createEffect(this.unit.x + UT.rand(-10,10),this.unit.y + UT.rand(-45,-10),"healthRegen");
            }
            if(this.sRapidHeal > 10 || this.sRapidHeal % 2 != 0)
            {
               this.unit.MCfilters.push(new GlowFilter(65280,0.8,10,10,1,1,true));
            }
            if(this.unit.unitInfo.streak.id == "rapid" && this.unit.streakInProgress && this.sRapidHeal == 1)
            {
               this.unit.endKillstreak();
            }
            _loc2_ = this;
            _loc3_ = _loc2_.sRapidHeal - 1;
            _loc2_.sRapidHeal = _loc3_;
         }
         else if(this.regenDelay)
         {
            _loc2_ = this;
            _loc3_ = _loc2_.regenDelay - 1;
            _loc2_.regenDelay = _loc3_;
         }
         else
         {
            this.heal(this.unit.unitInfo.regen,false);
            if(this.hpCur < this.hpMax)
            {
               if(this.unit.unitInfo.skill.id == "adren")
               {
                  if(this.fc % 3 == 0)
                  {
                     this.unit.game.createEffect(this.unit.x + UT.rand(-10,10),this.unit.y + UT.rand(-45,-10),"healthRegenRed");
                  }
               }
               else if(this.fc % 10 == 0)
               {
                  this.unit.game.createEffect(this.unit.x + UT.rand(-10,10),this.unit.y + UT.rand(-45,-10),"healthRegen");
               }
            }
         }
         if(this.unit.human)
         {
            _loc1_ = this.hpCur / this.hpMax;
            if(_loc1_ > 0.5)
            {
               this.unit.game.hud.bloodyscreen.alpha = 0;
            }
            else
            {
               this.unit.game.hud.bloodyscreen.alpha = 1 - _loc1_ * 1.8;
            }
         }
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

