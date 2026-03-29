import { createApp } from "vue";
import autofit from "autofit.js";
import App from "./App.vue";
import router from "./router";
import "./assets/design-tokens.css";

const boostrap = async () => {
  const app = createApp(App);
  app.use(router);
  app.mount("#app");

  const ScreenSize = {
    big: [2560, 1440],
    normal: [1920, 1080],
    small: [1280, 720],
  }.normal;

  autofit.init({
    el: "#app",
    dw: ScreenSize[0],
    dh: ScreenSize[1],
    resize: true,
  });
};

boostrap();
