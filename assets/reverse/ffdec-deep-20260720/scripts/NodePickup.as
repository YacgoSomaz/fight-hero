package
{
   import flash.display.MovieClip;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol1280")]
   public class NodePickup extends MovieClip
   {
      
      §§push(NodePickup);
      if(37 == 34)
      {
         return;
      }
      
      public var rim:MovieClip;
      
      public var game:Game;
      
      public var id:String;
      
      private var spawnTime:uint;
      
      public var taken:uint = 0;
      
      private var yRot:uint = 0;
      
      public function NodePickup()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         var _loc1_:Array = name.split("_");
         this.id = _loc1_[0];
         this.spawnTime = Number(_loc1_[1]);
         switch(this.id)
         {
            case "ammo":
               §§push(0);
               break;
            case "ammobig":
               §§push(1);
               break;
            case "health":
               §§push(2);
               break;
            case "healthbig":
               §§push(3);
               break;
            default:
               §§push(4);
         }
         2;
         switch(§§pop())
         {
            case 0:
            case 1:
               gotoAndStop("yellow");
               break;
            case 2:
            case 3:
               gotoAndStop("green");
         }
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!this.taken)
         {
            this.yRot += 5;
            this.game.bitscreen.paint(x + this.game.arena.x + rotation * 0.5,y + this.game.arena.y - 30 - UT.yMoveToRot(this.yRot,4),true,"pickups0",this.id);
            alpha = 1;
            this.rim.play();
         }
         else
         {
            var _loc1_:NodePickup = this;
            var _loc2_:Number = _loc1_.taken - 1;
            _loc1_.taken = _loc2_;
            alpha = 0.5;
            this.rim.stop();
         }
      }
      
      public function getPickup(param1:Unit) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         switch(this.id)
         {
            case "health":
               §§push(0);
               break;
            case "healthbig":
               §§push(1);
               break;
            case "ammo":
               §§push(2);
               break;
            case "ammobig":
               §§push(3);
               break;
            default:
               §§push(4);
         }
         2;
         switch(§§pop())
         {
            case 0:
               if(param1.human)
               {
                  SH.playSound(S_Heal);
               }
               param1.status.heal(param1.status.hpMax * 0.5);
               break;
            case 1:
               if(param1.human)
               {
                  SH.playSound(S_Heal);
               }
               param1.status.heal(param1.status.hpMax);
               break;
            case 2:
               if(param1.human)
               {
                  SH.playSound(S_Equip);
               }
               param1.gun.addAmmo(0.5);
               break;
            case 3:
               if(param1.human)
               {
                  SH.playSound(S_Equip);
               }
               param1.gun.addAmmo(1);
         }
         this.taken = this.spawnTime * 30;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

