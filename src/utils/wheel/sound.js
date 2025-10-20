export const wheelAudio = {
  triggerFeedback() {
    try {
      // ✅ Telegram WebApp haptic feedback
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

      // ✅ Браузерная вибрация (fallback)
      if (navigator.vibrate) {
        navigator.vibrate(30);
        console.log("✅ Browser vibration triggered");
        return;
      }

      console.warn("⚠️ Вибрация недоступна на этом устройстве.");
    } catch (err) {
      console.error("Ошибка при вибрации:", err);
    }
  }
};
