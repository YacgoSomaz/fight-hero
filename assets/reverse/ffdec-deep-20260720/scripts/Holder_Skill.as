package
{
   import flash.display.MovieClip;
   import flash.text.TextField;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol763")]
   public class Holder_Skill extends MovieClip
   {
      
      §§push(Holder_Skill);
      if(37 == 34)
      {
         return;
      }
      
      public var txt_kills:TextField;
      
      public var txt_name:TextField;
      
      public var mc_skill:MovieClip;
      
      public var txt_status:TextField;
      
      public var skill:Stats_Skills;
      
      public var streak:Stats_Streaks;
      
      private var _parent:MovieClip;
      
      public function Holder_Skill(param1:* = null)
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         addFrameScript(0,this.frame1);
         if(Boolean(param1) && param1 is Stats_Skills)
         {
            this.setSkill(param1,true);
         }
         if(Boolean(param1) && param1 is Stats_Streaks)
         {
            this.setStreak(param1,true);
         }
         this._parent = MovieClip(parent);
      }
      
      public function setSkill(param1:Stats_Skills, param2:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.skill = param1;
         this.txt_name.text = this.skill.name;
         this.mc_skill.gotoAndStop(this.skill.sprite);
         this.txt_kills.text = "";
         this.streak = null;
         if(param2)
         {
            this.setStatus();
         }
         else
         {
            this.txt_status.text = "";
         }
      }
      
      public function setStreak(param1:Stats_Streaks, param2:Boolean = false) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         this.streak = param1;
         this.txt_name.text = this.streak.name;
         this.mc_skill.gotoAndStop(this.streak.sprite);
         if(this.streak.kills)
         {
            this.txt_kills.text = this.streak.kills + " kills";
         }
         else
         {
            this.txt_kills.text = "";
         }
         this.skill = null;
         if(param2)
         {
            this.setStatus();
         }
         else
         {
            this.txt_status.text = "";
         }
      }
      
      public function setStatus() : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.skill)
         {
            if(SD.classSaves[SD.selClass].skill == this.skill.id)
            {
               this.txt_status.textColor = 13421772;
               this.txt_status.text = "Equipped";
            }
            else if(SD.classSaves[SD.selClass].level < this.skill.lvlReq)
            {
               this.txt_status.textColor = 16750899;
               this.txt_status.text = "Req lvl " + this.skill.lvlReq;
            }
            else if(SD.unlocks.indexOf(this.skill.id) != -1)
            {
               this.txt_status.text = "";
            }
            else
            {
               this.txt_status.textColor = 16764006;
               this.txt_status.text = "$" + UT.addNumCommas(this.skill.cost);
            }
         }
         else if(this.streak)
         {
            if(SD.classSaves[SD.selClass].streak == this.streak.id)
            {
               this.txt_status.textColor = 13421772;
               this.txt_status.text = "Equipped";
            }
            else if(SD.classSaves[SD.selClass].level < this.streak.lvlReq)
            {
               this.txt_status.textColor = 16750899;
               this.txt_status.text = "Req lvl " + this.streak.lvlReq;
            }
            else if(SD.unlocks.indexOf(this.streak.id) != -1)
            {
               this.txt_status.text = "";
            }
            else
            {
               this.txt_status.textColor = 16764006;
               this.txt_status.text = "$" + UT.addNumCommas(this.streak.cost);
            }
         }
      }
      
      public function setText(param1:MovieClip) : void
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         if(this.skill)
         {
            this._parent.txt_special.text = this.skill.special;
            param1.txt_desc.text = this.skill.desc;
            this.txt_name.text = "";
            this._parent.txt_name.text = this.skill.name;
            this._parent.txt_type.text = "";
         }
         if(this.streak)
         {
            if(this.streak.id == "none")
            {
               this._parent.txt_special.text = "";
            }
            else
            {
               this._parent.txt_special.text = this.streak.kills + " kills\nPress E or Ctrl to activate\n";
               this._parent.txt_special.text += this.streak.special;
            }
            param1.txt_desc.text = this.streak.desc;
            this.txt_name.text = "";
            this.txt_kills.text = "";
            this._parent.txt_name.text = this.streak.name;
            this._parent.txt_type.text = "";
         }
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
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

