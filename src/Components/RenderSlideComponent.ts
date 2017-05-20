import Component from "grimoirejs/ref/Node/Component";
import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import IRenderRendererMessage from "grimoirejs-fundamental/ref/Messages/IRenderRendererMessage";
import IBufferUpdatedMessage from "grimoirejs-fundamental/ref/Messages/IBufferUpdatedMessage";
import IResizeBufferMessage from "grimoirejs-fundamental/ref/Messages/IResizeBufferMessage";
import Framebuffer from "grimoirejs-fundamental/ref/Resource/FrameBuffer";
import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
import Renderbuffer from "grimoirejs-fundamental/ref/Resource/Renderbuffer";
import SlideComponent from "./SlideComponent";

export default class RenderSlideComponent extends Component{
  public static attributes:{[key:string]:IAttributeDeclaration} = {
    current:{
      default:0,
      converter:"Number"
    }
  }

  private _currentBuffer:Framebuffer;

  private _nextBuffer:Framebuffer;

  private _renderBuffer:Renderbuffer;

  private _currentTexture:Texture2D;

  private _nextTexture:Texture2D;

  private _gl:WebGLRenderingContext;

  private _slides: SlideComponent[];

  private _transiting:boolean = false;

  private _currentFrame:number;

  public $mount(){
    this._gl = this.companion.get("gl") as WebGLRenderingContext;
    this._currentBuffer = new Framebuffer(this._gl);
    this._nextBuffer = new Framebuffer(this._gl);
    this._currentTexture = new Texture2D(this._gl);
    this._nextTexture = new Texture2D(this._gl);
    this._renderBuffer = new Renderbuffer(this._gl);
    this._resizeTexture(1,1);
    this._currentBuffer.update(this._currentTexture);
    this._currentBuffer.update(this._renderBuffer);
    this._nextBuffer.update(this._nextTexture);
    this._nextBuffer.update(this._renderBuffer);
    this._slides = this.tree("goml").single().getComponentsInChildren(SlideComponent);
    this.getAttributeRaw("current").boundTo("_currentFrame");
    const frame = Number.parseInt(window.location.hash.substring(1));
    if(!isNaN(frame)){
      this._currentFrame = frame;
    }else{
      window.location.hash = "" + this._currentFrame;
    }
  }

  public $render(args: IRenderRendererMessage):void{
    if(!this._transiting){
      const slideInfo = this._getSlide(this._currentFrame);
      slideInfo.slide.camera.updateContainedScene(args.timer);
      slideInfo.slide.camera.renderScene({
      renderer:this as any,
      camera: slideInfo.slide.camera,
      buffers: args.buffers,
      layer: "default",
      viewport: args.viewport,
      timer: args.timer,
      technique: "default",
      sceneDescription: {}
    });
    }
    // this._currentBuffer.bind();
    // this._gl.clearColor(1,0,0,1);
    // this._gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT|WebGLRenderingContext.DEPTH_BUFFER_BIT);
  }

  public $resizeBuffer(arg: IResizeBufferMessage): void {
    this._resizeTexture(arg.pow2Width,arg.pow2Height);
  }

  public next():void{
    let allFrame = 0;
    for(let i = 0; i < this._slides.length; i++){
      allFrame+= this._slides[i].build;
    }
    this._currentFrame = Math.min(this._currentFrame + 1,allFrame - 1);
    window.location.hash = "" + this._currentFrame;
  }

  public prev():void{
    this._currentFrame = Math.max(this._currentFrame + 1,0);
  }

  private _resizeTexture(width:number, height:number):void{
    this._nextTexture.update(0,width,height,0,WebGLRenderingContext.RGBA,WebGLRenderingContext.UNSIGNED_BYTE);
    this._currentTexture.update(0,width,height,0,WebGLRenderingContext.RGBA,WebGLRenderingContext.UNSIGNED_BYTE);
    this._renderBuffer.update(WebGLRenderingContext.DEPTH_COMPONENT16,width,height);
  }

  /**
   * Fetch slide component and build index from index.
   * @param  {number} index [description]
   * @return {[type]}       [description]
   */
  private _getSlide(index:number):{slide:SlideComponent,build:number}{
    let currentIndex = 0;
    for(let i = 0; i < this._slides.length; i++){
      const slide = this._slides[i];
      if(currentIndex + slide.build > index){
        return {
          slide:slide,
          build:index - currentIndex
        };
      }
      currentIndex += slide.build;
    }
  }
}
