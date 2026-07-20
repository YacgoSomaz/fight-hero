package
{
   import Playtomic.*;
   import flash.display.MovieClip;
   import flash.events.Event;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   import flash.ui.ContextMenu;
   import mochi.as3.*;
   
   public class Main extends MovieClip
   {
      
      public static var STAGE:*;
      
      public static var ARMORFIRST:Boolean;
      
      public static var SPONSORSITE:Boolean;
      
      public static var DEBUGMODE:Boolean;
      
      public static var NOPLAY:Boolean;
      
      public static var WIDTH:uint;
      
      public static var HEIGHT:uint;
      
      public static var VERSION:String;
      
      public static var NEWS:String;
      
      public static var curClass:*;
      
      §§push(Main);
      if(37 == 34)
      {
         return;
      }
      
      private var added:Boolean;
      
      private var bitHandler:BH;
      
      private var achievement:Stats_Achievements;
      
      private var mochiad:MovieClip;
      
      public function Main()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         addFrameScript(0,this.frame1,1,this.frame2,24,this.frame25);
         addEventListener(Event.ADDED_TO_STAGE,this.Init,false,0,true);
      }
      
      private function Init(param1:Event) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:ContextMenu = null;
         if(!Main.DEBUGMODE)
         {
            _loc2_ = new ContextMenu();
            _loc2_.builtInItems.forwardAndBack = false;
            _loc2_.builtInItems.loop = false;
            _loc2_.builtInItems.play = false;
            _loc2_.builtInItems.print = false;
            _loc2_.builtInItems.quality = false;
            _loc2_.builtInItems.rewind = false;
            _loc2_.builtInItems.save = false;
            _loc2_.builtInItems.zoom = false;
            contextMenu = _loc2_;
         }
         if(this.added)
         {
            return;
         }
         this.added = true;
         Main.STAGE = stage;
         Main.WIDTH = 800;
         Main.HEIGHT = 600;
         Main.VERSION = "1.1";
         stage.addEventListener(Event.ENTER_FRAME,this.EnterFrame,false,0,true);
         stage.addEventListener(MouseEvent.MOUSE_DOWN,this.MouseDown,false,0,true);
         stage.addEventListener(MouseEvent.MOUSE_UP,this.MouseUp,false,0,true);
         stage.addEventListener(KeyboardEvent.KEY_DOWN,this.KeyDown,false,0,true);
         stage.addEventListener(KeyboardEvent.KEY_UP,this.KeyUp,false,0,true);
         stage.addEventListener(Event.ACTIVATE,this.flashActivate,false,0,true);
         stage.addEventListener(Event.DEACTIVATE,this.flashDeactivate,false,0,true);
         stage.addEventListener(MouseEvent.MOUSE_WHEEL,this.MouseWheel);
         SD.Init();
         SH.Init();
         Stats_Classes.Init();
         Stats_Guns.Init();
         Stats_Maps.Init();
         Stats_Skills.Init();
         Stats_Streaks.Init();
         Stats_Misc.Init();
         MatchSettings.Init();
         Stats_Achievements.Init();
         SPONSORSITE = false;
         ARMORFIRST = true;
         this.startClass(LoaderScreen);
         Log.View(428032,"d31b7d91cc574d63","4b27af11267f4c8ea81f8eca9f203a",root.loaderInfo);
         GameVars.Load(this.GameVarsLoaded);
         this.setupMochi();
      }
      
      public function onConnectError(param1:String) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
      }
      
      private function setupMochi() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.mochiad = new MovieClip();
         addChild(this.mochiad);
         MochiAd.showPreGameAd({
            "clip":this.mochiad,
            "id":(Math.random() < 0.5 ? "06b15a04cb6f529e" : "bf382dd374236028"),
            "res":"800x600"
         });
      }
      
      private function GameVarsLoaded(param1:Object, param2:Object) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(param2.Success)
         {
            if(Boolean(param1.News) && param1.News.length > 2)
            {
               Main.NEWS = param1.News;
            }
         }
      }
      
      public function loadDone() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         gotoAndStop("start");
         this.bitHandler = new BH(this);
      }
      
      public function renderDone() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(Main.DEBUGMODE)
         {
            this.startClass(Menu);
         }
         else
         {
            this.startClass(ARMORFIRST ? Logo_Armor : Logo_NotDoppler);
         }
         this.achievement = new Stats_Achievements();
         addChild(this.achievement);
         Log.Play();
      }
      
      public function logoArmorDone() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.startClass(ARMORFIRST ? Logo_NotDoppler : Logo_Sky9Games);
      }
      
      public function logoDopplerDone() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.startClass(!ARMORFIRST ? Logo_Armor : Logo_Sky9Games);
      }
      
      public function logoSky9Done() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         Main.STAGE.quality = UT.getEl(SD.graphQual,["low","medium","high"]);
         this.startClass(Menu);
      }
      
      private function EnterFrame(param1:Event) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(Boolean(this.bitHandler) && !this.bitHandler.complete)
         {
            this.bitHandler.setup();
         }
         else
         {
            curClass.EnterFrame();
            SH.EnterFrame();
         }
      }
      
      private function MouseDown(param1:MouseEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(curClass)
         {
            curClass.MouseDown();
         }
      }
      
      private function MouseUp(param1:MouseEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(curClass)
         {
            curClass.MouseUp();
         }
      }
      
      private function KeyDown(param1:KeyboardEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(curClass)
         {
            curClass.KeyDown(param1);
         }
      }
      
      private function KeyUp(param1:KeyboardEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(curClass)
         {
            curClass.KeyUp(param1);
         }
      }
      
      private function flashActivate(param1:Event) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(curClass)
         {
            curClass.flashActivate();
         }
      }
      
      private function flashDeactivate(param1:Event) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(curClass)
         {
            curClass.flashDeactivate();
         }
      }
      
      private function MouseWheel(param1:MouseEvent) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(curClass)
         {
            curClass.MouseWheel(param1);
         }
      }
      
      public function startClass(param1:*, param2:Object = null) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(curClass)
         {
            removeChild(curClass);
            curClass = null;
         }
         trace("new class:",param1);
         curClass = new param1(this,param2 ? param2 : {});
         addChild(curClass);
         if(this.achievement)
         {
            setChildIndex(this.achievement,numChildren - 1);
         }
         if(this.mochiad)
         {
            setChildIndex(this.mochiad,numChildren - 1);
         }
         stage.focus = stage;
      }
      
      public function checkUrl(param1:Array) : Boolean
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         var _loc2_:String = loaderInfo.url;
         var _loc3_:Boolean = false;
         var _loc4_:uint = 0;
         while(_loc4_ < param1.length)
         {
            if(param1[_loc4_] == _loc2_.substring(_loc2_.indexOf(".") + 1,_loc2_.indexOf("/",7)))
            {
               _loc3_ = true;
            }
            if(param1[_loc4_] == _loc2_.substring(_loc2_.indexOf("//") + 2,_loc2_.indexOf("/",7)))
            {
               _loc3_ = true;
            }
            if(param1[_loc4_] == _loc2_.substring(0,_loc2_.indexOf("/",7)))
            {
               _loc3_ = true;
            }
            _loc4_++;
            if(2 == 3)
            {
               break;
            }
         }
         return _loc3_;
      }
      
      internal function frame1() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         stop();
      }
      
      internal function frame2() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         prevFrame();
      }
      
      internal function frame25() : *
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         stop();
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

