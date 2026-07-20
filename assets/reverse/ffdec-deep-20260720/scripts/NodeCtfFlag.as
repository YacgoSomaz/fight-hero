package
{
   import flash.display.MovieClip;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol1222")]
   public class NodeCtfFlag extends MovieClip
   {
      
      §§push(NodeCtfFlag);
      if(37 == 34)
      {
         return;
      }
      
      public var rim:MovieClip;
      
      public var flag:MovieClip;
      
      public var id:String;
      
      public var team:uint;
      
      public var unitCaptured:*;
      
      public function NodeCtfFlag()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:Array = null;
         super();
         _loc1_ = name.split("__");
         this.id = _loc1_[0];
         this.flag.visible = true;
         this.team = Number(_loc1_[1]);
      }
      
      public function setTeam(param1:uint) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.team = param1;
         gotoAndStop(param1);
         this.flag.gotoAndStop("flag" + param1);
      }
      
      public function capture(param1:*) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.team != param1.team)
         {
            if(this.unitCaptured)
            {
               return;
            }
            this.unitCaptured = param1;
            this.flag.visible = false;
            alpha = 0.7;
            this.rim.stop();
            param1.status.sInvis = 0;
            param1.hasFlag = this;
            param1.gun.resetFrame();
            param1.gun.swapGuns();
            param1.game.playScreenSound(S_Equip,param1.x,param1.y);
         }
         else if(param1.hasFlag)
         {
            if(param1.human)
            {
               var _loc2_:* = param1.score;
               var _loc3_:Number = _loc2_.flagCap + 1;
               _loc2_.flagCap = _loc3_;
            }
            param1.game.hud.addCustomFeed(param1,"flag");
            _loc2_ = param1;
            _loc3_ = _loc2_.pscore + 1;
            _loc2_.pscore = _loc3_;
            param1.gun.resetFrame();
            param1.hasFlag.reset();
            param1.game.matchSettings.updateScores();
            param1.game.playScreenSound(S_Skill,param1.x,param1.y);
         }
      }
      
      public function reset() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:* = this.unitCaptured;
         this.unitCaptured.hasFlag = null;
         this.unitCaptured.gun.swapGuns();
         this.unitCaptured = null;
         this.flag.visible = true;
         alpha = 1;
         this.rim.play();
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

