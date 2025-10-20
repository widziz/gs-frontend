import { createSpinGenerator } from './random';
import { wheelConfig } from '../utils/wheel/config';

let spinGenerator = null;

class WheelFeedback {
  constructor() {
    this.isEnabled = true;
    this.sound = null;
    this.canVibrate = false;
    this.init();
  }

  init() {
    try {
      // Проверяем поддержку вибрации
      this.canVibrate =
        (window.Telegram?.WebApp?.HapticFeedback &&
          typeof window.Telegram.WebApp.HapticFeedback.impactOccurred === "function") ||
        "vibrate" in navigator;

      // Загружаем лёгкий OGG звук (резерв)
      this.sound = new Audio("/sounds/tick.ogg");
      this.sound.volume = 0.1;
      this.sound.preload = "auto";
      this.sound.load();
    } catch (e) {
      console.warn("Feedback init error:", e);
      this.isEnabled = false;
    }
  }

  vibrate() {
    try {
      if (
        window.Telegram?.WebApp?.HapticFeedback &&
        typeof window.Telegram.WebApp.HapticFeedback.impactOccurred === "function"
      ) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
        return true;
      }

      if (navigator.vibrate) {
        navigator.vibrate(20);
        return true;
      }

      return false;
    } catch (e) {
      console.warn("Vibration error:", e);
      return false;
    }
  }

  playSound() {
    if (!this.sound) return;
    try {
      this.sound.currentTime = 0;
      this.sound.play().catch(() => {});
    } catch (e) {}
  }

  triggerFeedback() {
    if (!this.isEnabled) return;

    const didVibrate = this.vibrate();

    if (!didVibrate) {
      // Если вибрации нет — звук
      this.playSound();
    }
  }
}

const wheelAudio = new WheelFeedback();

export function initSpinGenerator() {
  spinGenerator = createSpinGenerator(wheelConfig);
}

export function spinWheel(options = {}) {
  if (!spinGenerator) {
    throw new Error("Spin generator not initialized. Call initSpinGenerator() first.");
  }
  return spinGenerator.generate(options);
}

export const startSpinAdvanced = ({
  currentRotation = 0,
  slots = 20,
  generator = null,
  generateOptions = {},
  onGenerate,
  onUpdate,
  onComplete,
}) => {
  const resultGenerator = generator || spinGenerator;
  if (!resultGenerator) {
    throw new Error("Spin generator not initialized.");
  }

  const spinResult = resultGenerator.generate(generateOptions);
  if (onGenerate) onGenerate(spinResult);

  const slotAngle = 360 / slots;
  let animationId = null;
  let startTime = null;
  let lastClickAngle = null;
  let lastClickTime = 0;

  const startAngle = ((currentRotation % 360) + 360) % 360;
  const targetAngle = spinResult.totalRotation;
  const angleDiff = ((targetAngle - startAngle) + 360) % 360;
  const totalDistance = angleDiff + 360 * 7;

  const DURATION = 7000;
  const ACCELERATION_PHASE = 0.1;
  const MAX_SPEED_PHASE = 0;
  const DECELERATION_PHASE = 0.9;

  const CLICK_INTERVAL = 18;
  const FIRST_CLICK_OFFSET = 9;

  const combinedEase = (t) => {
    if (t < ACCELERATION_PHASE) {
      const phaseProgress = t / ACCELERATION_PHASE;
      return easeInCubic(phaseProgress) * 0.3;
    }

    if (t < ACCELERATION_PHASE + MAX_SPEED_PHASE) {
      const phaseElapsed = t - ACCELERATION_PHASE;
      return 0.3 + (phaseElapsed / MAX_SPEED_PHASE) * 0.4;
    }

    const phaseElapsed = t - (ACCELERATION_PHASE + MAX_SPEED_PHASE);
    const phaseProgress = phaseElapsed / DECELERATION_PHASE;
    return 0.7 + easeOutCubic(phaseProgress) * 0.3;
  };

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / DURATION, 1);
    const easedProgress = combinedEase(progress);

    const currentAngle = startAngle + totalDistance * easedProgress;
    const normalizedAngle = ((currentAngle % 360) + 360) % 360;
    const now = Date.now();

    const clickPosition = (normalizedAngle - FIRST_CLICK_OFFSET + 360) % 360;
    const currentClickAngle =
      Math.floor(clickPosition / CLICK_INTERVAL) * CLICK_INTERVAL + FIRST_CLICK_OFFSET;

    if (currentClickAngle !== lastClickAngle && now - lastClickTime > 50) {
      wheelAudio.triggerFeedback();
      lastClickTime = now;
      lastClickAngle = currentClickAngle;
    }

    if (onUpdate) onUpdate(normalizedAngle);

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      finishSpin(currentAngle);
    }
  };

  const finishSpin = (finalAngle) => {
    cancelAnimationFrame(animationId);
    const normalizedAngle = ((finalAngle % 360) + 360) % 360;
    const angleFromSlot0 = (normalizedAngle - 180 + 360) % 360;
    const rawWinningIndex = (10 - Math.round(angleFromSlot0 / slotAngle) + slots) % slots;
    if (onComplete) onComplete(normalizedAngle, spinResult.targetSlot, spinResult.prize);
  };

  animationId = requestAnimationFrame(animate);

  return {
    cancel: () => cancelAnimationFrame(animationId),
    result: spinResult,
  };
};

function easeInCubic(t) {
  return t * t * t;
}

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}
