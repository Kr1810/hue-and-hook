/**
 * Domain-warped fbm noise → soft liquid blobs, tinted by two theme colors,
 * with film grain and an ordered dither for a retro-digital finish.
 */
export const FRAGMENT_SHADER = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;   // 0–1, origin bottom-left, eased in JS
uniform vec3  u_colorA;  // theme --bg
uniform vec3  u_colorB;  // theme --accent
uniform float u_scroll;  // page scroll in viewport heights (eased)

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// Value noise with smooth interpolation.
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 ROTATE = mat2(0.80, 0.60, -0.60, 0.80);

// Fractal Brownian motion: 5 octaves, rotated each step to hide grid artefacts.
float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * noise(p);
    p = ROTATE * p * 2.03 + vec2(1.7, 9.2);
    amp *= 0.5;
  }
  return value;
}

// 4x4 ordered (Bayer) dither, branch-free for GLSL ES 1.0.
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 mouse = vec2(u_mouse.x * aspect, u_mouse.y);

  // Gentle gravity: space near the cursor is pulled toward it.
  vec2 toMouse = mouse - p;
  float pull = exp(-dot(toMouse, toMouse) * 5.0);
  p += toMouse * pull * 0.28;

  float t = u_time * 0.045;
  p = p * 1.35 + vec2(0.0, u_scroll * 0.4);

  // Two rounds of domain warping.
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
  vec2 r = vec2(
    fbm(p + 3.2 * q + vec2(1.7, 9.2) + t * 1.2),
    fbm(p + 3.2 * q + vec2(8.3, 2.8) - t)
  );
  float n = fbm(p + 2.8 * r);

  // Base: shadowed and lifted versions of the theme background.
  vec3 deep = u_colorA * 0.6;
  vec3 lift = mix(u_colorA, vec3(1.0), 0.14);
  vec3 col = mix(deep, u_colorA, smoothstep(0.2, 0.5, n));
  col = mix(col, lift, smoothstep(0.5, 0.66, n) * 0.55);

  // Liquid accent blobs with a soft halo.
  // Raise these thresholds for fewer/smaller blobs, lower them for more.
  float field = n + 0.1 * (length(q) - 0.7);
  float blob = smoothstep(0.645, 0.675, field);
  float halo = smoothstep(0.59, 0.645, field) * (1.0 - blob);
  col = mix(col, u_colorB, blob * 0.94 + halo * 0.22);

  // Soft vignette keeps the edges calm.
  col *= 1.0 - 0.22 * smoothstep(0.35, 0.95, length(uv - vec2(0.5)));

  // Animated film grain + ordered-dither quantisation.
  float grain = hash(frag + fract(u_time * 7.0) * 61.0) - 0.5;
  col += grain * 0.05;
  const float LEVELS = 28.0;
  col = floor(col * LEVELS + bayer4(frag)) / LEVELS;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
