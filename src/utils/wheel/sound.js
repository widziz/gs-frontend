// src/utils/sound.js

class WheelAudio {
  constructor() {
    this.audio = null;
    this.isLoaded = false;
    this.isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // 🔹 Предзагрузка звука (OGG — меньше лагает)
    this.loadSound('/sounds/click.ogg');
  }

  async loadSound(src) {
    try {
      this.audio = new Audio(src);
      this.audio.preload = 'auto';
      this.audio.load();

      // Когда загрузился — отмечаем
      this.audio.addEventListener('canplaythrough', () => {
        this.isLoaded = true;
        console.log('✅ Звук предзагружен и кеширован');
      });
    } catch (error) {
      console.error('Ошибка при загрузке звука:', error);
    }
  }

  triggerFeedback() {
    // 🔹 Вибрация (на телефонах)
    if (navigator.vibrate && this.isMobile) {
      navigator.vibrate(30); // короткая вибрация ~30мс
    }

    // 🔹 Звук (на ПК и мобильных)
    if (this.audio && this.isLoaded) {
      try {
        const clickClone = this.audio.cloneNode(); // чтобы не накладывался
        clickClone.volume = 0.4;
        clickClone.play().catch(() => {});
      } catch (e) {
        console.warn('Не удалось воспроизвести звук:', e);
      }
    }
  }
}

export const wheelAudio = new WheelAudio();
