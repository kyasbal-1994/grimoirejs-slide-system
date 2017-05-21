import Component from "grimoirejs/ref/Node/Component";
import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import CameraComponent from "grimoirejs-fundamental/ref/Components/CameraComponent";
import MaterialComponent from "grimoirejs-fundamental/ref/Components/MaterialComponent";

export default class SlideComponent extends Component{
  public static attributes:{[key:string]:IAttributeDeclaration} = {
    transition:{
      default:"material#default.transition",
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
    },
    transitionTime:{
      default:"0.1",
      converter:"Number"
    }
  };

  public build:number;

  public transitionMaterial:MaterialComponent;

  public camera:CameraComponent;

  public transitionTime:number;

  public $awake():void{
    this.build = this.getAttribute("build");
    this.transitionTime = this.getAttribute("transitionTime");
    this.camera = this.node.queryChildren(this.getAttribute("camera"))[0].getComponent(CameraComponent);
    this.transitionMaterial = this.tree(this.getAttribute("transition")).single().getComponent(MaterialComponent);
  }

  public slideStart():void{
    this.node.emit("slide-start");
  }

  public slideEnd():void{
    this.node.emit("slide-end");
  }

  public buildStart(build:number):void{
    this.node.emit("build-start",build);
  }

  public buildEnd(build:number):void{
    this.node.emit("slide-end",build);
  }
}
