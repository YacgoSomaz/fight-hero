package
{
   public class Killstreak_Gas
   {
      
      §§push(Killstreak_Gas);
      if(37 == 34)
      {
         return;
      }
      
      private var game:Game;
      
      public var unit:*;
      
      private var fc:uint = 0;
      
      private var alpha:Number = 0;
      
      private var gasOn:Boolean;
      
      private var gasMax:Number;
      
      public function Killstreak_Gas(param1:Game, param2:*)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.game = param1;
         this.unit = param2;
         if(Boolean(this.unit.human) || this.unit.team == 1)
         {
            this.gasMax = 0.6;
         }
         else
         {
            this.gasMax = 0.98;
         }
         this.setDifficulties();
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _temp_1:* = this;
         var _loc1_:Killstreak_Gas = this;
         var _loc2_:Number = _loc1_.fc + 1;
         _loc1_.fc = _loc2_;
         if(this.fc % 20 == 0)
         {
            this.setDifficulties();
         }
         if(!this.gasOn)
         {
            this.alpha += 0.04;
            if(this.alpha >= this.gasMax)
            {
               this.alpha = this.gasMax;
               this.gasOn = true;
            }
         }
         else
         {
            _loc1_ = this;
            _loc2_ = _loc1_.fc + 1;
            _loc1_.fc = _loc2_;
            if(this.fc >= 9 * 30)
            {
               this.alpha -= 0.02;
               if(this.alpha < 0)
               {
                  this.alpha = 0;
                  this.end();
               }
            }
         }
         this.game.bitscreen.data.fillRect(this.game.bitscreen.rect,(this.alpha * 255 << 24) + 13056);
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
               if(this.game.units[_loc1_] != this.unit)
               {
                  this.game.units[_loc1_].setDiffStats(this.game.units[_loc1_].odiff - 5,false,false);
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
               if(this.game.units[_loc1_].team != this.unit.team)
               {
                  this.game.units[_loc1_].setDiffStats(this.game.units[_loc1_].odiff - 5,false,false);
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

