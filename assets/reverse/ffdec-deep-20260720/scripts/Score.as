package
{
   public class Score
   {
      
      §§push(Score);
      if(37 == 34)
      {
         return;
      }
      
      private var unit:Unit;
      
      public var headshots:uint = 0;
      
      public var killed1:uint = 0;
      
      public var killed2:uint = 0;
      
      public var killed3:uint = 0;
      
      public var killed4:uint = 0;
      
      public var bulletsFired:uint = 0;
      
      public var bulletsHit:uint = 0;
      
      public var flagCap:uint = 0;
      
      public var domCap:uint = 0;
      
      public var jugKill:uint = 0;
      
      public var lives:int = 0;
      
      public var kills:uint = 0;
      
      public var deaths:uint = 0;
      
      public var suicides:uint = 0;
      
      public var betrayals:uint = 0;
      
      public var killtimer:uint = 0;
      
      public var multikill:uint = 0;
      
      public var spree:uint = 0;
      
      public var streak:uint = 0;
      
      public function Score(param1:Unit)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.unit = param1;
      }
      
      public function setKills(param1:uint) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.kills = param1;
         this.updateScore();
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.killtimer)
         {
            var _loc1_:Score = this;
            var _loc2_:Number = _loc1_.killtimer - 1;
            _loc1_.killtimer = _loc2_;
         }
         else
         {
            this.multikill = 0;
         }
      }
      
      public function addKill() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:Score = this;
         var _loc2_:Number = _loc1_.multikill + 1;
         _loc1_.multikill = _loc2_;
         _loc1_ = this;
         _loc2_ = _loc1_.spree + 1;
         _loc1_.spree = _loc2_;
         _loc1_ = this;
         _loc2_ = _loc1_.kills + 1;
         _loc1_.kills = _loc2_;
         this.killtimer = 3.5 * 30;
         if(Boolean(this.unit.unitInfo.streak.kills && !this.unit.canUseStreak) && Boolean(!this.unit.streakInProgress) && !this.unit.dead)
         {
            _loc1_ = this;
            _loc2_ = _loc1_.streak + 1;
            _loc1_.streak = _loc2_;
            this.unit.setKillstreakNum(this.streak);
            if(this.streak >= this.unit.unitInfo.streak.kills || this.unit.unitInfo.skill.id == "charisma" && this.streak >= this.unit.unitInfo.streak.kills - 1)
            {
               this.streak = 0;
               this.unit.startKillstreak();
            }
         }
         if(this.unit.human)
         {
            this.unit.game.hud.debug.debug1.text = "Streak: " + this.streak;
         }
         this.updateScore();
      }
      
      public function addDeath() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.spree = 0;
         var _loc1_:Score = this;
         var _loc2_:Number = _loc1_.deaths + 1;
         _loc1_.deaths = _loc2_;
         _loc1_ = this;
         _loc2_ = _loc1_.lives - 1;
         _loc1_.lives = _loc2_;
         this.streak = 0;
      }
      
      public function addSuicide() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _temp_1:* = this;
         var _loc1_:Score = this;
         var _loc2_:Number = _loc1_.suicides + 1;
         _loc1_.suicides = _loc2_;
         this.updateScore();
      }
      
      public function addBetrayal() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:Score = this;
         var _loc2_:Number = _loc1_.betrayals + 1;
         _loc1_.betrayals = _loc2_;
         this.updateScore();
      }
      
      public function updateScore() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         switch(MatchSettings.useMode)
         {
            case "dm":
               §§push(0);
               break;
            case "tdm":
               §§push(1);
               break;
            case "jug":
               §§push(2);
               break;
            case "zom":
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
            case 2:
            case 3:
               this.unit.pscore = this.kills - this.suicides - this.betrayals;
         }
         this.unit.game.matchSettings.updateScores();
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

