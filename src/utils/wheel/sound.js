// src/utils/sound.js
export const wheelAudio = {
  /**
   * Универсальная вибрация для Telegram WebApp и браузера
   */
  triggerFeedback() {
    try {
      // ✅ 1. Telegram встроенная вибрация
      if (
        window.Telegram &&
        window.Telegram.WebApp &&
        window.Telegram.WebApp.HapticFeedback &&
        typeof window.Telegram.WebApp.HapticFeedback.impactOccurred === "function"
      ) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
        console.log("✅ Telegram haptic feedback triggered");
        return;
      }

      // ✅ 2. Фолбэк: стандартная вибрация браузера
      if (navigator.vibrate) {
        navigator.vibrate(30);
        console.log("✅ Browser vibration triggered");
        return;
      }

      console.warn("⚠️ Вибрация недоступна на этом устройстве.");
    } catch (err) {
      console.error("Ошибка при попытке вызвать вибрацию:", err);
    }
  }
};
