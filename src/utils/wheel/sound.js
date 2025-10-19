// src/utils/sound.js

class WheelFeedback {
  constructor() {
    this.audioCtx = null;
    this.buffer = null;
    this.isLoaded = false;

    this.init();
  }

  async init() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const resp = await fetch("/sounds/click.ogg");
      const buf = await resp.arrayBuffer();
      this.buffer = await this.audioCtx.decodeAudioData(buf);
      this.isLoaded = true;
    } catch (e) {
      console.warn("Audio init failed:", e);
    }
  }

  triggerFeedback() {
    // 1) Telegram встроенная вибрация, если есть
    if (window.Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
      try {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      } catch (e) {
        console.warn("Telegram HapticFeedback error:", e);
      }
    }

    // 2) Web Vibration API как запасной вариант
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }

    // 3) Звук через Web Audio
    if (this.isLoaded && this.buffer && this.audioCtx) {
      const source = this.audioCtx.createBufferSource();
      source.buffer = this.buffer;
      const gain = this.audioCtx.createGain();
      gain.gain.value = 0.3;
      source.connect(gain).connect(this.audioCtx.destination);
      source.start(0);
    } else if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume();
    }
  }
}

export const wheelFeedback = new WheelFeedback();
