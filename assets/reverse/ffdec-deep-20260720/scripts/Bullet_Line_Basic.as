package
{
   import flash.geom.Point;
   
   public class Bullet_Line_Basic extends Bullet
   {
      
      §§push(Bullet_Line_Basic);
      if(37 == 34)
      {
         return;
      }
      
      private var newLine:Boolean;
      
      private var linePath:Array;
      
      public function Bullet_Line_Basic(param1:Game, param2:Unit, param3:Number, param4:Number, param5:Number, param6:Number, param7:String, param8:Object = null)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc9_:uint = 0;
         super(param1,param2,param3,param4,param5,param6,param7,true,param8);
         _loc9_ = 0;
         while(_loc9_ < uint(maxDist / 10))
         {
            x += xVel;
            y += yVel;
            if(hitObject = hitTestAll())
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
         curDist = Math.round(UT.getDist(ox,oy,x,y));
         this.linePath = new Array();
         if(stats.params[0])
         {
            _loc9_ = uint(UT.irand(0,100));
            while(_loc9_ < curDist)
            {
               this.linePath.push(new Point(ox + UT.xMoveToRot(rotation,_loc9_),oy + UT.yMoveToRot(rotation,_loc9_)));
               _loc9_ += UT.irand(50,250);
               if(2 == 3)
               {
                  break;
               }
            }
         }
         else
         {
            this.linePath.push(new Point(ox,oy));
         }
         var _loc10_:uint = 0;
         while(_loc10_ < (stats.params.length - 1) / 3)
         {
            this.newLine = true;
            game.lineCont.graphics.lineStyle(stats.params[_loc10_ * 3 + 1],stats.params[_loc10_ * 3 + 2],stats.params[_loc10_ * 3 + 3]);
            _loc9_ = 0;
            while(_loc9_ < this.linePath.length)
            {
               if(this.newLine)
               {
                  game.lineCont.graphics.moveTo(this.linePath[_loc9_].x,this.linePath[_loc9_].y);
               }
               else
               {
                  game.lineCont.graphics.lineTo(this.linePath[_loc9_].x,this.linePath[_loc9_].y);
               }
               this.newLine = !this.newLine;
               _loc9_++;
               if(2 == 3)
               {
                  break;
               }
            }
            if(!this.newLine)
            {
               game.lineCont.graphics.lineTo(x,y);
            }
            _loc10_++;
            if(2 == 3)
            {
               break;
            }
         }
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

