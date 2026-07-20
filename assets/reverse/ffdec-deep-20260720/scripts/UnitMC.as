package
{
   import flash.display.MovieClip;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol669")]
   public class UnitMC extends MovieClip
   {
      
      §§push(UnitMC);
      if(37 == 34)
      {
         return;
      }
      
      public var body:MovieClip;
      
      public var legup2:MovieClip;
      
      public var foot1:MovieClip;
      
      public var headhold:MovieClip;
      
      public var foot2:MovieClip;
      
      public var gun:MovieClip;
      
      public var arm1:MovieClip;
      
      public var arm2:MovieClip;
      
      public var head:MovieClip;
      
      public var arm1hold:MovieClip;
      
      public var leglow1:MovieClip;
      
      public var leglow2:MovieClip;
      
      public var legup1:MovieClip;
      
      private var unit:Unit;
      
      private var curAnim:String;
      
      public var curSkin:uint;
      
      public function UnitMC(param1:Unit)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         addFrameScript(0,this.frame1,19,this.frame20,37,this.frame38,56,this.frame57,74,this.frame75,93,this.frame94,117,this.frame118,141,this.frame142,165,this.frame166,189,this.frame190,207,this.frame208,263,this.frame264,278,this.frame279,289,this.frame290,300,this.frame301,304,this.frame305,320,this.frame321,353,this.frame354,386,this.frame387,390,this.frame391,395,this.frame396,407,this.frame408,448,this.frame449);
         this.unit = param1;
         this.headhold.visible = false;
         this.arm1hold.visible = false;
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.head.x = this.headhold.x;
         this.head.y = this.headhold.y;
         this.arm1.x = this.arm1hold.x;
         this.arm1.y = this.arm1hold.y;
         this.arm2.x = this.arm1hold.x;
         this.arm2.y = this.arm1hold.y;
      }
      
      public function doneShoot() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.unit.gun.setFrame("idle");
      }
      
      public function doneReload() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.unit.gun.setFrame("idle");
         this.unit.gun.reloaded();
      }
      
      public function reloadSound() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         switch(this.unit.gun.curGun.frameReload)
         {
            case "pistol":
               §§push(0);
               break;
            case "mpistol":
               §§push(1);
               break;
            case "shield":
               §§push(2);
               break;
            case "shieldCrouch":
               §§push(3);
               break;
            case "magnum":
               §§push(4);
               break;
            case "rifle":
               §§push(5);
               break;
            case "shotgun":
               §§push(6);
               break;
            case "heavy":
               §§push(7);
               break;
            case "sniper":
               §§push(8);
               break;
            case "rocket":
               §§push(9);
               break;
            case "launcher":
               §§push(10);
               break;
            case "bullpup":
               §§push(11);
               break;
            default:
               §§push(12);
         }
         2;
         switch(§§pop())
         {
            case 0:
            case 1:
            case 2:
            case 3:
               this.unit.game.playScreenSound(S_PistolReload,this.unit.x,this.unit.y,true);
               break;
            case 4:
               this.unit.game.playScreenSound(S_MagnumReload,this.unit.x,this.unit.y,true);
               break;
            case 5:
               this.unit.game.playScreenSound(S_RifleReload,this.unit.x,this.unit.y,true);
               break;
            case 6:
               this.unit.game.playScreenSound(S_ShotgunReload,this.unit.x,this.unit.y,true);
               break;
            case 7:
               this.unit.game.playScreenSound(S_HeavyReload,this.unit.x,this.unit.y,true);
               break;
            case 8:
               this.unit.game.playScreenSound(S_SniperReload,this.unit.x,this.unit.y,true);
               break;
            case 9:
               this.unit.game.playScreenSound(S_RocketReload,this.unit.x,this.unit.y,true);
               break;
            case 10:
               this.unit.game.playScreenSound(S_LauncherReload,this.unit.x,this.unit.y,true);
               break;
            case 11:
               this.unit.game.playScreenSound(S_BulpupReload,this.unit.x,this.unit.y,true);
         }
      }
      
      public function setUnitVar(param1:String, param2:*) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.unit[param1] = param2;
      }
      
      public function setUnitObVar(param1:String, param2:String, param3:*) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.unit[param1][param2] = param3;
      }
      
      public function setShield(param1:MovieClip) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.unit.gun.setShield(param1);
      }
      
      public function getWeaponID() : String
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return this.unit.gun.curGun.sprite;
      }
      
      public function goto(param1:String, param2:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!param2)
         {
            if(this.curAnim == param1)
            {
               return;
            }
            if(this.curAnim == "climbsmall" || this.curAnim == "climbbig")
            {
               return;
            }
            if(this.curAnim == "landhard")
            {
               return;
            }
            if(this.curAnim == "jump" && param1 == "fall")
            {
               return;
            }
            if(this.curAnim == "tuck" && param1 == "fall")
            {
               return;
            }
            if(this.curAnim == "land" && param1 == "idle")
            {
               return;
            }
            if(this.curAnim == "landrun" + this.unit.unitInfo.runType && param1 == "run" + this.unit.unitInfo.runType)
            {
               return;
            }
            if(this.curAnim == "landrunback" + this.unit.unitInfo.runType && param1 == "runback" + this.unit.unitInfo.runType)
            {
               return;
            }
            if(this.curAnim == "duckloop" && param1 == "duck")
            {
               return;
            }
            if(this.curAnim == "duckrun" && param1 == "duck")
            {
               param1 = "duckloop";
            }
            if(this.curAnim == "duckrunback" && param1 == "duck")
            {
               param1 = "duckloop";
            }
            if(this.curAnim == "slide" && param1 == "duck")
            {
               param1 = "duckloop";
            }
            if(this.curAnim == "duck" && param1 == "idle")
            {
               param1 = "getup";
            }
            if((this.curAnim == "run" + this.unit.unitInfo.runType || this.curAnim == "landrun" + this.unit.unitInfo.runType) && param1 == "duckrun")
            {
               param1 = "slide";
            }
            if(this.curAnim == "runback" + this.unit.unitInfo.runType && param1 == "duckrunback")
            {
               param1 = "duck";
            }
            if(this.curAnim == "duckrun" && param1 == "run" + this.unit.unitInfo.runType)
            {
               param1 = "getup";
            }
            if(this.curAnim == "duckrunback" && param1 == "runback" + this.unit.unitInfo.runType)
            {
               param1 = "getup";
            }
            if(this.curAnim == "slide")
            {
               return;
            }
            if(this.curAnim == "duck" && param1 == "duckrun")
            {
               return;
            }
            if(this.curAnim == "duck" && param1 == "duckrunback")
            {
               return;
            }
            if(this.curAnim == "getup" && param1 == "run" + this.unit.unitInfo.runType)
            {
               return;
            }
            if(this.curAnim == "getup" && param1 == "runback" + this.unit.unitInfo.runType)
            {
               return;
            }
            if(this.curAnim == "duckloop" && param1 == "idle")
            {
               param1 = "getup";
            }
            if(this.curAnim == "getup" && param1 == "idle")
            {
               return;
            }
         }
         this.curAnim = param1;
         gotoAndPlay(this.curAnim);
      }
      
      public function setSkin(param1:uint) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.curSkin = param1;
         this.setPart(this.head,this.curSkin);
         this.setPart(this.body,this.curSkin);
         this.setPart(this.arm1.arm2up,this.curSkin);
         this.setPart(this.arm1.arm2low,this.curSkin);
         this.setPart(this.arm1.hand2,this.curSkin);
         this.setPart(this.arm2.arm1up,this.curSkin);
         this.setPart(this.arm2.arm1low,this.curSkin);
         this.setPart(this.arm2.hand1,this.curSkin);
         this.setPart(this.legup1,this.curSkin);
         this.setPart(this.legup2,this.curSkin);
         this.legup2.gun.visible = false;
         this.setPart(this.leglow1,this.curSkin);
         this.setPart(this.leglow2,this.curSkin);
         this.setPart(this.foot1,this.curSkin);
         this.setPart(this.foot2,this.curSkin);
      }
      
      public function setPart(param1:MovieClip, param2:uint) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         param1.gotoAndStop(param2);
      }
      
      internal function frame1() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("idle",true);
      }
      
      internal function frame20() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("idle",true);
      }
      
      internal function frame38() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("run1",true);
      }
      
      internal function frame57() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("run1",true);
      }
      
      internal function frame75() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("runback1",true);
      }
      
      internal function frame94() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("runback1",true);
      }
      
      internal function frame118() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("run2",true);
      }
      
      internal function frame142() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("run2",true);
      }
      
      internal function frame166() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("runback2",true);
      }
      
      internal function frame190() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("runback2",true);
      }
      
      internal function frame208() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("fall");
      }
      
      internal function frame264() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         gotoAndPlay("fallloop");
      }
      
      internal function frame279() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("idle",true);
      }
      
      internal function frame290() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         stop();
      }
      
      internal function frame301() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("duckloop",true);
      }
      
      internal function frame305() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("duckloop");
      }
      
      internal function frame321() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("duckloop",true);
      }
      
      internal function frame354() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("duckrun",true);
      }
      
      internal function frame387() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("duckrunback",true);
      }
      
      internal function frame391() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.goto("idle",true);
      }
      
      internal function frame396() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.setUnitObVar("mov","climb",0);
         this.goto("idle",true);
      }
      
      internal function frame408() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.setUnitObVar("mov","climb",0);
         this.goto("idle",true);
      }
      
      internal function frame449() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.setUnitObVar("mov","landHard",false);
         this.goto("idle",true);
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

