package
{
   import flash.events.KeyboardEvent;
   import flash.system.System;
   
   public class Player extends Unit
   {
      
      §§push(Player);
      if(37 == 34)
      {
         return;
      }
      
      private var pressedUp:Boolean;
      
      private var sniperMode:Boolean;
      
      public function Player(param1:Game, param2:Object)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super(param1,true,param2);
         MC.goto("idle");
         game.aimer.gotoAndStop(this.sniperMode ? 2 : 1);
      }
      
      override public function spawn(param1:Number = 0, param2:Number = 0, param3:String = "") : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         game.hud.reset();
         unitSpawn(param1,param2,param3);
         aimX = x + 200;
         aimY = y - 50;
         game.aimer.x = game.mouseX;
         game.aimer.y = game.mouseY;
         game.hud.setClassChange(false);
         status.sSpawn = 2.5 * 30;
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(dead)
         {
            if(respawnTimer)
            {
               if(respawnTimer < 3 * 30)
               {
                  game.hud.setRespawnText("Respawn in " + Math.ceil(respawnTimer / 30));
               }
               var _loc3_:* = §§findproperty(respawnTimer);
               var _loc4_:Number = _loc3_.respawnTimer - 1;
               _loc3_.respawnTimer = _loc4_;
            }
            else
            {
               this.spawn();
            }
            return;
         }
         MCfilters = [];
         if(!unitInfo.extra.noAim)
         {
            aimX += (game.arena.mouseX - aimX) * 0.5;
            aimY += (game.arena.mouseY - aimY) * 0.5;
         }
         if(mDown)
         {
            gun.shoot();
         }
         var _loc1_:Number = UT.getDist(x + MC.arm1.x,y + MC.arm1.y,game.arena.mouseX,game.arena.mouseY);
         _loc1_ *= _loc1_;
         _loc1_ *= 2;
         var _loc2_:Number = Math.sqrt(_loc1_ - _loc1_ * Math.cos(gun.dynRecoilMod * Math.PI / 180));
         if(!this.sniperMode)
         {
            game.aimer.line1.y = -_loc2_;
            game.aimer.line2.x = _loc2_;
            game.aimer.line3.y = _loc2_;
            game.aimer.line4.x = -_loc2_;
            game.aimer.circle.width = game.aimer.circle.height = _loc2_ * 2;
         }
         if(unitInfo.extra.noAim)
         {
            game.aimer.x = -1000;
            game.aimer.y = -1000;
         }
         else
         {
            game.aimer.x = game.mouseX;
            game.aimer.y = game.mouseY;
         }
         UnitEnterFrame();
      }
      
      public function MouseDown() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!game.gameStarted || Boolean(unitInfo.extra.noShoot))
         {
            return;
         }
         mDown = true;
      }
      
      public function MouseUp() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         mDown = false;
         gun.releaseMouse();
      }
      
      public function KeyDown(param1:KeyboardEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:Boolean = false;
         var _loc3_:uint = 0;
         switch(param1.keyCode)
         {
            case 27:
               §§push(0);
               break;
            case 80:
               §§push(1);
               break;
            case 69:
               §§push(2);
               break;
            case 17:
               §§push(3);
               break;
            case 67:
               §§push(4);
               break;
            case 79:
               §§push(5);
               break;
            case 76:
               §§push(6);
               break;
            case 82:
               §§push(7);
               break;
            case 16:
               §§push(8);
               break;
            case 81:
               §§push(9);
               break;
            case 40:
               §§push(10);
               break;
            case 83:
               §§push(11);
               break;
            case 37:
               §§push(12);
               break;
            case 65:
               §§push(13);
               break;
            case 39:
               §§push(14);
               break;
            case 68:
               §§push(15);
               break;
            case 38:
               §§push(16);
               break;
            case 87:
               §§push(17);
               break;
            case 32:
               §§push(18);
               break;
            case 48:
               §§push(19);
               break;
            case 49:
               §§push(20);
               break;
            case 50:
               §§push(21);
               break;
            case 51:
               §§push(22);
               break;
            case 52:
               §§push(23);
               break;
            case 53:
               §§push(24);
               break;
            case 187:
               §§push(25);
               break;
            default:
               §§push(26);
         }
         2;
         switch(§§pop())
         {
            case 0:
            case 1:
               game.togglePause();
               break;
            case 2:
            case 3:
               if(game.paused)
               {
                  break;
               }
               useKillstreak();
               break;
            case 4:
               if(!Main.DEBUGMODE)
               {
                  break;
               }
               System.setClipboard(game.arena.mouseX + ", " + game.arena.mouseY);
               break;
            case 5:
               if(!Main.DEBUGMODE)
               {
                  break;
               }
               _loc2_ = !game.arena.wallMC.visible;
               game.arena.wallMC.visible = _loc2_;
               _loc3_ = 0;
               while(_loc3_ < game.arena.spawns.length)
               {
                  game.arena.spawns[_loc3_].visible = _loc2_;
                  _loc3_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               _loc3_ = 0;
               while(_loc3_ < game.arena.spawnsT1.length)
               {
                  game.arena.spawnsT1[_loc3_].visible = _loc2_;
                  _loc3_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               _loc3_ = 0;
               while(_loc3_ < game.arena.spawnsT2.length)
               {
                  game.arena.spawnsT2[_loc3_].visible = _loc2_;
                  _loc3_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               _loc3_ = 0;
               while(_loc3_ < game.arena.waypoints.length)
               {
                  game.arena.waypoints[_loc3_].visible = _loc2_;
                  _loc3_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               _loc3_ = 0;
               while(_loc3_ < game.arena.waypoints.length)
               {
                  game.arena.waypoints[_loc3_].showConnectors(_loc2_);
                  _loc3_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               _loc3_ = 0;
               while(_loc3_ < game.arena.aiactions.length)
               {
                  game.arena.aiactions[_loc3_].visible = _loc2_;
                  _loc3_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               _loc3_ = 0;
               while(_loc3_ < game.arena.physboxes.length)
               {
                  game.arena.physboxes[_loc3_].visible = _loc2_;
                  _loc3_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
               break;
            case 6:
               if(!Main.DEBUGMODE)
               {
                  break;
               }
               SD.graphLights = !SD.graphLights;
               game.arena.toggleLights();
               break;
            case 7:
               if(game.paused)
               {
                  break;
               }
               gun.manualReload();
               break;
            case 8:
            case 9:
               if(dead)
               {
                  break;
               }
               if(game.paused)
               {
                  break;
               }
               gun.swapGuns();
               if(Stats_Campaign.sn == 12)
               {
                  game.hud.gotoAndStop("idle");
                  _loc3_ = 0;
                  while(_loc3_ < game.arena.downarrows.length)
                  {
                     if(Number(game.arena.downarrows[_loc3_].name.substring(9)) == Stats_Campaign.sn)
                     {
                        game.arena.downarrows[_loc3_].visible = true;
                     }
                     else
                     {
                        game.arena.downarrows[_loc3_].visible = false;
                     }
                     _loc3_++;
                     if(2 == 3)
                     {
                        break;
                     }
                  }
                  var _loc4_:Stats_Campaign = Stats_Campaign;
                  var _loc5_:Number = _loc4_.sn + 1;
                  _loc4_.sn = _loc5_;
                  game.arena.changeWallFrame(Stats_Campaign.sn);
                  game.arena.door.gotoAndPlay("open");
               }
               break;
            case 10:
            case 11:
               keys |= DOWN;
               break;
            case 12:
            case 13:
               keys |= LEFT;
               break;
            case 14:
            case 15:
               keys |= RIGHT;
               break;
            case 16:
            case 17:
            case 18:
               if(this.pressedUp)
               {
                  break;
               }
               if(game.paused)
               {
                  break;
               }
               keys |= UP;
               mov.doJump();
               this.pressedUp = true;
               break;
            case 19:
               if(!Main.DEBUGMODE)
               {
                  break;
               }
               game.createEffect(x,y - 50,"bloodmist");
               game.createEffect(x,y - 50,"bloodmist");
               status.damage(50,this,Stats_Guns.gunOb["env"],{});
               break;
            case 20:
               if(!Main.DEBUGMODE)
               {
                  break;
               }
               game.hud.addExp(Stats_Classes.getNextExp(SD.classSaves[SD.selClass].level));
               break;
            case 21:
               if(!Main.DEBUGMODE)
               {
                  break;
               }
               game.hud.addExp(5);
               break;
            case 22:
               if(!Main.DEBUGMODE)
               {
                  break;
               }
               game.hud.addExp(9);
               break;
            case 23:
               if(!Main.DEBUGMODE)
               {
                  break;
               }
               canUseStreak = true;
               useKillstreak();
               break;
            case 24:
               if(!Main.DEBUGMODE)
               {
                  break;
               }
               game.hud.debug.y = 0;
               break;
            case 25:
               if(!Main.DEBUGMODE)
               {
                  break;
               }
               game.endGame(true);
         }
      }
      
      public function KeyUp(param1:KeyboardEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         switch(param1.keyCode)
         {
            case 38:
               §§push(0);
               break;
            case 87:
               §§push(1);
               break;
            case 32:
               §§push(2);
               break;
            case 40:
               §§push(3);
               break;
            case 83:
               §§push(4);
               break;
            case 37:
               §§push(5);
               break;
            case 65:
               §§push(6);
               break;
            case 39:
               §§push(7);
               break;
            case 68:
               §§push(8);
               break;
            default:
               §§push(9);
         }
         2;
         switch(§§pop())
         {
            case 0:
            case 1:
            case 2:
               if(keys & UP)
               {
                  keys ^= UP;
                  this.pressedUp = false;
               }
               break;
            case 3:
            case 4:
               if(keys & DOWN)
               {
                  keys ^= DOWN;
               }
               break;
            case 5:
            case 6:
               if(keys & LEFT)
               {
                  keys ^= LEFT;
               }
               break;
            case 7:
            case 8:
               if(keys & RIGHT)
               {
                  keys ^= RIGHT;
               }
         }
      }
      
      public function releaseKeys() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(keys & DOWN)
         {
            keys ^= DOWN;
         }
         if(keys & LEFT)
         {
            keys ^= LEFT;
         }
         if(keys & RIGHT)
         {
            keys ^= RIGHT;
         }
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

