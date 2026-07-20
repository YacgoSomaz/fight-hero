package
{
   import flash.display.MovieClip;
   import flash.text.TextField;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol729")]
   public class Holder_Gun extends MovieClip
   {
      
      §§push(Holder_Gun);
      if(37 == 34)
      {
         return;
      }
      
      public var mc_gun:MovieClip;
      
      public var txt_name:TextField;
      
      public var txt_status:TextField;
      
      public var gun:Stats_Guns;
      
      private var _parent:MovieClip;
      
      private var mSpd:Number;
      
      public function Holder_Gun(param1:Stats_Guns = null)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         addFrameScript(0,this.frame1);
         if(param1)
         {
            this.setGun(param1);
         }
         this._parent = MovieClip(parent);
      }
      
      public function setGun(param1:Stats_Guns, param2:* = "", param3:MovieClip = null) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.gun = param1;
         this.mc_gun.gotoAndStop(this.gun.sprite);
         this.txt_status.text = "";
         if(Boolean(param2) && param2 != "Soldiers")
         {
            this._parent.txt_name.text = param2;
            this.txt_name.text = this.gun.name;
            this._parent.txt_type.text = "";
         }
         else if(param3)
         {
            this.setText(param3);
            this._parent.txt_name.text = this.gun.name;
            this.txt_name.text = "";
            this._parent.txt_type.text = this.gun.typeName;
         }
         else
         {
            this.txt_name.text = this.gun.name;
            this.setStatus();
         }
      }
      
      public function setStatus() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(SD.classSaves[SD.selClass].primary == this.gun.id || SD.classSaves[SD.selClass].secondary == this.gun.id)
         {
            this.txt_status.textColor = 13421772;
            this.txt_status.text = "Equipped";
         }
         else if(SD.classSaves[SD.selClass].level < this.gun.lvlReq)
         {
            this.txt_status.textColor = 16750899;
            this.txt_status.text = "Req lvl " + this.gun.lvlReq;
         }
         else if(SD.unlocks.indexOf(this.gun.id) != -1)
         {
            this.txt_status.text = "";
         }
         else
         {
            this.txt_status.textColor = 16764006;
            this.txt_status.text = "$" + UT.addNumCommas(this.gun.cost);
         }
      }
      
      public function modStats(param1:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(param1)
         {
            this.mSpd = 1;
         }
         else
         {
            this.mSpd = 0.3;
         }
         var _loc2_:* = Math.ceil(1 / this.gun.shootDelay);
         switch(this.gun.typeName)
         {
            case "Shield":
               §§push(0);
               break;
            case "Melee":
               §§push(1);
               break;
            case "Sniper":
               §§push(2);
               break;
            default:
               §§push(3);
         }
         2;
         switch(§§pop())
         {
            case 0:
               this._parent.txtn_dmg.text = "Reduce";
               this._parent.txtn_acc.text = "Reflect";
               this._parent.txtn_rng.text = "N/A";
               this._parent.txtn_spd.text = "N/A";
               this._parent.txtn_amm.text = "N/A";
               this._parent.txt_dmg.text = this.gun.extra.reduce * 100 + "%";
               this._parent.txt_acc.text = this.gun.extra.reflect * 100 + "%";
               this._parent.txt_rng.text = "";
               this._parent.txt_spd.text = "";
               this._parent.txt_amm.text = "";
               this._parent.bar_dmg.width += (this.gun.extra.reduce * 80 - this._parent.bar_dmg.width) * this.mSpd;
               this._parent.bar_acc.width += (this.gun.extra.reflect * 80 - this._parent.bar_acc.width) * this.mSpd;
               this._parent.bar_rng.width += (0 - this._parent.bar_rng.width) * this.mSpd;
               this._parent.bar_spd.width += (0 - this._parent.bar_spd.width) * this.mSpd;
               this._parent.bar_amm.width += (0 - this._parent.bar_amm.width) * this.mSpd;
               break;
            case 1:
               this._parent.txtn_dmg.text = "Damage";
               this._parent.txtn_acc.text = "Critical";
               this._parent.txtn_rng.text = "Crit Dmg";
               this._parent.txtn_spd.text = "Fire Rate";
               this._parent.txtn_amm.text = "N/A";
               this._parent.txt_dmg.text = this.gun.dmg + "";
               this._parent.txt_acc.text = "+" + this.gun.extra.critical * 100 + "%";
               this._parent.txt_rng.text = "+" + this.gun.extra.criticalDmg * 100 + "%";
               this._parent.txt_spd.text = Math.ceil(1 / this.gun.shootDelay) + "";
               this._parent.txt_amm.text = "";
               this._parent.bar_dmg.width += (this.gun.dmg / 250 * 80 - this._parent.bar_dmg.width) * this.mSpd;
               this._parent.bar_acc.width += (this.gun.extra.critical * 80 - this._parent.bar_acc.width) * this.mSpd;
               this._parent.bar_rng.width += (this.gun.extra.criticalDmg * 80 - this._parent.bar_rng.width) * this.mSpd;
               this._parent.bar_spd.width += (_loc2_ / 15 * 80 - this._parent.bar_spd.width) * this.mSpd;
               this._parent.bar_amm.width += (0 - this._parent.bar_amm.width) * this.mSpd;
               break;
            case 2:
               this._parent.txtn_dmg.text = "Damage";
               this._parent.txtn_acc.text = "Accuracy";
               this._parent.txtn_rng.text = "Head Dmg";
               this._parent.txtn_spd.text = "Fire Rate";
               this._parent.txtn_amm.text = "Ammo";
               this._parent.txt_dmg.text = this.gun.dmg + "";
               this._parent.txt_acc.text = (10 - this.gun.recoil) * 10 + "%";
               this._parent.txt_rng.text = "+" + this.gun.extra.headDmg * 100 + "%";
               this._parent.txt_spd.text = Math.ceil(1 / this.gun.shootDelay) + " rps";
               this._parent.txt_amm.text = this.gun.clipSize + "x" + (this.gun.clipSpare + 1);
               this._parent.bar_dmg.width += (this.gun.dmg / 250 * 80 - this._parent.bar_dmg.width) * this.mSpd;
               this._parent.bar_acc.width += ((10 - this.gun.recoil) / 10 * 80 - this._parent.bar_acc.width) * this.mSpd;
               this._parent.bar_rng.width += (this.gun.extra.headDmg * 100 / 150 * 80 - this._parent.bar_rng.width) * this.mSpd;
               this._parent.bar_spd.width += (_loc2_ / 15 * 80 - this._parent.bar_spd.width) * this.mSpd;
               this._parent.bar_amm.width += (this.gun.clipSize * (this.gun.clipSpare + 1) / 200 * 80 - this._parent.bar_amm.width) * this.mSpd;
               break;
            default:
               this._parent.txtn_dmg.text = "Damage";
               this._parent.txtn_acc.text = "Accuracy";
               this._parent.txtn_rng.text = "Range";
               this._parent.txtn_spd.text = "Fire Rate";
               this._parent.txtn_amm.text = "Ammo";
               if(this.gun.extra.extraShots)
               {
                  this._parent.txt_dmg.text = this.gun.dmg + "x" + (this.gun.extra.extraShots + 1);
               }
               else
               {
                  this._parent.txt_dmg.text = this.gun.dmg + "";
               }
               this._parent.txt_acc.text = (10 - this.gun.recoil) * 10 + "%";
               this._parent.txt_rng.text = this.gun.range * 0.5 + " ft";
               this._parent.txt_spd.text = Math.ceil(1 / this.gun.shootDelay) + " rps";
               this._parent.txt_amm.text = this.gun.clipSize + "x" + (this.gun.clipSpare + 1);
               if(this.gun.extra.extraShots)
               {
                  this._parent.bar_dmg.width += (this.gun.dmg * (this.gun.extra.extraShots + 1) / 250 * 80 - this._parent.bar_dmg.width) * this.mSpd;
               }
               else
               {
                  this._parent.bar_dmg.width += (this.gun.dmg / 250 * 80 - this._parent.bar_dmg.width) * this.mSpd;
               }
               this._parent.bar_acc.width += ((10 - this.gun.recoil) / 10 * 80 - this._parent.bar_acc.width) * this.mSpd;
               this._parent.bar_rng.width += (this.gun.range / 250 * 80 - this._parent.bar_rng.width) * this.mSpd;
               this._parent.bar_spd.width += (_loc2_ / 15 * 80 - this._parent.bar_spd.width) * this.mSpd;
               this._parent.bar_amm.width += (this.gun.clipSize * (this.gun.clipSpare + 1) / 200 * 80 - this._parent.bar_amm.width) * this.mSpd;
         }
      }
      
      public function setText(param1:MovieClip) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.txt_status.text = "";
         param1.txt_desc.text = "";
         if(this.gun.extra.vision)
         {
            param1.txt_desc.text += "Vision " + (this.gun.extra.vision > 0.5 ? "+" : "") + (this.gun.extra.vision - 0.5) * 100 + "%\n";
         }
         if(this.gun.typeName == "Assault Rifle" && !this.gun.autoFire)
         {
            param1.txt_desc.text += "Single Fire\n";
         }
         if(this.gun.typeName == "Shotgun" && this.gun.autoFire)
         {
            param1.txt_desc.text += "Auto Fire\n";
         }
         if(this.gun.typeName == "Explosive" && this.gun.cls == Bullet_Proj_Follow)
         {
            param1.txt_desc.text += "Fires homing missiles\n";
         }
         if(this.gun.typeName == "Explosive" && this.gun.cls == Bullet_Proj_Bounce)
         {
            param1.txt_desc.text += "Fires grenades\n";
         }
         if(this.gun.typeName == "Melee")
         {
            param1.txt_desc.text += "Increased critical chance\n";
            param1.txt_desc.text += "Increased critical damage\n";
         }
         else
         {
            if(this.gun.extra.critical)
            {
               param1.txt_desc.text += "+" + this.gun.extra.critical * 100 + "% critical chance\n";
            }
            if(this.gun.extra.criticalDmg)
            {
               param1.txt_desc.text += "+" + this.gun.extra.criticalDmg * 100 + "% critical damage\n";
            }
         }
         if(this.gun.typeName == "Shield")
         {
            if(this.gun.extra.resist)
            {
               param1.txt_desc.text += this.gun.extra.resist * 100 + "% resistance to explosives" + "\n";
            }
            param1.txt_desc.text += "Used with the secondary weapon" + "\n";
            if(this.gun.extra.halfAim)
            {
               param1.txt_desc.text += "Reduces accuracy while blocking" + "\n";
            }
            param1.txt_desc.text += "\n";
            param1.txt_desc.text += "Reduce damage when blocking \n";
            param1.txt_desc.text += "Chance to reflect bullets when blocking\n";
            param1.txt_desc.text += "(Crouch to block)\n";
         }
         if(param1.txt_desc.text != "")
         {
            param1.txt_desc.text += "\n";
         }
         §§push(this.gun.desc);
         if(param1.txt_desc.text == "")
         {
            param1.txt_desc.text = "None";
         }
      }
      
      internal function frame1() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         stop();
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

