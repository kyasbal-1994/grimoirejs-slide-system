import Component from "grimoirejs/ref/Node/Component";
import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import IRenderRendererMessage from "grimoirejs-fundamental/ref/Messages/IRenderRendererMessage";
import IBufferUpdatedMessage from "grimoirejs-fundamental/ref/Messages/IBufferUpdatedMessage";
import IResizeBufferMessage from "grimoirejs-fundamental/ref/Messages/IResizeBufferMessage";
import Framebuffer from "grimoirejs-fundamental/ref/Resource/FrameBuffer";
import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
import Renderbuffer from "grimoirejs-fundamental/ref/Resource/Renderbuffer";
import Geometry from "grimoirejs-fundamental/ref/Geometry/Geometry";
import GeometryRegistoryComponent from "grimoirejs-fundamental/ref/Components/GeometryRegistoryComponent";

import SlideComponent from "./SlideComponent";

export default class RenderSlideComponent extends Component {
  public static attributes: { [key: string]: IAttributeDeclaration } = {
    current: {
      default: 0,
      converter: "Number"
    }
  }

  private _currentBuffer: Framebuffer;

  private _lastBuffer: Framebuffer;

  private _renderBuffer: Renderbuffer;

  private _currentTexture: Texture2D;

  private _lastTexture: Texture2D;

  private _gl: WebGLRenderingContext;

  private _slides: SlideComponent[];

  private _transiting: boolean = false;

  private _currentFrame: number;

  private _lastTransitionTime: number;

  private _transitionStartTime: number;

  private _quad: Geometry;

  public async $mount() {
    this._gl = this.companion.get("gl") as WebGLRenderingContext;
    this._currentBuffer = new Framebuffer(this._gl);
    this._lastBuffer = new Framebuffer(this._gl);
    this._currentTexture = new Texture2D(this._gl);
    this._lastTexture = new Texture2D(this._gl);
    this._renderBuffer = new Renderbuffer(this._gl);
    this._resizeTexture(1, 1);
    this._currentBuffer.update(this._currentTexture);
    this._currentBuffer.update(this._renderBuffer);
    this._lastBuffer.update(this._lastTexture);
    this._lastBuffer.update(this._renderBuffer);
    this._slides = this.tree("goml").single().getComponentsInChildren(SlideComponent);
    this.getAttributeRaw("current").boundTo("_currentFrame");
    const frame = Number.parseInt(window.location.hash.substring(1));
    if (!isNaN(frame)) {
      this._currentFrame = frame;
    } else {
      window.location.hash = "" + this._currentFrame;
    }
    const gr = this.companion.get("GeometryRegistory") as GeometryRegistoryComponent;
    this._quad = await gr.getGeometry("quad");
  }

  public $render(args: IRenderRendererMessage): void {
    if (!this._transiting) {
      const slideInfo = this._getSlide(this._currentFrame);
      this._renderTo(args, slideInfo.slide, null);
    } else {
      const progress = (Date.now() - this._transitionStartTime) / this._lastTransitionTime;
      const slideInfo = this._getSlide(this._currentFrame);
      this._renderTo(args, slideInfo.slide, this._currentBuffer);
      const lastSlide = this._getSlide(this._currentFrame - 1);
      this._renderTo(args, lastSlide.slide, this._lastBuffer);
      this._gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER,null);
      this._gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT|WebGLRenderingContext.DEPTH_BUFFER_BIT);
      slideInfo.slide.transitionMaterial.material.draw({
        targetBuffer: "default",
        geometry: this._quad,
        attributeValues: slideInfo.slide.transitionMaterial.materialArgs,
        sceneDescription:{},
        camera: null,
        transform: null,
        buffers: args.buffers,
        viewport: args.viewport,
        technique: "default"
      } as any);
      this._gl.flush();
    }
    // this._currentBuffer.bind();
    // this._gl.clearColor(1,0,0,1);
    // this._gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT|WebGLRenderingContext.DEPTH_BUFFER_BIT);
  }

  private _renderTo(args: IRenderRendererMessage, slide: SlideComponent, fbo?: Framebuffer): void {
    if (fbo) {
      fbo.bind();
    } else {
      this._gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
    }
    this._gl.clearColor(0, 0, 0, 0);
    this._gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
    slide.camera.updateContainedScene(args.timer);
    slide.camera.renderScene({
      renderer: this as any,
      camera: slide.camera,
      buffers: args.buffers,
      layer: "default",
      viewport: args.viewport,
      timer: args.timer,
      technique: "default",
      sceneDescription: {}
    });
  }

  public $resizeBuffer(arg: IResizeBufferMessage): void {
    this._resizeTexture(arg.pow2Width, arg.pow2Height);
  }

  public async next(): Promise<void> {
    if (this._transiting) {
      return;
    }
    const lastFrame = this._currentFrame;
    let allFrame = 0;
    for (let i = 0; i < this._slides.length; i++) {
      allFrame += this._slides[i].build;
    }
    this._currentFrame = Math.min(this._currentFrame + 1, allFrame - 1);
    const currentFrameInfo = this._getSlide(this._currentFrame);
    if (currentFrameInfo.build === 0) { // wait for transition animation
      this._transiting = true;
      this._lastTransitionTime = currentFrameInfo.slide.transitionTime * 1000;
      this._transitionStartTime = Date.now();
      await this._waitFor(currentFrameInfo.slide.transitionTime * 1000);
      this._lastTransitionTime = 0;
      this._transitionStartTime = 0;
      this._transiting = false;
    }
    window.location.hash = "" + this._currentFrame;
    this._enterFrame(lastFrame, this._currentFrame);
  }

  public async prev(): Promise<void> {
    const lastFrame = this._currentFrame;
    const slideInfo = this._getSlide(this._currentFrame); // 前のスライドの最後までを計算
    this._currentFrame = Math.max(this._currentFrame - 1 - slideInfo.build, 0);

    let prevSlideInfo = this._getSlide(this._currentFrame); // さらに前のスライドの最初まで戻す
    this._currentFrame = Math.max(this._currentFrame - prevSlideInfo.build, 0);
    window.location.hash = "" + this._currentFrame;
    this._enterFrame(lastFrame, this._currentFrame);
    this._lastTransitionTime = 0;
    this._transitionStartTime = 0;
  }

  private _resizeTexture(width: number, height: number): void {
    this._lastTexture.update(0, width, height, 0, WebGLRenderingContext.RGBA, WebGLRenderingContext.UNSIGNED_BYTE);
    this._currentTexture.update(0, width, height, 0, WebGLRenderingContext.RGBA, WebGLRenderingContext.UNSIGNED_BYTE);
    this._renderBuffer.update(WebGLRenderingContext.DEPTH_COMPONENT16, width, height);
  }

  private _enterFrame(lastFrame: number, frame: number): void {
    const lastSlide = this._getSlide(lastFrame);
    const currentSlide = this._getSlide(frame);
    lastSlide.slide.buildEnd(lastSlide.build);
    if (lastSlide.slide !== currentSlide.slide) {
      lastSlide.slide.slideEnd();
      currentSlide.slide.slideStart();
    }
    currentSlide.slide.buildStart(currentSlide.build);
  }

  /**
   * Fetch slide component and build index from index.
   * @param  {number} index [description]
   * @return {[type]}       [description]
   */
  private _getSlide(index: number): { slide: SlideComponent, build: number } {
    let currentIndex = 0;
    for (let i = 0; i < this._slides.length; i++) {
      const slide = this._slides[i];
      if (currentIndex + slide.build > index) {
        return {
          slide: slide,
          build: index - currentIndex
        };
      }
      currentIndex += slide.build;
    }
  }

  private _waitFor(time: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
}
