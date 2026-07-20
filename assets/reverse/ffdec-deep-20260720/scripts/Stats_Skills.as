package
{
   public class Stats_Skills
   {
      
      public static var skillOb:Object;
      
      public static var skillAr:Array;
      
      public static var classAr:Array;
      
      §§push(Stats_Skills);
      if(37 == 34)
      {
         return;
      }
      
      public var id:String;
      
      public var sprite:String;
      
      public var name:String;
      
      public var typeName:String;
      
      public var cost:int;
      
      public var lvlReq:uint;
      
      public var value:Number;
      
      public var special:String;
      
      public var desc:String;
      
      public function Stats_Skills()
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
         skillOb = {};
         skillAr = [];
         classAr = [];
         var _loc1_:uint = 0;
         while(_loc1_ < 5)
         {
            classAr.push([]);
            _loc1_++;
         }
         addSkill(0,"blur2","blur","Blur","Timed",0,1,10,"Dodge all attacks when below 30% health","When low on health, the Assassin will dodge all attacks for 3 seconds.\n\n(Can only occur once every 30 seconds)");
         addSkill(0,"shadow2","shadow","Shadow Blend","Passive",0,1,0.5,"Become invisible while crouching\nMelee attacks get +50% critical when invisible","By crouching and moving slowly, you\'re able to blend into the shadows, unable to be seen.\n\n(Attacking or being attacked will reveal you)");
         addSkill(1,"none","none","None","None",0,1,-1,"","No skill equipped.");
         addSkill(1,"combat","mastery","Combat Mastery","Passive",0,2,-1,"+3% Critical\n+3% Aim\n+10% Ammo\n+10 Hp","Being a jack of all trades, the Medic is adept at all forms of combat.");
         addSkill(1,"regen","regen","Regenerative Tissue","Passive",0,4,-1,"Immediate health regeneration","After years in the field, the Medic\'s body tissue is so used to being healed that it is now always renegerating itself automatically.");
         addSkill(1,"charisma","charisma","Charismatic","Passive",0,10,-1,"All killstreaks require 1 less kill","The Medic is a friend to all. Because of this, battle assistance comes to his aid quicker than others.");
         addSkill(1,"operation","operation","Self Revive","Timed",0,16,30,"When about to die, heal 50% health","After reaching 0 health, the Medic performs a last second operation on himself, regaining half of his health.\n\n(Can only occur once every 30 seconds)");
         addSkill(2,"none","none","None","None",0,1,-1,"","No skill equipped.");
         addSkill(2,"critical","mastery","Focus Mastery","Passive",0,2,0.05,"+5% Critical\n+5% Aim","Extreme focus allows you to hone your aim and target enemy weakpoints.");
         addSkill(2,"vital","vital","Vital Sight","Passive",0,4,0.25,"Criticals and Headshots do +25% damage","Adds a laser sight to the weapon, allowing you to pinpoint enemy weakpoints.");
         addSkill(2,"shadow","shadow","Shadow Blend","Passive",0,10,0.5,"Become invisible while crouching\nMelee attacks get +50% critical when invisible","By crouching and moving slowly, the Assassin is able to blend into the shadows, unable to be seen.\n\n(Attacking or being attacked will reveal you)");
         addSkill(2,"blur","blur","Blur","Timed",0,16,30,"Dodge all attacks when below 30% health","When low on health, the Assassin will dodge all attacks for 2 seconds.\n\n(Can only occur once every 30 seconds)");
         addSkill(3,"none","none","None","None",0,1,-1,"","No skill equipped.");
         addSkill(3,"ammo","mastery","Ammo Mastery","Passive",0,2,0.2,"+20% Ammo","All those extra pockets and slots aren\'t just for show.");
         addSkill(3,"resist","resist","Flame Resistance","Passive",0,4,0.6,"-40% explosive damage","Years of explosive training has conditioned the Commando to resist all explosives. No one knows how.");
         addSkill(3,"clip","clip","Ammo Feed","Passive",0,10,-1,"Never reload with a machine gun","Instead of clips, the Commando feeds all his ammo directly into the gun so he never needs to reload.\n\n(Machine guns only)");
         addSkill(3,"bomb","bomb","Martyrdom","Timed",0,16,30,"Explode on death","Rigging himself with explosives, the Commando will explode on death, taking out all nearby enemies with him.\n\n(Can only occur every 30 seconds)");
         addSkill(4,"none","none","None","None",0,1,-1,"","No skill equipped.");
         addSkill(4,"health","mastery","Armor Mastery","Passive",0,2,20,"+20 Hp","When it comes to bullets, the Tank can never have too much protection.");
         addSkill(4,"adren","adren","Adrenaline","Passive",0,4,3,"3x Hp regeneration","When in danger, the Tank gets a surge of Adrenaline, recovering his health extremely fast.");
         addSkill(4,"iron","iron","Full Protection","Passive",0,10,0.85,"Reduce all damage by 15% when using a shield","When using a shield, the Tank becomes one with the it, allowing the unprotected parts of his body to reduce some damage as well.\n\n(Requires Shield)");
         addSkill(4,"will","fist","Iron Will","Timed",0,16,5,"Reduce next attack by 70%","Every once in a while, the Tank can reduce the next damage he takes by 70%.\n\n(Can only occur once every 5 seconds)");
      }
      
      public static function addSkill(param1:uint, param2:String, param3:String, param4:String, param5:String, param6:int, param7:uint, param8:Number, param9:String, param10:String) : void
      {
         var _loc11_:Stats_Skills = new Stats_Skills();
         _loc11_.id = param2;
         _loc11_.sprite = param3;
         _loc11_.name = param4;
         _loc11_.typeName = param5;
         _loc11_.cost = param6;
         _loc11_.lvlReq = param7;
         _loc11_.value = param8;
         _loc11_.special = param9;
         _loc11_.desc = param10;
         _loc11_.cost = Stats_Classes.getItemCost(param7,"skill");
         skillOb[param2] = _loc11_;
         skillAr.push(_loc11_);
         classAr[param1].push(_loc11_);
      }
      
      public static function getRandSkill(param1:Object) : String
      {
         var _loc2_:String = null;
         do
         {
            _loc2_ = UT.randEl(classAr[param1.soldier]).id;
         }
         while(skillOb[_loc2_].id == "none" || Stats_Guns.gunOb[param1.primary].typeName == "Explosive" && skillOb[_loc2_].id == "clip" || Stats_Guns.gunOb[param1.primary].typeName == "Shotgun" && skillOb[_loc2_].id == "iron" || Stats_Guns.gunOb[param1.primary].typeName == "Melee" && skillOb[_loc2_].id == "vital");
         return _loc2_;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

