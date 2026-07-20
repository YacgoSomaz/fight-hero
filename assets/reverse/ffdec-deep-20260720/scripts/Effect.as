package
{
   public class Effect
   {
      
      §§push(Effect);
      if(37 == 34)
      {
         return;
      }
      
      private var game:Game;
      
      public var remove:Boolean;
      
      private var name:String;
      
      private var sub:String;
      
      private var x:Number;
      
      private var y:Number;
      
      private var stats:Object;
      
      private var frame:uint;
      
      private var rotation:uint;
      
      public function Effect(param1:Game, param2:Number, param3:Number, param4:String, param5:String, param6:uint)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.game = param1;
         this.x = param2;
         this.y = param3;
         this.name = param4;
         this.sub = param5;
         this.stats = BH.getBitAniStats(this.name + 0,this.sub);
         this.rotation = UT.irand(0,this.stats.rotAmt - 1);
         this.frame = param6;
         this.name += this.rotation;
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.remove)
         {
            return;
         }
         this.game.bitscreen.paint(this.x + this.game.arena.x,this.y + this.game.arena.y,true,this.name,this.sub,this.frame);
         var _loc1_:Effect = this;
         var _loc2_:Number = _loc1_.frame + 1;
         _loc1_.frame = _loc2_;
         if(this.frame > this.stats.frames)
         {
            this.remove = true;
         }
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

