package
{
   public class Bullet_Melee_Basic extends Bullet
   {
      
      §§push(Bullet_Melee_Basic);
      if(37 == 34)
      {
         return;
      }
      
      public function Bullet_Melee_Basic(param1:Game, param2:Unit, param3:Number, param4:Number, param5:Number, param6:Number, param7:String, param8:Object = null)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super(param1,param2,param3,param4,param5,param6,param7,true,param8);
         var _loc9_:uint = 0;
         while(_loc9_ < uint(maxDist / 10))
         {
            x += xVel;
            y += yVel;
            §§push(§§findproperty(hitObject));
            var _temp_1:* = hitTestAll();
            if(§§pop().hitObject = hitTestAll())
            {
               break;
            }
            _loc9_++;
            if(2 == 3)
            {
               break;
            }
         }
         doHitEffect();
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

