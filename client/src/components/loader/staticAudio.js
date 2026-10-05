/**
 * Optional TV hiss, generated with the Web Audio API (white noise →
 * bandpass → gain). No audio files. Off by default and never autoplays: it
 * only starts after the visitor turns it on, and browsers keep the context
 * suspended until a user gesture anyway.
 */
import { LOADER } from "../../config/loader.js";

let ctx = null;
let source = null;
let gain = null;

export function readStaticEnabled() {
  try {
    return localStorage.getItem(LOADER.audioStorageKey) === "on";
  } catch {
    return false;
  }
}

export function saveStaticEnabled(on) {
  try {
    localStorage.setItem(LOADER.audioStorageKey, on ? "on" : "off");
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
}

export function startStatic() {
  if (source) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx ??= new AudioCtx();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const seconds = 2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = LOADER.audio.bandpassHz;
    filter.Q.value = LOADER.audio.q;

    gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(LOADER.audio.gain, ctx.currentTime + 0.03);

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  } catch {
    source = null;
  }
}

export function stopStatic() {
  if (!source || !ctx) return;
  const node = source;
  source = null;
  try {
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.06);
    node.stop(ctx.currentTime + 0.07);
  } catch {
    /* already stopped */
  }
}
