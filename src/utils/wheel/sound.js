export class WheelSound {
  constructor() {
    this.audioContext = null;
    this.bufferPool = [];
    this.isEnabled = true;
    this.isMobile = window.innerWidth <= 768;
    this.MAX_POOL_SIZE = 5;
    this.init();
  }

  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await this.preloadSounds();
      
      // Разогрев аудио-контекста (решает проблему с первым кликом на iOS/Safari)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        const dummySource = this.audioContext.createBufferSource();
        dummySource.buffer = this.audioContext.createBuffer(1, 1, 22050);
        dummySource.connect(this.audioContext.destination);
        dummySource.start(0);
        dummySource.stop(this.audioContext.currentTime + 0.01);
      }
    } catch (e) {
      console.warn("Audio init error:", e);
      this.isEnabled = false;
    }
  }

  async preloadSounds() {
    try {
      const response = await fetch('/sounds/tick.mp3');
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Создаем пул предварительно декодированных буферов
      for (let i = 0; i < this.MAX_POOL_SIZE; i++) {
        this.bufferPool.push(audioBuffer);
      }
    } catch (e) {
      console.warn("Sound preload error:", e);
      this.isEnabled = false;
    }
  }

  playClick() {
    if (!this.isEnabled || this.bufferPool.length === 0) return;
    
    try {
      // Берем буфер из пула
      const buffer = this.bufferPool.pop();
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.2;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);
      
      // Возвращаем буфер в пул после использования
      source.onended = () => {
        source.disconnect();
        gainNode.disconnect();
        this.bufferPool.push(buffer);
      };
    } catch (e) {
      console.warn("Sound play error:", e);
      if (this.bufferPool.length < 1) {
        this.isEnabled = false;
      }
    }
  }

  vibrate() {
    if (!this.isEnabled || !this.isMobile) return;
    
    // Оптимизация для устройств Apple (которые часто игнорируют короткие вибрации)
    const vibrationDuration = navigator.vibrate ? 10 : 0;
    if (vibrationDuration > 0) {
      try {
        navigator.vibrate(vibrationDuration);
      } catch (e) {
        console.warn("Vibration error:", e);
      }
    }
  }

  triggerFeedback() {
    if (!this.isEnabled) return;
    
    // Разносим по времени звук и вибрацию
    this.playClick();
    
    // Для Android добавляем вибрацию с небольшим отставанием
    if (this.isMobile && !navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      requestAnimationFrame(() => {
        this.vibrate();
      });
    }
  }
}

export const wheelSound = new WheelSound();