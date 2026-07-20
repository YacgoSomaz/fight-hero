package
{
   public class AI extends Unit
   {
      
      §§push(AI);
      if(37 == 34)
      {
         return;
      }
      
      private var curWp:NodeWaypoint;
      
      private var nextWp:NodeWaypoint;
      
      private var wpTimer:uint;
      
      private var focusX:Number;
      
      private var focusY:Number;
      
      private var target:*;
      
      private var path:String;
      
      private var getTargetTimer:uint;
      
      private var getTargetEvent:uint;
      
      private var wait:uint;
      
      private var nowait:uint;
      
      public var crouch:uint;
      
      public var nocrouch:uint;
      
      private var shootSpd:Number;
      
      private var waitNormal:Number;
      
      private var waitTarget:Number;
      
      private var crouchNormal:Number;
      
      private var crouchTarget:Number;
      
      private var waitFlag:Number;
      
      private var shotChance:Number;
      
      private var aimSpeed:Number;
      
      private var diffRev:uint;
      
      public function AI(param1:Game, param2:*)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super(param1,false,param2);
         MC.goto("idle");
         this.path = "@@";
         this.getTargetEvent = UT.irand(1,12);
      }
      
      override public function setDiffStats(param1:Number = -99, param2:Boolean = false, param3:Boolean = true) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(param1 == -99)
         {
            param1 = odiff;
         }
         if(param3)
         {
            if(param1 < 0)
            {
               param1 = 0;
            }
         }
         else if(param1 < 1)
         {
            param1 = 1;
         }
         if(param1 > 15)
         {
            param1 = 15;
         }
         diff = param1;
         if(param2)
         {
            odiff = param1;
         }
         this.diffRev = 15 - diff;
         this.waitNormal = 0.01 * (this.diffRev * 0.3);
         this.waitTarget = 0.03 * (this.diffRev * 0.3);
         this.crouchNormal = 0.01 * (this.diffRev * 0.3);
         this.crouchTarget = 0.02 * (this.diffRev * 0.3);
         this.waitFlag = 0.005 * (this.diffRev * 0.3);
         this.shotChance = diff * 0.29 + 0.1;
         if(diff == 10)
         {
            this.shotChance = 1000;
         }
         this.aimSpeed = 0.3 * (diff * 0.1 + 0.1);
         if(unitInfo.id == "medic")
         {
            this.waitNormal *= 2;
         }
         if(unitInfo.id == "sniper")
         {
            this.waitTarget *= 2;
            this.crouchTarget *= 2;
         }
         if(unitInfo.id == "tank")
         {
            this.waitTarget *= 0.5;
         }
         if(unitInfo.id == "soldier")
         {
            this.crouchTarget *= 0.5;
         }
         if(gun.primary.typeName == "Shield")
         {
            this.crouchTarget = 0.09;
         }
         if(unitInfo.skill.id == "shadow")
         {
            this.crouchNormal *= 3;
            this.crouchNormal = 0.03;
         }
      }
      
      override public function spawn(param1:Number = 0, param2:Number = 0, param3:String = "") : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         unitSpawn(param1,param2,param3);
         aimX = x + 100;
         aimY = y - 50;
         if(unitInfo.extra.aimReverse)
         {
            aimX = y - 100;
            MC.scaleX = -1;
         }
         status.sSpawn = 0.5 * 30;
      }
      
      override protected function setAiSpawnNode(param1:NodeSpawn) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.getNextWaypoint(param1.waypoint,true);
      }
      
      private function moveToObjective() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!hasFlag)
         {
            if(Math.random() < 0.3 && !game.arena["flag" + (team == 1 ? 2 : 1)].unitCaptured)
            {
               this.path = this.pathFind(game.arena["flag" + (team == 1 ? 2 : 1)].id,5);
               trace("SET PATH TO ENEMY FLAG",this.path);
            }
         }
         else
         {
            this.path = this.pathFind(game.arena["flag" + team].id,5);
            trace("SET PATH TO HOME FLAG",this.path);
         }
      }
      
      override public function getNextWaypoint(param1:NodeWaypoint = null, param2:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.wpTimer = 0;
         if(!param2 && mov.jumping && Math.abs(y - this.nextWp.y) > 30)
         {
            return;
         }
         if(param1)
         {
            this.curWp = this.nextWp;
            this.nextWp = param1;
         }
         else
         {
            this.curWp = this.nextWp;
            if(MatchSettings.useMode == "ctf" && !this.path && this.path.charAt(0) != "@")
            {
               this.moveToObjective();
            }
            if(Math.abs(y - this.curWp.y) > 50)
            {
               this.getClosestWp();
            }
            else if(Math.abs(y - this.curWp.y) < 50)
            {
               if(Boolean(this.path) && this.path.charAt(0) != "@")
               {
                  this.nextWp = game.arena.wpOb[this.path.charAt(0)];
                  this.path = this.path.substring(1);
                  if(this.path == "")
                  {
                     this.path = "@";
                  }
                  trace(this.path);
               }
               else
               {
                  this.nextWp = UT.randEl(this.curWp.connects);
                  if(this.path.charAt(0) == "@")
                  {
                     this.path = this.path.substring(1);
                  }
               }
            }
         }
         if(Main.DEBUGMODE)
         {
            txt_name.text = (this.curWp ? this.curWp.id.toUpperCase() : "Null") + " to " + this.nextWp.id.toUpperCase();
         }
      }
      
      public function getClosestWp() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(!diff)
         {
            return;
         }
         this.wpTimer = 0;
         this.path = "@";
         var _loc1_:Array = new Array();
         var _loc2_:uint = 0;
         while(_loc2_ < game.arena.waypoints.length)
         {
            if(Math.abs(y - game.arena.waypoints[_loc2_].y) < 100)
            {
               _loc1_.push({
                  "dist":Math.abs(x - game.arena.waypoints[_loc2_].x),
                  "wp":game.arena.waypoints[_loc2_]
               });
            }
            _loc2_++;
            if(2 == 3)
            {
               break;
            }
         }
         if(_loc1_.length)
         {
            _loc1_.sortOn("dist",Array.NUMERIC);
            this.nextWp = _loc1_[0].wp;
         }
         else
         {
            this.nextWp = UT.randEl(this.curWp.connects);
         }
      }
      
      public function pathFind(param1:String, param2:uint = 0) : String
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:Array = [];
         var _loc4_:uint = 0;
         while(_loc4_ < this.curWp.connects.length)
         {
            this.searchNode(this.curWp.connects[_loc4_].id,param1,this.curWp.id,_loc3_);
            _loc4_++;
            if(2 == 3)
            {
               break;
            }
         }
         _loc3_.sortOn("dist",Array.NUMERIC);
         if(param2 > _loc3_.length - 1)
         {
            param2 = _loc3_.length - 1;
         }
         return _loc3_[UT.irand(0,param2)].path.substring(1);
      }
      
      private function searchNode(param1:String, param2:String, param3:String, param4:Array) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc6_:String = null;
         param3 += param1;
         if(param1 == param2)
         {
            param4.push(new NodeWaypointPath(param3,game.arena.wpOb));
         }
         var _loc5_:uint = 0;
         while(_loc5_ < game.arena.wpOb[param1].connects.length)
         {
            _loc6_ = game.arena.wpOb[param1].connects[_loc5_].id;
            if(param3.indexOf(_loc6_) == -1)
            {
               this.searchNode(_loc6_,param2,param3,param4);
            }
            _loc5_++;
            if(2 == 3)
            {
               break;
            }
         }
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         var _loc2_:Array = null;
         var _loc3_:Number = NaN;
         var _loc4_:Boolean = false;
         var _loc5_:uint = 0;
         if(unitInfo.extra.noSpawn)
         {
            return;
         }
         if(!mov.jumping && !this.wait && !this.crouch)
         {
            var _loc6_:* = this;
            var _loc7_:Number = _loc6_.wpTimer + 1;
            _loc6_.wpTimer = _loc7_;
         }
         if(this.wpTimer >= 30 * 4)
         {
            this.getClosestWp();
         }
         if(dead)
         {
            if(respawnTimer)
            {
               var _temp_4:* = §§findproperty(respawnTimer);
               _loc6_ = §§findproperty(respawnTimer);
               _loc7_ = _loc6_.respawnTimer - 1;
               _loc6_.respawnTimer = _loc7_;
            }
            else
            {
               this.spawn();
            }
            return;
         }
         MCfilters = [];
         keys = 0;
         if(diff)
         {
            if(this.nextWp.x > x - 30 && this.nextWp.x < x + 30)
            {
               this.getNextWaypoint();
            }
            else if(!this.wait && this.nextWp.x > x)
            {
               keys |= RIGHT;
            }
            else if(!this.wait && this.nextWp.x < x)
            {
               keys |= LEFT;
            }
         }
         if(MatchSettings.useMode == "dom")
         {
            _loc1_ = 0;
            while(_loc1_ < game.arena.holdpoints.length)
            {
               if(UT.inBox(x,y,game.arena.holdpoints[_loc1_].x - 120,game.arena.holdpoints[_loc1_].y - 150,240,200))
               {
                  if(!this.wait && !this.nowait && (team != game.arena.holdpoints[_loc1_].curTeam || game.arena.holdpoints[_loc1_].flag > -50))
                  {
                     if(Math.random() < 0.5)
                     {
                        this.wait = UT.irand(1,8) * 30;
                     }
                     else
                     {
                        this.crouch = UT.irand(1,8) * 30;
                     }
                     this.nowait = 0;
                  }
               }
               _loc1_++;
               if(2 == 3)
               {
                  break;
               }
            }
         }
         if(MatchSettings.useMode == "ctf")
         {
            if(!game.arena["flag" + team].unitCaptured && UT.inBox(x,y,game.arena["flag" + team].x - 100,game.arena["flag" + team].y - 40,200,100))
            {
               if(!this.wait && !this.nowait && !hasFlag)
               {
                  defendingFlag = true;
                  if(Math.random() < 0.5)
                  {
                     this.wait = UT.irand(1,8) * 30;
                  }
                  else
                  {
                     this.crouch = UT.irand(1,8) * 30;
                  }
                  this.nowait = this.wait + UT.irand(0,2) * 30;
               }
            }
            if(!this.wait && !this.nowait)
            {
               defendingFlag = false;
            }
         }
         if(!this.wait && !this.nowait && !mov.jumping && Math.random() < (this.target ? this.waitTarget : this.waitNormal) && !status.sSpawn)
         {
            this.wait = UT.irand(2,6) * (this.diffRev * 0.1) * 30;
            this.nowait = this.wait + UT.irand(2,6) * (diff * 0.1) * 30;
            if(hasFlag)
            {
               this.wait *= 0.2;
            }
         }
         if(!this.crouch && Math.random() < (this.target ? this.crouchTarget : 0) && !status.sSpawn)
         {
            this.crouch = UT.irand(2,4) * (this.diffRev * 0.1) * 30;
            this.nocrouch = this.crouch / 2;
         }
         if(this.wait)
         {
            _loc6_ = this;
            _loc7_ = _loc6_.wait - 1;
            _loc6_.wait = _loc7_;
         }
         if(this.nowait)
         {
            _loc6_ = this;
            _loc7_ = _loc6_.nowait - 1;
            _loc6_.nowait = _loc7_;
         }
         if(Boolean(this.crouch) && Boolean(keys & LEFT) && Boolean(mov.hitTest(-19,-20)))
         {
            this.crouch = 0;
         }
         if(Boolean(this.crouch) && Boolean(keys & RIGHT) && Boolean(mov.hitTest(19,-20)))
         {
            this.crouch = 0;
         }
         if(Boolean(this.crouch) && Boolean(diff))
         {
            keys |= DOWN;
            _loc6_ = this;
            _loc7_ = _loc6_.crouch - 1;
            _loc6_.crouch = _loc7_;
         }
         _loc6_ = this;
         _loc7_ = _loc6_.getTargetTimer + 1;
         _loc6_.getTargetTimer = _loc7_;
         if(this.getTargetTimer > 12)
         {
            this.getTargetTimer = 0;
         }
         if(this.getTargetTimer == this.getTargetEvent)
         {
            _loc2_ = [];
            _loc1_ = 0;
            while(_loc1_ < game.units.length)
            {
               if(game.units[_loc1_] != this)
               {
                  if(!game.units[_loc1_].dead)
                  {
                     if(!(Boolean(team) && team == game.units[_loc1_].team))
                     {
                        if(game.units[_loc1_].status.sInvis != 1)
                        {
                           if(!game.units[_loc1_].status.sSpawn)
                           {
                              _loc3_ = UT.getDist(x,y,game.units[_loc1_].x,game.units[_loc1_].y);
                              if(_loc3_ < Math.min(gun.curGun.range * 10,450))
                              {
                                 _loc2_.push({
                                    "dist":_loc3_,
                                    "unit":game.units[_loc1_],
                                    "rot":UT.getRotation(x,y,game.units[_loc1_].x,game.units[_loc1_].y)
                                 });
                              }
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
            if(!gun.curGun.extra.burrow)
            {
               _loc1_ = 0;
               while(_loc1_ < _loc2_.length)
               {
                  _loc4_ = true;
                  _loc5_ = 0;
                  while(_loc4_ && _loc5_ < _loc2_[_loc1_].dist)
                  {
                     if(mov.hitTest(UT.xMoveToRot(_loc2_[_loc1_].rot,_loc5_),UT.yMoveToRot(_loc2_[_loc1_].rot,_loc5_) - (mov.crouching ? 20 : 50)))
                     {
                        _loc4_ = false;
                     }
                     _loc5_ += 20;
                  }
                  if(!_loc4_)
                  {
                     _loc2_.splice(_loc1_,1);
                     _loc1_--;
                  }
                  _loc1_++;
                  if(2 == 3)
                  {
                     break;
                  }
               }
            }
            if(_loc2_.length)
            {
               _loc2_.sortOn("dist",Array.NUMERIC);
               this.target = _loc2_[0].unit;
            }
            else
            {
               this.target = null;
            }
         }
         if(!this.target)
         {
            this.focusX = x + MC.scaleX * 50 + mov.xVel * 10;
            this.focusY = y - 40 + mov.yVel * 8;
            aimX += (this.focusX - aimX) * 0.4;
            aimY += (this.focusY - aimY) * 0.3;
         }
         else
         {
            this.focusX = !this.target.dead ? Number(this.target.x) : Number(this.target.dead.rdBody.GetDefinition().userData.x);
            this.focusY = !this.target.dead ? this.target.y - (this.target.mov.crouching ? 20 : 40) : this.target.dead.rdBody.GetDefinition().userData.y + 10;
            aimX += (this.focusX - aimX) * this.aimSpeed;
            aimY += (this.focusY - aimY) * this.aimSpeed;
         }
         if(Boolean(game.gameStarted && this.target) && Boolean(diff) && !status.sSpawn)
         {
            this.shootSpd = 0.05 + (1 - (gun.curGun.shootDelay <= 0.9 ? gun.curGun.shootDelay : 0.9)) * 0.2;
            this.shootSpd *= this.shotChance;
            if(Math.random() < this.shootSpd)
            {
               gun.shoot();
            }
         }
         if(canUseStreak)
         {
            useKillstreak();
         }
         _loc1_ = 0;
         do
         {
            if(_loc1_ >= this.nextWp.actionBoxes.length)
            {
               break;
            }
            if(!UT.inBox(x,y,this.nextWp.actionBoxes[_loc1_].x,this.nextWp.actionBoxes[_loc1_].y,this.nextWp.actionBoxes[_loc1_].width,this.nextWp.actionBoxes[_loc1_].height))
            {
               continue;
            }
            if(keys & DOWN)
            {
               keys ^= DOWN;
            }
            switch(this.nextWp.actionBoxes[_loc1_].action)
            {
               case "j":
                  §§push(0);
                  break;
               case "c":
                  §§push(1);
                  break;
               case "fc":
                  §§push(2);
                  break;
               case "fp":
                  §§push(3);
                  break;
               case "fd":
                  §§push(4);
                  break;
               default:
                  §§push(5);
            }
            2;
            switch(§§pop())
            {
               case 0:
                  if(!capturing)
                  {
                     this.wait = 0;
                     this.nowait = 30;
                     if(!mov.jumping)
                     {
                        mov.doJump();
                     }
                  }
                  break;
               case 1:
                  keys |= DOWN;
                  break;
               case 2:
                  this.getNextWaypoint(game.arena.wpOb["c"],true);
                  break;
               case 3:
                  this.getNextWaypoint(game.arena.wpOb["p"],true);
                  break;
               case 4:
                  this.getNextWaypoint(game.arena.wpOb["d"],true);
            }
         }
         while(_loc1_++, 2 != 3);
         UnitEnterFrame();
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

