import Component from "grimoirejs/ref/Node/Component";
import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import CameraComponent from "grimoirejs-fundamental/ref/Components/CameraComponent";

export default class SlideComponent extends Component{
  public static attributes:{[key:string]:IAttributeDeclaration} = {
    transition:{
      default:"linear",
      converter:"String"
    },
    build:{
      default:1,
      converter:"Number"
    },
    type:{
      default:"scene",
      converter:"String"
    },
    camera:{
      default:"camera",
      converter:"String"
    }
  };

  public build:number;

  public transition:string;

  public camera:CameraComponent;

  public $awake():void{
    this.build = this.getAttribute("build");
    this.transition = this.getAttribute("transition");
    this.camera = this.node.queryChildren(this.getAttribute("camera"))[0].getComponent(CameraComponent);
  }

  public slideStart():void{

  }

  public slideEnd():void{

  }

  public buildStart(build:number):void{

  }

  public buildEnd(build:number):void{

  }
}
