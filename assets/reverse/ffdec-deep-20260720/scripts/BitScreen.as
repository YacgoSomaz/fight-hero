package
{
   import flash.display.Bitmap;
   import flash.display.BitmapData;
   import flash.geom.Point;
   import flash.geom.Rectangle;
   
   public class BitScreen extends Bitmap
   {
      
      §§push(BitScreen);
      if(37 == 34)
      {
         return;
      }
      
      public var data:BitmapData;
      
      private var game:Game;
      
      public var rect:Rectangle;
      
      private var useBit:BitmapData;
      
      private var usePoint:Point;
      
      public function BitScreen(param1:Game)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.data = new BitmapData(Main.WIDTH,Main.HEIGHT,true,0);
         super(this.data);
         this.game = param1;
         this.rect = new Rectangle(0,0,this.data.width,this.data.height);
      }
      
      public function EnterFrame() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.data.fillRect(this.rect,0);
      }
      
      public function paint(param1:Number, param2:Number, param3:Boolean, param4:String, param5:String = "idle", param6:uint = 1) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.useBit = BH.getBit(param4,param5,param6);
         this.usePoint = param3 ? new Point(param1 - this.useBit.width / 2,param2 - this.useBit.height / 2) : new Point(param1,param2);
         this.data.copyPixels(this.useBit,new Rectangle(0,0,this.useBit.width,this.useBit.height),this.usePoint,null,null,true);
      }
      
      public function destroy() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.data.dispose();
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

