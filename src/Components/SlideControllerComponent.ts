import Component from "grimoirejs/ref/Node/Component";
import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import RenderSlideComponent from "./RenderSlideComponent";

export default class SlideControllerComponent extends Component{
  public $mount():void{
    const canvas = this.companion.get("canvasElement") as HTMLCanvasElement;
    const slideRenderer = this.node.getComponent(RenderSlideComponent);

    canvas.addEventListener("mousedown",()=>{
      slideRenderer.next();
    });
    document.addEventListener("keydown",(e)=>{
      if(e.keyCode === 39){ // 右
        slideRenderer.next();
      }
      if(e.keyCode === 37){
        slideRenderer.prev();
      }
    });
  }
}
