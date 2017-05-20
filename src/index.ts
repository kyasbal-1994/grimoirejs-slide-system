  import ComponentsRenderSlideComponent from "./Components/RenderSlideComponent";
  import ComponentsSlideComponent from "./Components/SlideComponent";
  import ComponentsSlideControllerComponent from "./Components/SlideControllerComponent";

var __VERSION__ = "1.0.0";
var __NAME__ = "grimoirejs-slide-system";

import __MAIN__ from "./main";

var __EXPOSE__ = {
  "Components": {
    "RenderSlideComponent": ComponentsRenderSlideComponent,
    "SlideComponent": ComponentsSlideComponent,
    "SlideControllerComponent": ComponentsSlideControllerComponent
  }
};

let __BASE__ = __MAIN__();

Object.assign(__EXPOSE__,{
    __VERSION__:__VERSION__,
    __NAME__:__NAME__
});
Object.assign(__BASE__|| {},__EXPOSE__);

window["GrimoireJS"].lib.slide_system = __EXPOSE__;

export default __BASE__;
