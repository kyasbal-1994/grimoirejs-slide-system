import gr from "grimoirejs";
import RenderSlideComponent from "./Components/RenderSlideComponent";
import SlideComponent from "./Components/SlideComponent";
import SlideControllerComponent from "./Components/SlideControllerComponent";

export default ()=>{
  gr.register(async ()=>{
    gr.registerComponent("RenderSlide",RenderSlideComponent);
    gr.registerComponent("Slide",SlideComponent);
    gr.registerComponent("SlideController",SlideControllerComponent);

    gr.registerNode("render-slide",["RenderSlide"]);
    gr.registerNode("scene-slide",["Slide"],{},"scene");
  });
};
