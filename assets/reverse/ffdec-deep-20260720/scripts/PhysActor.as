package
{
   import Box2D.Collision.*;
   import Box2D.Collision.Shapes.*;
   import Box2D.Common.Math.*;
   import Box2D.Common.b2Settings;
   import Box2D.Dynamics.*;
   import Box2D.Dynamics.Joints.b2RevoluteJointDef;
   
   public class PhysActor
   {
      
      §§push(PhysActor);
      if(37 == 34)
      {
         return;
      }
      
      private var physWorld:PhysWorld;
      
      public var unit:Unit;
      
      private var weapon:Stats_Guns;
      
      private var x:Number;
      
      private var y:Number;
      
      private var body:b2Body;
      
      private var bodyDef:b2BodyDef;
      
      private var boxShape:b2PolygonShape;
      
      private var circleShape:b2CircleShape;
      
      private var fixtureDef:b2FixtureDef;
      
      private var skin:uint;
      
      public var parts:Array;
      
      public var rdBody:b2Body;
      
      public var rdHead:b2Body;
      
      private var physMod:String;
      
      private var evaporate:Boolean;
      
      private var alpha:Number = 1;
      
      public var flip:int;
      
      public var fc:uint = 0;
      
      public function PhysActor(param1:PhysWorld, param2:Unit, param3:Unit, param4:Stats_Guns, param5:Object)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.physWorld = param1;
         this.unit = param2;
         this.weapon = param4;
         this.x = this.unit.x;
         this.y = this.unit.y - 40;
         this.physMod = MatchSettings.useMap.phys;
         this.flip = this.unit.MC.scaleX;
         this.parts = [];
         this.skin = this.unit.MC.curSkin;
         this.fixtureDef = new b2FixtureDef();
         var _loc6_:b2Body = this.createPart(0,0,0.1,0.8,PhysBody,true);
         if(this.unit.MC.gun.visible)
         {
            _loc6_.GetDefinition().userData.gun.gotoAndStop(this.unit.MC.gun.currentFrame);
         }
         var _loc7_:b2Body = this.createPart(5,-14,0.05,1,PhysHead,false);
         this.createJoint(_loc6_,_loc7_,this.createVec(2,0),-0.1,0.03);
         var _loc8_:b2Body = this.createPart(-2,17,0,0.6,PhysUpperLeg,true);
         this.createJoint(_loc6_,_loc8_,this.createVec(-1,10),-0.5,0.2);
         if(this.unit.MC.legup1.gun.visible)
         {
            _loc8_.GetDefinition().userData.gun.gotoAndStop(this.unit.MC.legup1.gun.currentFrame);
         }
         var _loc9_:b2Body = this.createPart(-2,28,0,0.6,PhysLowerLeg,true);
         this.createJoint(_loc8_,_loc9_,this.createVec(-2,20),0,0.5);
         var _loc10_:b2Body = this.createPart(-2,34,0,1,PhysFoot,true);
         this.createJoint(_loc9_,_loc10_,this.createVec(-3,34),-0.1,0.2);
         var _loc11_:b2Body = this.createPart(-2,17,0,0.6,PhysUpperLeg,true);
         this.createJoint(_loc6_,_loc11_,this.createVec(-1,10),-0.5,0.2);
         var _loc12_:b2Body = this.createPart(-2,28,0,0.6,PhysLowerLeg,true);
         this.createJoint(_loc11_,_loc12_,this.createVec(-2,20),0,0.5);
         var _loc13_:b2Body = this.createPart(-2,34,0,1,PhysFoot,true);
         this.createJoint(_loc12_,_loc13_,this.createVec(-3,34),-0.1,0.2);
         var _loc14_:b2Body = this.createPart(1,1,-0.2,0.5,PhysUpperArm,true);
         this.createJoint(_loc6_,_loc14_,this.createVec(-1,-4),0,0);
         var _loc15_:b2Body = this.createPart(11,8,-0.5,0.6,PhysLowerArm,true);
         this.createJoint(_loc14_,_loc15_,this.createVec(7,8),-0.4,0.3);
         var _loc16_:b2Body = this.createPart(19,8,0,1,PhysHand,false);
         this.createJoint(_loc15_,_loc16_,this.createVec(17,8),-0.2,0.2);
         var _loc17_:b2Body = this.createPart(1,1,-0.2,0.5,PhysUpperArm,true);
         this.createJoint(_loc6_,_loc17_,this.createVec(-1,-4),0,0);
         var _loc18_:b2Body = this.createPart(11,8,-0.5,0.6,PhysLowerArm,true);
         this.createJoint(_loc17_,_loc18_,this.createVec(7,8),-0.4,0.3);
         var _loc19_:b2Body = this.createPart(19,8,0,1,PhysHand,false);
         this.createJoint(_loc18_,_loc19_,this.createVec(17,8),-0.2,0.2);
         this.parts.push(_loc19_,_loc18_,_loc17_);
         this.parts.push(_loc13_,_loc12_,_loc11_);
         this.parts.push(_loc10_,_loc9_,_loc8_);
         this.parts.push(_loc6_);
         this.parts.push(_loc7_);
         this.parts.push(_loc16_,_loc15_,_loc14_);
         this.rdBody = _loc6_;
         this.rdHead = _loc7_;
         var _loc20_:uint = 0;
         while(_loc20_ < this.parts.length)
         {
            this.physWorld.addChild(this.parts[_loc20_].GetDefinition().userData);
            _loc20_++;
            if(2 == 3)
            {
               break;
            }
         }
         if(!this.physWorld.game.gameEnded && (param3 == this.unit.game.player || this.unit == this.unit.game.player || param3 == this.unit))
         {
         }
         if(this.physMod == "sky")
         {
            this.forceAll(-4,-1.5);
         }
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:PhysActor = this;
         var _loc2_:Number = _loc1_.fc + 1;
         _loc1_.fc = _loc2_;
         if(this.physMod == "train" && this.rdBody.GetDefinition().userData.y > 1920)
         {
            this.physMod = "";
            this.forceAll(-8,4);
            this.impulseAll(new b2Vec2(-9,1));
         }
         if(this.fc == 5 * 30)
         {
            this.physWorld.actors.splice(this.physWorld.actors.indexOf(this),1);
            this.destroy();
         }
      }
      
      public function destroy() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:uint = 0;
         while(_loc1_ < this.parts.length)
         {
            this.physWorld.removeChild(this.parts[_loc1_].GetDefinition().userData);
            this.physWorld.m_world.DestroyBody(this.parts[_loc1_]);
            _loc1_++;
            if(2 == 3)
            {
               break;
            }
         }
      }
      
      public function impulseBody(param1:b2Vec2) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rdBody.ApplyImpulse(param1,this.rdBody.GetWorldCenter());
      }
      
      public function impulseHead(param1:b2Vec2) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.rdHead.ApplyImpulse(param1,this.rdBody.GetWorldCenter());
      }
      
      public function impulseAll(param1:b2Vec2 = null, param2:Number = -1, param3:Number = 1) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc4_:uint = 0;
         while(_loc4_ < this.parts.length)
         {
            if(param1)
            {
               this.parts[_loc4_].ApplyImpulse(param1,this.parts[_loc4_].GetWorldCenter());
            }
            else
            {
               this.parts[_loc4_].ApplyImpulse(new b2Vec2(UT.rand(param2,param3),UT.rand(param2,param3)),this.parts[_loc4_].GetWorldCenter());
            }
            _loc4_++;
            if(2 == 3)
            {
               break;
            }
         }
      }
      
      public function forceAll(param1:Number, param2:Number) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc3_:uint = 0;
         while(_loc3_ < this.parts.length)
         {
            this.parts[_loc3_].ApplyForce(new b2Vec2(param1,param2),this.parts[_loc3_].GetWorldCenter());
            _loc3_++;
            if(2 == 3)
            {
               break;
            }
         }
      }
      
      public function createVec(param1:Number, param2:Number) : b2Vec2
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         return new b2Vec2((this.x + param1 * this.flip) / 30,(this.y + param2) / 30);
      }
      
      public function createJoint(param1:b2Body, param2:b2Body, param3:b2Vec2, param4:Number, param5:Number) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc7_:Number = NaN;
         if(MatchSettings.useMod == "bodypop")
         {
            return;
         }
         if(Math.random() < this.weapon.bodBreak && SD.blood == 2)
         {
            return;
         }
         if(this.flip == -1)
         {
            _loc7_ = param4;
            param4 = param5 * this.flip;
            param5 = _loc7_ * this.flip;
         }
         var _loc6_:b2RevoluteJointDef = new b2RevoluteJointDef();
         _loc6_.Initialize(param1,param2,param3);
         _loc6_.lowerAngle = param4 * b2Settings.b2_pi;
         _loc6_.upperAngle = param5 * b2Settings.b2_pi;
         _loc6_.enableLimit = Boolean(param4) || Boolean(param5);
         _loc6_.maxMotorTorque = 0.02;
         _loc6_.motorSpeed = 0;
         _loc6_.enableMotor = true;
         this.physWorld.m_world.CreateJoint(_loc6_);
      }
      
      public function createPart(param1:Number, param2:Number, param3:Number, param4:Number, param5:*, param6:Boolean) : b2Body
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         param1 *= this.flip;
         param3 *= this.flip;
         param1 += this.x;
         param2 += this.y;
         this.bodyDef = new b2BodyDef();
         this.bodyDef.type = b2Body.b2_dynamicBody;
         this.bodyDef.position.x = param1 / 30;
         this.bodyDef.position.y = param2 / 30;
         this.bodyDef.angle = param3 * b2Settings.b2_pi;
         var _loc7_:* = new param5();
         _loc7_.gotoAndStop(this.skin);
         _loc7_.scaleX = this.flip;
         if(param6)
         {
            this.boxShape = new b2PolygonShape();
            this.boxShape.SetAsBox(_loc7_.width * 0.8 * param4 / 60,_loc7_.height * 0.8 / 60);
            this.fixtureDef.shape = this.boxShape;
         }
         else
         {
            this.circleShape = new b2CircleShape(_loc7_.width * 0.8 * param4 / 60);
            this.fixtureDef.shape = this.circleShape;
         }
         if(param5 is PhysBody)
         {
            this.fixtureDef.density = 1.5;
         }
         else
         {
            this.fixtureDef.density = 1;
         }
         this.fixtureDef.friction = 0.5;
         this.fixtureDef.restitution = 0.2;
         this.fixtureDef.filter.groupIndex = -1;
         this.bodyDef.userData = _loc7_;
         this.bodyDef.userData.rotation = param3 * 360;
         this.bodyDef.userData.x = param1;
         this.bodyDef.userData.y = param2;
         this.body = this.physWorld.m_world.CreateBody(this.bodyDef);
         this.body.CreateFixture(this.fixtureDef);
         return this.body;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

