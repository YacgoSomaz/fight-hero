package
{
   import flash.media.SoundChannel;
   import flash.media.SoundTransform;
   
   public class SH
   {
      
      public static var chan:SoundChannel;
      
      public static var sound:*;
      
      public static var replayAt:Number;
      
      private static var voiceChan:SoundChannel;
      
      private static var soundChan:SoundChannel;
      
      private static var soundVolLow:SoundTransform;
      
      private static var soundVol:SoundTransform;
      
      private static var soundVolLoud:SoundTransform;
      
      private static var noVol:SoundTransform;
      
      private static var musicClass:*;
      
      private static var musicChan:SoundChannel;
      
      private static var musicVol:SoundTransform;
      
      private static var fadeClass:*;
      
      private static var fadeChan:SoundChannel;
      
      private static var fadeVol:SoundTransform;
      
      public static var songList:Array;
      
      public static var songNames:Array;
      
      private static var useLowVol:Boolean;
      
      §§push(SH);
      if(37 == 34)
      {
         return;
      }
      
      private static const maxVolume:Number = 0.8;
      
      public function SH()
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
         soundVolLow = new SoundTransform();
         soundVolLow.volume = 0.15;
         soundVol = new SoundTransform();
         soundVol.volume = 0.4;
         soundVolLoud = new SoundTransform();
         soundVolLoud.volume = 0.9;
         noVol = new SoundTransform();
         noVol.volume = 0;
         musicVol = new SoundTransform();
         musicVol.volume = maxVolume;
         fadeVol = new SoundTransform();
         fadeVol.volume = 0;
         songList = [M_Plane,M_Rocket,M_Train,M_Boss,M_Theme,M_Slow];
         songNames = ["Rose at Midnight","Rocket Race","Rose at Eclipse","Rising Sun","A Hero Emerges","Slow Victory"];
      }
      
      public static function playSound(param1:*, param2:Boolean = false) : void
      {
         if(!SD.sound)
         {
            return;
         }
         soundChan = new param1().play();
         if(useLowVol)
         {
            soundChan.soundTransform = param2 ? soundVol : soundVolLow;
         }
         else
         {
            soundChan.soundTransform = param2 ? soundVolLoud : soundVol;
         }
      }
      
      public static function playVoice(param1:*) : void
      {
         if(!SD.voices)
         {
            return;
         }
         if(voiceChan)
         {
            voiceChan.stop();
         }
         voiceChan = new param1().play();
         voiceChan.soundTransform = soundVolLoud;
      }
      
      public static function playMusic(param1:*, param2:Boolean = false) : void
      {
         if(musicClass == param1)
         {
            return;
         }
         if(musicClass)
         {
            if(fadeClass)
            {
               fadeChan.stop();
            }
            fadeVol.volume = !SD.music || param2 ? 0 : maxVolume;
            fadeClass = musicClass;
            fadeChan = musicChan;
            fadeChan.soundTransform = fadeVol;
         }
         else
         {
            param2 = true;
         }
         musicVol.volume = param2 && SD.music ? maxVolume : 0;
         musicClass = param1;
         musicChan = new musicClass().play(0,1000);
         musicChan.soundTransform = musicVol;
      }
      
      public static function EnterFrame() : void
      {
         var _loc1_:Number = NaN;
         useLowVol = false;
         if(fadeClass)
         {
            if(fadeVol.volume > 0)
            {
               fadeVol.volume -= 0.025;
               fadeChan.soundTransform = fadeVol;
            }
            else
            {
               fadeClass = null;
               fadeChan.stop();
            }
         }
         if(musicClass)
         {
            if(SD.music)
            {
               _loc1_ = maxVolume;
               if(Boolean(Main.curClass is Game && MatchSettings.isCampaign && MatchSettings.caType == 0) && Boolean(Main.curClass.hud.msgTimer) && SD.voices)
               {
                  useLowVol = true;
               }
               if(useLowVol)
               {
                  _loc1_ = 0.4;
               }
               if(musicVol.volume < _loc1_ + 0.05)
               {
                  musicVol.volume += 0.05;
               }
               if(musicVol.volume > _loc1_ - 0.025)
               {
                  musicVol.volume -= 0.025;
               }
            }
            else if(musicVol.volume > 0)
            {
               musicVol.volume -= 0.025;
            }
         }
         if(musicChan)
         {
            musicChan.soundTransform = musicVol;
         }
      }
      
      public static function updateMusicVolume() : void
      {
         if(SD.music)
         {
            fadeVol.volume = 0;
            musicVol.volume = 0;
         }
         else
         {
            fadeVol.volume = 0;
            musicVol.volume = maxVolume;
         }
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

