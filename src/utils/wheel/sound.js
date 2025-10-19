// src/utils/sound.js

class WheelAudio {
  constructor() {
    this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
    this.audioCtx = null;
    this.buffer = null;
    this.isReady = false;

    this.init();
  }

  async init() {
    try {
      // создаём аудио контекст (лениво)
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // загружаем и декодируем звук
      const response = await fetch("/sounds/click.ogg");
      const arrayBuffer = await response.arrayBuffer();
      this.buffer = await this.audioCtx.decodeAudioData(arrayBuffer);
      this.isReady = true;

      console.log("✅ Web Audio звук загружен в память");
    } catch (err) {
      console.error("Ошибка при инициализации звука:", err);
    }
  }

  triggerFeedback() {
    // 🔹 Вибрация (только если доступна)
    if (navigator.vibrate && this.isMobile) {
      navigator.vibrate(25);
    }

    // 🔹 Звук (если доступен)
    if (this.isReady && this.audioCtx.state === "running") {
      const source = this.audioCtx.createBufferSource();
      source.buffer = this.buffer;

      const gainNode = this.audioCtx.createGain();
      gainNode.gain.value = 0.3; // громкость

      source.connect(gainNode).connect(this.audioCtx.destination);
      source.start(0);
    } else if (this.audioCtx?.state === "suspended") {
      // браузеры при старте ставят в "suspended" — активируем по первому клику
      this.audioCtx.resume();
    }
  }
}

export const wheelAudio = new WheelAudio();
