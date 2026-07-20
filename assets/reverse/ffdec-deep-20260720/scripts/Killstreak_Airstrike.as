package
{
   public class Killstreak_Airstrike
   {
      
      §§push(Killstreak_Airstrike);
      if(37 == 34)
      {
         return;
      }
      
      private var game:Game;
      
      public var unit:*;
      
      private var maxWidth:Number;
      
      public var x:Number;
      
      public var y:Number;
      
      private var fc:uint = 0;
      
      private var endTimer:uint = 0;
      
      public function Killstreak_Airstrike(param1:Game, param2:*)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.game = param1;
         this.unit = param2;
         this.maxWidth = this.game.arena.wall.width;
         this.x = 80;
         this.y = 80;
         trace("airstrike created");
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:Killstreak_Airstrike = this;
         var _loc2_:Number = _loc1_.fc + 1;
         _loc1_.fc = _loc2_;
         if(!this.endTimer)
         {
            if(this.fc > 50 && this.fc % 3 == 0)
            {
               trace("Shoot missile");
               this.game.bullets.push(new Stats_Guns.gunOb["airs"].cls(this.game,this.unit,180,this.x,this.y,0,"airs",{"noUnit":true}));
               this.x += 150;
               if(this.x >= this.maxWidth - 80)
               {
                  this.endTimer = 1;
               }
            }
         }
         else
         {
            var _temp_3:* = this;
            _loc1_ = this;
            _loc2_ = _loc1_.endTimer + 1;
            _loc1_.endTimer = _loc2_;
            if(this.endTimer >= 60)
            {
               this.end();
            }
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
         this.game.killstreaks.splice(this.game.killstreaks.indexOf(this),1);
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

