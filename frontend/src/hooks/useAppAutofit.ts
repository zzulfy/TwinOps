import { useEffect } from "react";
import autofit from "autofit.js";

const screenSize = { big: [2560, 1440], normal: [1920, 1080], small: [1280, 720] }
  .normal;

export default function useAppAutofit(): void {
  useEffect(() => {
    autofit.init({
      el: "#app",
      dw: screenSize[0],
      dh: screenSize[1],
      resize: true,
    });
  }, []);
}

