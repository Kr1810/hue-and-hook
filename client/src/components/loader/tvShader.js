/**
 * TV test-pattern shader. The bar colors are defined once here (as hex) and
 * used both to generate the GLSL and by the Canvas 2D fallback.
 */

// 75% intensity SMPTE-style bars, left → right.
export const TOP_BARS = ["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0"];
export const MID_BARS = ["#0000c0", "#101010", "#c000c0", "#101010", "#00c0c0", "#101010", "#c0c0c0"];
// Calibration strip, darkening toward the right.
export const BOTTOM_BARS = ["#3a3a3a", "#2a2a2a", "#1c1c1c"];

export const TOP_END = 0.85; // top band: 0–85% of the height
export const MID_END = 0.93; // middle strip: 85–93%, bottom strip: 93–100%

export const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

/** Pattern color at uv (x: 0 left→1 right, y: 0 top→1 bottom), as 0–1 rgb. */
export function barColor(x, y) {
  const list = y < TOP_END ? TOP_BARS : y < MID_END ? MID_BARS : BOTTOM_BARS;
  const index = Math.min(list.length - 1, Math.max(0, Math.floor(x * list.length)));
  return hexToRgb(list[index]);
}

// ---- GLSL generation -------------------------------------------------------
const vec3 = (hex) => `vec3(${hexToRgb(hex).map((v) => v.toFixed(4)).join(", ")})`;

/** GLSL ES 1.0 can't index const arrays dynamically, so emit an if-chain. */
function pickFunction(name, colors) {
  const lines = colors.map((hex, i) =>
    i < colors.length - 1
      ? `  if (x < ${((i + 1) / colors.length).toFixed(5)}) return ${vec3(hex)};`
      : `  return ${vec3(hex)};`
  );
  return `vec3 ${name}(float x) {\n${lines.join("\n")}\n}`;
}

export const VERTEX_SHADER = /* glsl */ `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = /* glsl */ `
precision mediump float;

uniform float u_time;        // seconds since the loader appeared
uniform vec2  u_resolution;  // 320x180
uniform float u_seed;        // random per transition
uniform float u_intensity;   // 0–1 noise amount; > 1 = brightness spike (EXIT)
uniform float u_reduced;     // 1 = static frame (prefers-reduced-motion)

uniform float u_static;
uniform float u_streaks;
uniform float u_jitterChance;
uniform float u_jitterAmount;
uniform float u_scanlines;
uniform float u_aberration;  // px
uniform float u_vignette;
uniform float u_flicker;
uniform float u_saturation;
uniform float u_rollPeriod;
uniform float u_fps;

${pickFunction("topBar", TOP_BARS)}

${pickFunction("midBar", MID_BARS)}

${pickFunction("bottomBar", BOTTOM_BARS)}

vec3 pattern(vec2 uv) {
  float x = clamp(uv.x, 0.0, 0.9999);
  if (uv.y < ${TOP_END.toFixed(3)}) return topBar(x);
  if (uv.y < ${MID_END.toFixed(3)}) return midBar(x);
  return bottomBar(x);
}

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423) + u_seed);
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

float hash1(float n) {
  return fract(sin(n * 12.9898 + u_seed * 78.233) * 43758.5453);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  // uv with y running top → bottom, like the pattern description.
  vec2 uv = vec2(frag.x / u_resolution.x, 1.0 - frag.y / u_resolution.y);
  float motion = 1.0 - u_reduced;

  // Analog time: stepped at 24fps.
  float frame = floor(u_time * u_fps);
  float t = frame / u_fps;

  // Line jitter: ~8% of frames shift one 2–6% slice sideways.
  if (hash1(frame + 3.1) < u_jitterChance * motion) {
    float sliceY = hash1(frame + 7.7);
    float sliceH = mix(0.02, 0.06, hash1(frame + 11.3));
    if (abs(uv.y - sliceY) < sliceH * 0.5) {
      uv.x += (hash1(frame + 5.3) * 2.0 - 1.0) * u_jitterAmount;
    }
  }

  // Chromatic aberration: red sampled +1.5px, blue -1.5px.
  float ab = u_aberration / u_resolution.x;
  vec3 col = vec3(
    pattern(vec2(uv.x + ab, uv.y)).r,
    pattern(uv).g,
    pattern(vec2(uv.x - ab, uv.y)).b
  );

  float noiseAmt = min(u_intensity, 1.0);

  // Per-pixel static, zero-mean so overall luminance is preserved.
  float n = hash(floor(frag) + frame * vec2(17.0, 31.0)) - 0.5;
  col += n * u_static * 1.6 * noiseAmt;

  // Horizontal streaks: one random offset per scanline, stretched in x.
  float row = floor(frag.y);
  float rowNoise = hash1(row * 0.731 + frame * 1.37) - 0.5;
  float smear = hash(vec2(floor(frag.x / 40.0), row + frame * 3.0)) - 0.5;
  col += (rowNoise * 0.7 + smear * 0.3) * u_streaks * noiseAmt * 2.0;

  // Rolling band: soft bright band moving bottom → top every 2.5s.
  float bandY = 1.0 - fract(u_time / u_rollPeriod);
  float d = uv.y - bandY;
  d -= floor(d + 0.5); // wrap around
  col += exp(-d * d * 90.0) * 0.12 * motion;

  // Scanlines.
  col *= 1.0 - u_scanlines * (0.5 + 0.5 * sin(frag.y * 3.14159));

  // Desaturate a touch.
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, u_saturation);

  // Flicker: ±4% global brightness.
  col *= 1.0 + (hash1(frame * 0.913 + 1.7) * 2.0 - 1.0) * u_flicker * motion;

  // CRT vignette: edges ~40% darker.
  vec2 c = uv - 0.5;
  c.x *= u_resolution.x / u_resolution.y * 0.75;
  col *= 1.0 - u_vignette * smoothstep(0.2, 0.75, length(c) * 1.15);

  // EXIT power-off spike.
  col *= 1.0 + max(u_intensity - 1.0, 0.0) * 1.6;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
