package
{
   public class Killstreak_Radar
   {
      
      §§push(Killstreak_Radar);
      if(37 == 34)
      {
         return;
      }
      
      private var game:Game;
      
      public var unit:*;
      
      private var fc:uint = 0;
      
      public function Killstreak_Radar(param1:Game, param2:*)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.game = param1;
         this.unit = param2;
         this.setDifficulties();
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:Killstreak_Radar = this;
         var _loc2_:Number = _loc1_.fc + 1;
         _loc1_.fc = _loc2_;
         if(this.fc % 20 == 0)
         {
            this.setDifficulties();
         }
         if(this.fc >= 30 * 10)
         {
            this.end();
         }
      }
      
      public function setDifficulties() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         if(this.unit.team == 0)
         {
            _loc1_ = 0;
            while(_loc1_ < this.game.units.length)
            {
               if(this.game.units[_loc1_] == this.unit)
               {
                  this.game.units[_loc1_].setDiffStats(this.game.units[_loc1_].odiff + 5);
               }
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
         }
         else
         {
            _loc1_ = 0;
            while(_loc1_ < this.game.units.length)
            {
               if(this.game.units[_loc1_].team == this.unit.team)
               {
                  this.game.units[_loc1_].setDiffStats(this.game.units[_loc1_].odiff + 5);
               }
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
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
         var _loc1_:uint = 0;
         while(_loc1_ < this.game.units.length)
         {
            this.game.units[_loc1_].setDiffStats();
            _loc1_++;
            if(2 == 3)
            {
               break;
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

