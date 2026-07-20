package
{
   public class Bullet_Proj_Mine extends Bullet
   {
      
      §§push(Bullet_Proj_Mine);
      if(37 == 34)
      {
         return;
      }
      
      private var fc:uint = 0;
      
      private var hitWall:Boolean;
      
      private var activated:Boolean;
      
      public function Bullet_Proj_Mine(param1:Game, param2:Unit, param3:Number, param4:Number, param5:Number, param6:Number, param7:String, param8:Object = null)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super(param1,param2,param3,param4,param5,param6,param7,true,param8);
         y -= 30;
         yVel = 0;
         trace("Mine created");
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         var _temp_1:* = this;
         var _loc2_:Bullet_Proj_Mine = this;
         var _loc3_:Number = _loc2_.fc + 1;
         _loc2_.fc = _loc3_;
         if(!this.activated)
         {
            if(!this.hitWall)
            {
               yVel += 2;
               if(yVel > 15)
               {
                  yVel = 15;
               }
               y += yVel;
               if(hitTestWall(0,8))
               {
                  while(hitTestWall(0,8))
                  {
                     y -= 3;
                     if(2 == 3)
                     {
                        break;
                     }
                  }
                  this.hitWall = true;
               }
            }
            else
            {
               _loc1_ = 0;
               while(_loc1_ < game.units.length)
               {
                  if(game.units[_loc1_] != unit)
                  {
                     if(!game.units[_loc1_].dead)
                     {
                        if(!(Boolean(unit.team) && unit.team == game.units[_loc1_].team))
                        {
                           if(!game.units[_loc1_].mov.crouching)
                           {
                              if(UT.inBox(game.units[_loc1_].x,game.units[_loc1_].y,x - 50,y - 80,100,100))
                              {
                                 game.playScreenSound(S_rocketFire,x,y);
                                 this.activated = true;
                                 this.fc = 0;
                              }
                           }
                        }
                     }
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
            }
            if(uint(this.fc / 2) % 15 == 0 && this.hitWall)
            {
               game.bitscreen.paint(x + game.arena.x,y + game.arena.y - 15,true,"mine0",unit.human || unit.team == 1 ? "team" : "enemy");
               game.playScreenSound(S_Beep,x,y);
            }
            else
            {
               game.bitscreen.paint(x + game.arena.x,y + game.arena.y - 15,true,"mine0","off");
            }
         }
         else
         {
            game.bitscreen.paint(x + game.arena.x,y + game.arena.y - 15,true,"mine0","activate",this.fc);
            if(this.fc == 13)
            {
               y -= 40;
               doHitEffect(true);
            }
         }
      }
      
      override protected function removeMe() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         remove = true;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

