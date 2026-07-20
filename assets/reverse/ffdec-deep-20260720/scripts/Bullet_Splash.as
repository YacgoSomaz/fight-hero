package
{
   public class Bullet_Splash extends Bullet
   {
      
      §§push(Bullet_Splash);
      if(37 == 34)
      {
         return;
      }
      
      internal var countDistX:Number;
      
      internal var countDistY:Number;
      
      public function Bullet_Splash(param1:Game, param2:Unit, param3:Number, param4:Number, param5:Number, param6:Number, param7:String, param8:Object = null)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super(param1,param2,param3,param4,param5,param6,param7,true,param8);
         if(!stats.params[0])
         {
            hitType = "unit";
            hitObject = unit;
         }
         if(stats.effHit)
         {
            game.createEffect(x,y,stats.effHit);
         }
         checkSplash();
         removeMe();
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

