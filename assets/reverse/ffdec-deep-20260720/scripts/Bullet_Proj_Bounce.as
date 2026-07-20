package
{
   public class Bullet_Proj_Bounce extends Bullet
   {
      
      §§push(Bullet_Proj_Bounce);
      if(37 == 34)
      {
         return;
      }
      
      private var fc:* = 0;
      
      public function Bullet_Proj_Bounce(param1:Game, param2:Unit, param3:Number, param4:Number, param5:Number, param6:Number, param7:String, param8:Object = null)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super(param1,param2,param3,param4,param5,param6,param7,true,param8);
         extra.bounce = 0;
         doHitEffect();
         xVel *= 0.5;
         yVel *= 0.5;
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:* = this;
         var _loc3_:Number = _loc2_.fc + 1;
         _loc2_.fc = _loc3_;
         yVel += stats.params[2] * 0.1;
         var _loc1_:uint = 0;
         while(_loc1_ < stats.params[1])
         {
            game.createEffect(x,y,stats.params[0]);
            x += xVel;
            y += yVel;
            if(SD.graphPart)
            {
               game.createEffect(x,y,stats.params[0]);
            }
            x += xVel;
            y += yVel;
            if(hitObject = hitTestAll(0,0,true))
            {
               break;
            }
            if(hitTestWall(0,0))
            {
               if(hitTestWall(0,15))
               {
                  _loc2_ = extra;
                  _loc3_ = _loc2_.bounce + 1;
                  _loc2_.bounce = _loc3_;
                  y -= yVel * 4;
                  yVel *= -0.5;
                  xVel *= 0.8;
               }
               if(hitTestWall(0,-15))
               {
                  _loc2_ = extra;
                  _loc3_ = _loc2_.bounce + 1;
                  _loc2_.bounce = _loc3_;
                  y -= yVel * 4;
                  yVel *= -0.5;
                  xVel *= 0.8;
               }
               if(hitTestWall(10,-10))
               {
                  _loc2_ = extra;
                  _loc3_ = _loc2_.bounce + 1;
                  _loc2_.bounce = _loc3_;
                  x -= xVel * 2;
                  xVel *= -0.6;
                  yVel *= 0.7;
               }
               if(hitTestWall(-10,-10))
               {
                  var _temp_5:* = extra;
                  _loc2_ = extra;
                  _loc3_ = _loc2_.bounce + 1;
                  _loc2_.bounce = _loc3_;
                  x -= xVel * 2;
                  xVel *= -0.6;
                  yVel *= 0.7;
               }
            }
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
         doHitEffect();
         if(this.fc == stats.params[3] * 30)
         {
            doHitEffect(true);
         }
         if(x < 0 || x > 3000 || y < 0 || y > 3000)
         {
            removeMe();
         }
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

