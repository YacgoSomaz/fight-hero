package
{
   public class Stats_MapParticles
   {
      
      §§push(Stats_MapParticles);
      if(37 == 34)
      {
         return;
      }
      
      private var game:Game;
      
      private var map:String;
      
      private var fc:uint;
      
      private var graphPart1:uint;
      
      private var graphPart2:uint;
      
      public function Stats_MapParticles(param1:Game, param2:String)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         this.game = param1;
         this.map = param2;
         this.fc = 0;
      }
      
      public function mapInit() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc1_:String = this.map;
         switch(_temp_1)
         {
            case 0:
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
         var _loc2_:Stats_MapParticles = this;
         var _loc3_:Number = _loc2_.fc + 1;
         _loc2_.fc = _loc3_;
         switch(this.map)
         {
            case "foundry":
               §§push(0);
               break;
            case "train":
               §§push(1);
               break;
            case "plane":
               §§push(2);
               break;
            case "swamp":
               §§push(3);
               break;
            case "dropship":
               §§push(4);
               break;
            case "cave":
               §§push(5);
               break;
            case "tut":
               §§push(6);
               break;
            default:
               §§push(7);
         }
         2;
         switch(§§pop())
         {
            case 0:
               if(Math.random() < 0.1)
               {
                  _loc1_ = 0;
                  while(_loc1_ < UT.irand(5,15))
                  {
                     this.game.createParticle(274,501,"spark",0,null,"ember");
                     _loc1_++;
                     if(2 == 3)
                     {
                        break;
                     }
                  }
               }
               if(Math.random() < 0.1)
               {
                  _loc1_ = 0;
                  while(_loc1_ < UT.irand(5,15))
                  {
                     this.game.createParticle(1140,16,"spark",30,null,"ember");
                     _loc1_++;
                     if(2 == 3)
                     {
                        break;
                     }
                  }
               }
               if(Math.random() < 0.1)
               {
                  _loc1_ = 0;
                  while(_loc1_ < UT.irand(5,15))
                  {
                     this.game.createParticle(2352,6,"spark",30,null,"ember");
                     _loc1_++;
                     if(2 == 3)
                     {
                        break;
                     }
                  }
               }
               if(this.fc % 15 == 0)
               {
                  this.game.createParticle(987,444,"waterdrop",10,null,"waterdrop");
               }
               if(this.fc % 12 == 0)
               {
                  this.game.createParticle(923,459,"waterdrop",10,null,"waterdrop");
               }
               if(this.fc % 18 == 0)
               {
                  this.game.createParticle(805,454,"waterdrop",10,null,"waterdrop");
               }
               if(this.fc % 13 == 0)
               {
                  this.game.createParticle(815,454,"waterdrop",10,null,"waterdrop");
               }
               if(this.fc % 16 == 0)
               {
                  this.game.createParticle(830,454,"waterdrop",10,null,"waterdrop");
               }
               break;
            case 1:
               this.game.createParticle(250,1760,"move",0,{
                  "xspd":-8,
                  "yspd":-1
               },"fire");
               if(Math.random() < 0.1)
               {
                  _loc1_ = 0;
                  while(_loc1_ < UT.irand(3,10))
                  {
                     this.game.createParticle(1111,1686,"spark",0,null,"ember");
                     _loc1_++;
                     if(2 == 3)
                     {
                        break;
                     }
                  }
               }
               if(Math.random() < 0.5)
               {
                  this.game.createParticle(UT.rand(350,2800),UT.rand(1100,1900),"move",0,{
                     "xspd":-50,
                     "yspd":0
                  },"wind");
               }
               break;
            case 2:
               this.game.createParticle(1385,816,"move",0,{
                  "xspd":-8,
                  "yspd":-1
               },"fire");
               this.game.createParticle(1714,520,"move",0,{
                  "xspd":-8,
                  "yspd":-1
               },"fire");
               this.game.createParticle(2482,774,"move",0,{
                  "xspd":-8,
                  "yspd":-1
               },"fire");
               if(Math.random() < 0.3)
               {
                  _loc1_ = 0;
                  while(_loc1_ < UT.irand(3,5))
                  {
                     this.game.createParticle(2403,614,"spark",0,null,"ember");
                     _loc1_++;
                     if(2 == 3)
                     {
                        break;
                     }
                  }
               }
               if(Math.random() < 0.3)
               {
                  _loc1_ = 0;
                  while(_loc1_ < UT.irand(3,5))
                  {
                     this.game.createParticle(1769,812,"spark",0,null,"ember");
                     _loc1_++;
                     if(2 == 3)
                     {
                        break;
                     }
                  }
               }
               if(Math.random() < 0.7)
               {
                  this.game.createParticle(UT.rand(128,2800),UT.rand(114,1282),"move",0,{
                     "xspd":-50,
                     "yspd":0
                  },"wind");
               }
               break;
            case 3:
               if(this.fc % 15 == 0)
               {
                  this.game.createParticle(1045,946,"waterdrop",10,null,"waterdrop");
               }
               if(this.fc % 15 == 0)
               {
                  this.game.createParticle(1844,951,"waterdrop",10,null,"waterdrop");
               }
               if(Math.random() < 0.1)
               {
                  this.game.createParticle(UT.rand(144,277),236,"leaf",0,null,"leaf","idle",UT.rand(1,3));
               }
               if(Math.random() < 0.1)
               {
                  this.game.createParticle(UT.rand(2341,2429),238,"leaf",0,null,"leaf","idle",UT.rand(1,3));
               }
               break;
            case 4:
               if(Math.random() < 0.7)
               {
                  this.game.createParticle(UT.rand(128,2800),UT.rand(114,1282),"move",0,{
                     "xspd":-50,
                     "yspd":0
                  },"wind");
               }
               break;
            case 5:
               if(this.fc % 15 == 0)
               {
                  this.game.createParticle(652,1071,"waterdrop",10,null,"waterdrop");
               }
               if(this.fc % 15 == 0)
               {
                  this.game.createParticle(2150,1073,"waterdrop",10,null,"waterdrop");
               }
               if(Math.random() < 0.1)
               {
                  this.game.createParticle(UT.rand(144,277),236,"leaf",0,null,"leaf","idle",UT.rand(1,3));
               }
               if(Math.random() < 0.1)
               {
                  this.game.createParticle(UT.rand(2341,2429),238,"leaf",0,null,"leaf","idle",UT.rand(1,3));
               }
               this.game.createParticle(1380,1100,"geiser",0,{
                  "xSpd":UT.rand(-1,1),
                  "ySpd":UT.rand(-15,-10)
               },"geiser");
               this.game.createParticle(1380,1100,"geiser",0,{
                  "xSpd":UT.rand(-1,1),
                  "ySpd":UT.rand(-15,-10)
               },"geiser");
               break;
            case 6:
               this.game.createParticle(1020,520,"move",0,{
                  "xspd":0,
                  "yspd":-2
               },"fire");
               if(Stats_Campaign.sn <= 3)
               {
                  this.game.createParticle(1035,700,"move",0,{
                     "xspd":0,
                     "yspd":-2
                  },"fire");
               }
               if(this.fc % 2 == 0)
               {
                  this.game.createParticle(405,805,"waterdrop",10,null,"waterdrop");
               }
               if(this.fc % 3 == 0)
               {
                  this.game.createParticle(815,805,"waterdrop",10,null,"waterdrop");
               }
               if(this.fc % 4 == 0)
               {
                  this.game.createParticle(686,1170,"waterdrop",10,null,"waterdrop");
               }
               if(Math.random() < 0.1)
               {
                  _loc1_ = 0;
                  while(_loc1_ < UT.irand(2,10))
                  {
                     this.game.createParticle(1050,535,"spark",0,null,"ember");
                     _loc1_++;
                     if(2 == 3)
                     {
                        break;
                     }
                  }
               }
               if(Math.random() < 0.1)
               {
                  _loc1_ = 0;
                  while(_loc1_ < UT.irand(3,8))
                  {
                     this.game.createParticle(2540,575,"spark",0,null,"ember");
                     _loc1_++;
                     if(2 == 3)
                     {
                        break;
                     }
                  }
               }
               this.game.createParticle(1370,1230,"move",0,{
                  "xspd":-1,
                  "yspd":-3
               },"fire");
               this.game.createParticle(1070,1160,"move",0,{
                  "xspd":-1,
                  "yspd":-3
               },"fire");
         }
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

