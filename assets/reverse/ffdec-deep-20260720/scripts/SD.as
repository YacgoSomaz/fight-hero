package
{
   import Playtomic.*;
   import flash.display.MovieClip;
   import flash.net.SharedObject;
   import flash.net.URLRequest;
   import flash.net.navigateToURL;
   
   public class SD
   {
      
      public static var warnQuickmatch:Boolean;
      
      public static var warnChallenges:Boolean;
      
      public static var sound:Boolean;
      
      public static var music:Boolean;
      
      public static var voices:Boolean;
      
      public static var graphQual:uint;
      
      public static var graphPart:uint;
      
      public static var graphLights:Boolean;
      
      public static var graphGlow:Boolean;
      
      public static var screenShake:Boolean;
      
      public static var screenBlood:Boolean;
      
      public static var blood:uint;
      
      public static var selClass:uint;
      
      public static var classSaves:Array;
      
      public static var curCampaign:uint;
      
      public static var curChallenge:uint;
      
      public static var unlocks:Array;
      
      public static var achievements:Array;
      
      public static var name:String;
      
      public static var saveList:Array;
      
      §§push(SD);
      if(37 == 34)
      {
         return;
      }
      
      public function SD()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
      }
      
      public static function Init() : void
      {
         warnQuickmatch = false;
         warnChallenges = false;
         saveList = ["name","selClass","sound","music","voices","graphQual","graphLights","graphGlow","graphPart","screenShake","screenBlood","blood","curCampaign","curChallenge","classSaves","unlocks","achievements"];
         name = "Player";
         selClass = 1;
         sound = true;
         music = true;
         voices = true;
         graphQual = 1;
         graphLights = true;
         graphGlow = true;
         graphPart = 2;
         screenShake = true;
         screenBlood = false;
         blood = 0;
         curCampaign = 1;
         curChallenge = 1;
         classSaves = [0];
         classSaves.push({
            "skin":1,
            "primary":"M4",
            "secondary":"USP",
            "skill":"none",
            "streak":"none",
            "level":1,
            "exp":0,
            "funds":0
         });
         classSaves.push({
            "skin":1,
            "primary":"Scout",
            "secondary":"USP",
            "skill":"none",
            "streak":"none",
            "level":1,
            "exp":0,
            "funds":0
         });
         classSaves.push({
            "skin":1,
            "primary":"Saw",
            "secondary":"USP",
            "skill":"none",
            "streak":"none",
            "level":1,
            "exp":0,
            "funds":0
         });
         classSaves.push({
            "skin":1,
            "primary":"M3",
            "secondary":"USP",
            "skill":"none",
            "streak":"none",
            "level":1,
            "exp":0,
            "funds":0
         });
         unlocks = [];
         unlocks.push("M4","Scout","Saw","M3");
         unlocks.push("USP");
         unlocks.push("none");
         achievements = [];
         if(checkSave())
         {
            loadGame();
         }
      }
      
      public static function eraseGame() : void
      {
         var _loc1_:SharedObject = SharedObject.getLocal("SFH_SFFJJRrj4qrjq");
         _loc1_.data.savedBefore = false;
         _loc1_.close();
      }
      
      public static function checkSave() : Boolean
      {
         var _loc1_:Boolean = false;
         var _loc2_:SharedObject = SharedObject.getLocal("SFH_SFFJJRrj4qrjq");
         _loc1_ = !!_loc2_.data.savedBefore;
         _loc2_.close();
         return _loc1_;
      }
      
      public static function saveGame() : void
      {
         trace("saving game");
         var _loc1_:SharedObject = SharedObject.getLocal("SFH_SFFJJRrj4qrjq");
         var _loc2_:uint = 0;
         while(_loc2_ < saveList.length)
         {
            _loc1_.data[saveList[_loc2_]] = SD[saveList[_loc2_]];
            _loc2_++;
         }
         _loc1_.data.savedBefore = true;
         _loc1_.flush();
         _loc1_.close();
      }
      
      public static function loadGame() : void
      {
         trace("saving game");
         var _loc1_:SharedObject = SharedObject.getLocal("SFH_SFFJJRrj4qrjq");
         var _loc2_:uint = 0;
         while(_loc2_ < saveList.length)
         {
            SD[saveList[_loc2_]] = _loc1_.data[saveList[_loc2_]];
            _loc2_++;
         }
         _loc1_.flush();
         _loc1_.close();
         trace("[SD]","Unlocks",unlocks);
      }
      
      public static function setLogos(param1:MovieClip, param2:MovieClip) : void
      {
         param1.gotoAndStop(Main.ARMORFIRST ? 1 : 2);
         param2.gotoAndStop(Main.ARMORFIRST ? 2 : 1);
      }
      
      public static function pressLogos(param1:*, param2:MovieClip, param3:MovieClip) : void
      {
         if(param2.hitTestPoint(param1.mouseX,param1.mouseY,false))
         {
            if(Main.ARMORFIRST)
            {
               urlArmor();
            }
            else
            {
               urlNotDoppler();
            }
         }
         if(param3.hitTestPoint(param1.mouseX,param1.mouseY,false))
         {
            if(!Main.ARMORFIRST)
            {
               urlArmor();
            }
            else
            {
               urlNotDoppler();
            }
         }
      }
      
      public static function urlSky9Games(param1:Boolean = false) : void
      {
         Log.CustomMetric("Clicked Sky9Games" + (param1 ? " Intro" : ""),"Link");
         navigateToURL(new URLRequest("http://www.sky9games.com"),"_blank");
      }
      
      public static function urlArmor(param1:Boolean = false) : void
      {
         Log.CustomMetric("Clicked ArmorGames" + (param1 ? " Intro" : ""),"Link");
         navigateToURL(new URLRequest("http://armor.ag/MoreGames"),"_blank");
      }
      
      public static function urlNotDoppler(param1:Boolean = false) : void
      {
         Log.CustomMetric("Clicked NotDoppler" + (param1 ? " Intro" : ""),"Link");
         navigateToURL(new URLRequest("http://www.notdoppler.com/?ref=strikeforceheroes"),"_blank");
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

