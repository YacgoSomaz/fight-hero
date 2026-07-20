package
{
   import flash.display.Sprite;
   import flash.text.TextField;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol1268")]
   public class NodeAiAction extends Sprite
   {
      
      §§push(NodeAiAction);
      if(37 == 34)
      {
         return;
      }
      
      public var txt_con:TextField;
      
      public var txt_action:TextField;
      
      public var con:String;
      
      public var action:String;
      
      public function NodeAiAction()
      {
         §§push(this);
         if(37 == 34)
         {
            return;
         }
         super();
         var _loc1_:Array = name.split("_");
         this.action = _loc1_[0];
         this.con = _loc1_[1];
         this.txt_con.text = this.con.toUpperCase();
         switch(this.action)
         {
            case "c":
               §§push(0);
               break;
            case "j":
               §§push(1);
               break;
            case "fp":
               §§push(2);
               break;
            case "fc":
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
               this.txt_action.text = "Crouch";
               break;
            case 1:
               this.txt_action.text = "Jump";
               break;
            case 2:
               this.txt_action.text = "Fix P";
               break;
            case 3:
               this.txt_action.text = "Fix C";
               break;
            case 4:
               this.txt_action.text = "Fix D";
         }
         visible = false;
      }
   }
}

§§push(this);
if(37 == 34)
{
   return;
}

