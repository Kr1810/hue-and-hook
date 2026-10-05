/**
 * Renders the TV static into `host` (a DOM element). Framework-free.
 *
 * - WebGL at a fixed 320×180, scaled up by CSS (image-rendering: pixelated).
 *   One context for the whole session; frames only run while started.
 * - No WebGL (or the context is lost) → Canvas 2D at 160×90 with a
 *   precomputed bar image and a noise buffer refreshed every 2 frames.
 *
 * API: start({ reduced }), stop(), setSeed(n), setIntensity(n), destroy(), mode
 */
import { VERTEX_SHADER, FRAGMENT_SHADER, barColor } from "./tvShader.js";

function createCanvas(host, width, height, className) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  if (className) canvas.className = className;
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  return canvas;
}

/* ---------------------------------------------------------------- WebGL -- */
function createGLImpl(canvas, cfg, onLost) {
  let gl = null;
  try {
    gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
  } catch {
    gl = null;
  }
  if (!gl) return null;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  gl.useProgram(program);

  // Fullscreen quad (triangle strip).
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.viewport(0, 0, canvas.width, canvas.height);

  const u = (name) => gl.getUniformLocation(program, name);
  const uniforms = {
    time: u("u_time"),
    seed: u("u_seed"),
    intensity: u("u_intensity"),
    reduced: u("u_reduced"),
  };

  // Static settings: set once.
  const n = cfg.noise;
  gl.uniform2f(u("u_resolution"), canvas.width, canvas.height);
  gl.uniform1f(u("u_static"), n.static);
  gl.uniform1f(u("u_streaks"), n.streaks);
  gl.uniform1f(u("u_jitterChance"), n.jitterChance);
  gl.uniform1f(u("u_jitterAmount"), n.jitterAmount);
  gl.uniform1f(u("u_scanlines"), n.scanlines);
  gl.uniform1f(u("u_aberration"), n.aberrationPx);
  gl.uniform1f(u("u_vignette"), n.vignette);
  gl.uniform1f(u("u_flicker"), n.flicker);
  gl.uniform1f(u("u_saturation"), n.saturation);
  gl.uniform1f(u("u_rollPeriod"), n.rollPeriod);
  gl.uniform1f(u("u_fps"), n.fps);

  const handleLost = (event) => {
    event.preventDefault();
    onLost();
  };
  canvas.addEventListener("webglcontextlost", handleLost);

  return {
    mode: "webgl",
    draw(time, seed, intensity, reduced) {
      if (gl.isContextLost()) return;
      gl.uniform1f(uniforms.time, time);
      gl.uniform1f(uniforms.seed, seed);
      gl.uniform1f(uniforms.intensity, intensity);
      gl.uniform1f(uniforms.reduced, reduced ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    destroy() {
      canvas.removeEventListener("webglcontextlost", handleLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

/* ------------------------------------------------------------ Canvas 2D -- */
function create2DImpl(canvas, cfg) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { mode: "none", draw() {}, destroy() {} };

  const { width: w, height: h } = canvas;
  const image = ctx.createImageData(w, h);
  const out = image.data;

  // Precompute the bars once.
  const base = new Float32Array(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b] = barColor((x + 0.5) / w, (y + 0.5) / h);
      const i = (y * w + x) * 3;
      base[i] = r * 255;
      base[i + 1] = g * 255;
      base[i + 2] = b * 255;
    }
  }
  // Vignette mask, also precomputed.
  const vignette = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x / w - 0.5) * (w / h) * 0.75;
      const dy = y / h - 0.5;
      const d = Math.min(1, Math.max(0, (Math.hypot(dx, dy) * 1.15 - 0.2) / 0.55));
      vignette[y * w + x] = 1 - cfg.noise.vignette * d * d * (3 - 2 * d);
    }
  }

  const noise = new Uint8Array(w * h);
  const rows = new Float32Array(h);
  let frames = 0;

  const refreshNoise = () => {
    crypto.getRandomValues(noise);
    for (let y = 0; y < h; y++) rows[y] = (Math.random() - 0.5) * 255 * cfg.noise.streaks * 2;
  };

  return {
    mode: "canvas2d",
    draw(_time, _seed, intensity, reduced) {
      if (reduced || frames++ % 2 === 0) refreshNoise(); // new noise every 2 frames
      const amount = Math.min(intensity, 1);
      const grain = cfg.noise.static * 1.6 * amount;
      const boost = 1 + Math.max(intensity - 1, 0) * 1.6;
      for (let p = 0, i = 0, o = 0; p < w * h; p++, i += 3, o += 4) {
        const y = (p / w) | 0;
        const scan = 1 - cfg.noise.scanlines * (y % 2);
        const v = (noise[p] - 128) * grain + rows[y] * amount;
        const k = vignette[p] * scan * boost;
        out[o] = (base[i] + v) * k;
        out[o + 1] = (base[i + 1] + v) * k;
        out[o + 2] = (base[i + 2] + v) * k;
        out[o + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    },
    destroy() {},
  };
}

/* ------------------------------------------------------------- Renderer -- */
export function createTVRenderer(host, cfg, { canvasClass, forceFallback = false } = {}) {
  let canvas = null;
  let impl = null;
  let frameId = 0;
  let running = false;
  let reduced = false;
  let seed = Math.random();
  let intensity = 1;
  let startTime = 0;

  const switchToFallback = () => {
    impl?.destroy();
    canvas?.remove();
    canvas = createCanvas(host, cfg.fallbackWidth, cfg.fallbackHeight, canvasClass);
    impl = create2DImpl(canvas, cfg);
  };

  if (!forceFallback) {
    canvas = createCanvas(host, cfg.width, cfg.height, canvasClass);
    impl = createGLImpl(canvas, cfg, () => {
      // Context lost mid-session: swap to a fresh canvas with the 2D fallback.
      switchToFallback();
      if (reduced) drawNow();
    });
  }
  if (!impl) switchToFallback();

  const elapsed = () => (performance.now() - startTime) / 1000;
  const drawNow = () => impl.draw(reduced ? 0 : elapsed(), seed, intensity, reduced);

  function frame() {
    frameId = requestAnimationFrame(frame);
    drawNow();
  }

  return {
    get mode() {
      return impl.mode;
    },
    start({ reduced: isReduced = false } = {}) {
      reduced = isReduced;
      if (reduced) {
        // One static frame, no loop.
        this.stop();
        drawNow();
        return;
      }
      if (running) return;
      running = true;
      startTime = performance.now();
      drawNow(); // draw immediately so the first visible frame is never blank
      frameId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frameId);
      frameId = 0;
    },
    setSeed(value) {
      seed = value;
    },
    setIntensity(value) {
      intensity = value;
      if (!running) drawNow();
    },
    destroy() {
      this.stop();
      impl?.destroy();
      canvas?.remove();
    },
  };
}
