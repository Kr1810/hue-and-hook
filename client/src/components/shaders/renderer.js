/**
 * WebGL renderer for the background shader. Framework-free so the exact same
 * code runs in a Web Worker (OffscreenCanvas) or on the main thread.
 *
 * createRenderer(canvas, state, hooks) → controller | null
 *   state:  { width, height, dpr, colors: {a, b}, reduced, hidden, mouse: {x, y}, scroll }
 *   hooks:  { onReady(), onFail() }
 *   controller methods take one argument each, so they can be driven by
 *   postMessage({ type, value }): size, mouse, scroll, colors, reduced,
 *   hidden, destroy.
 */
import { VERTEX_SHADER } from "./vertex.glsl.js";
import { FRAGMENT_SHADER } from "./fragment.glsl.js";

export const DPR_CAP = 1.5;
const PIXEL_SIZE = 2; // each shader pixel covers 2x2 (capped) device pixels
const COLOR_LERP_MS = 600;
const STATIC_TIME = 18; // the moment we freeze on for reduced motion

const easeInOutCubic = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/**
 * Next-frame scheduler. Uses rAF when it ticks, with a timer as a safety net:
 * in a worker, rAF doesn't fire until the OffscreenCanvas has presented a
 * frame, so relying on rAF alone can stall before the first draw.
 */
function nextFrame(callback) {
  let done = false;
  const hasRaf = typeof self.requestAnimationFrame === "function";
  const run = (time) => {
    if (done) return;
    done = true;
    cancel();
    callback(typeof time === "number" ? time : performance.now());
  };
  const rafId = hasRaf ? self.requestAnimationFrame(run) : 0;
  const timerId = setTimeout(run, 34);
  function cancel() {
    if (rafId) self.cancelAnimationFrame(rafId);
    clearTimeout(timerId);
  }
  return () => {
    done = true;
    cancel();
  };
}

export function createRenderer(canvas, state, hooks) {
  let gl = null;
  try {
    gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
  } catch {
    gl = null;
  }
  if (!gl) return null;

  /* ---- compile: async when KHR_parallel_shader_compile is available ---- */
  const program = gl.createProgram();
  const shaders = [
    [gl.VERTEX_SHADER, VERTEX_SHADER],
    [gl.FRAGMENT_SHADER, FRAGMENT_SHADER],
  ].map(([type, source]) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    return shader;
  });
  gl.linkProgram(program);
  const parallel = gl.getExtension("KHR_parallel_shader_compile");

  /* ---- state ---- */
  const color = {
    a: [...state.colors.a],
    b: [...state.colors.b],
    from: null,
    to: null,
    start: -1, // -1 = not lerping
  };
  const mouse = { x: state.mouse.x, y: state.mouse.y, tx: state.mouse.x, ty: state.mouse.y };
  let scroll = state.scroll;
  let scrollTarget = state.scroll;
  let css = { width: state.width, height: state.height, dpr: state.dpr };
  let reduced = state.reduced;
  let hidden = state.hidden;
  let compiled = false;
  let dead = false;
  let ready = false;
  let uniforms = null;
  let time = 0;
  let lastFrame = 0;
  let cancelFrame = null;
  let width = 0;
  let height = 0;

  function fail() {
    if (dead) return;
    dead = true;
    stop();
    hooks.onFail();
  }

  function finishCompile() {
    if (dead) return;
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return fail();
    shaders.forEach((s) => gl.deleteShader(s));
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    uniforms = {
      time: gl.getUniformLocation(program, "u_time"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      colorA: gl.getUniformLocation(program, "u_colorA"),
      colorB: gl.getUniformLocation(program, "u_colorB"),
      scroll: gl.getUniformLocation(program, "u_scroll"),
    };
    compiled = true;
    resize();
    if (reduced) renderStatic();
    else play();
  }

  function waitForCompile() {
    if (dead) return;
    if (gl.isContextLost()) return fail();
    if (gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) finishCompile();
    else setTimeout(waitForCompile, 16);
  }

  /* ---- rendering ---- */
  function resize() {
    const w = Math.max(1, Math.round((css.width * css.dpr) / PIXEL_SIZE));
    const h = Math.max(1, Math.round((css.height * css.dpr) / PIXEL_SIZE));
    if (w === width && h === height) return false;
    width = canvas.width = w;
    height = canvas.height = h;
    gl.viewport(0, 0, w, h);
    return true;
  }

  function draw() {
    if (!compiled || dead) return;
    gl.uniform1f(uniforms.time, time);
    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform2f(uniforms.mouse, mouse.x, mouse.y);
    gl.uniform3fv(uniforms.colorA, color.a);
    gl.uniform3fv(uniforms.colorB, color.b);
    gl.uniform1f(uniforms.scroll, scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!ready) {
      ready = true;
      hooks.onReady();
    }
  }

  function stepColors(now) {
    if (color.start < 0) return;
    const k = Math.min(1, Math.max(0, (now - color.start) / COLOR_LERP_MS));
    const e = easeInOutCubic(k);
    for (let i = 0; i < 3; i++) {
      color.a[i] = color.from.a[i] + (color.to.a[i] - color.from.a[i]) * e;
      color.b[i] = color.from.b[i] + (color.to.b[i] - color.from.b[i]) * e;
    }
    if (k === 1) color.start = -1;
  }

  function frame(now) {
    cancelFrame = nextFrame(frame);
    const dt = lastFrame ? Math.min(Math.max((now - lastFrame) / 1000, 0), 0.1) : 1 / 60;
    lastFrame = now;
    time += dt;

    // Frame-rate independent easing.
    const mouseEase = 1 - Math.exp(-dt * 3);
    mouse.x += (mouse.tx - mouse.x) * mouseEase;
    mouse.y += (mouse.ty - mouse.y) * mouseEase;
    scroll += (scrollTarget - scroll) * (1 - Math.exp(-dt * 4));

    stepColors(performance.now());
    draw();
  }

  function play() {
    if (cancelFrame || !compiled || dead || reduced || hidden) return;
    lastFrame = 0;
    cancelFrame = nextFrame(frame);
  }

  function stop() {
    cancelFrame?.();
    cancelFrame = null;
  }

  function renderStatic() {
    stop();
    time = STATIC_TIME;
    if (color.start >= 0) {
      color.a = [...color.to.a];
      color.b = [...color.to.b];
      color.start = -1;
    }
    draw();
  }

  if (typeof canvas.addEventListener === "function") {
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      fail();
    });
  }

  if (parallel) setTimeout(waitForCompile, 0);
  else finishCompile();

  /* ---- controller ---- */
  return {
    size(next) {
      css = next;
      if (compiled && resize() && !cancelFrame) draw(); // resizing clears the canvas
    },
    mouse([x, y]) {
      mouse.tx = x;
      mouse.ty = y;
    },
    scroll(value) {
      scrollTarget = value;
    },
    colors(next) {
      if (reduced || !cancelFrame) {
        // Not animating (reduced motion, hidden, still compiling): jump.
        color.a = [...next.a];
        color.b = [...next.b];
        color.start = -1;
        draw();
        return;
      }
      color.from = { a: [...color.a], b: [...color.b] };
      color.to = { a: [...next.a], b: [...next.b] };
      color.start = performance.now();
    },
    reduced(value) {
      reduced = value;
      if (reduced) renderStatic();
      else play();
    },
    hidden(value) {
      hidden = value;
      if (hidden) stop();
      else play();
    },
    destroy() {
      dead = true;
      stop();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
