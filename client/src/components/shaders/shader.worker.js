/**
 * Runs the shader renderer off the main thread. The page transfers an
 * OffscreenCanvas in an "init" message, then streams updates as
 * { type: "size" | "mouse" | "scroll" | "colors" | "reduced" | "hidden", value }.
 */
import { createRenderer } from "./renderer.js";

let renderer = null;

self.addEventListener("message", ({ data }) => {
  if (data.type === "init") {
    renderer = createRenderer(data.canvas, data.state, {
      onReady: () => self.postMessage({ type: "ready" }),
      onFail: () => self.postMessage({ type: "fail" }),
    });
    if (!renderer) self.postMessage({ type: "fail" });
    return;
  }
  if (renderer && typeof renderer[data.type] === "function") {
    renderer[data.type](data.value);
  }
});
