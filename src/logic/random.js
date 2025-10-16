// random.js
export const Random = {
  between: (min, max) => Math.random() * (max - min) + min,
  int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

  weightedIndex: (weights) => {
    const total = weights.reduce((sum, w) => sum + w, 0);
    const r = Math.random() * total;
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (r < cumulative) return i;
    }
    return weights.length - 1;
  }
};

class SpinResultGenerator {
  constructor(config) {
    this.slots = config.slots || 20;
    this.prizes = config.prizes || [];
    this.slotAngle = 360 / this.slots;
    this.visualZeroSlot = 10; // слот 10 = 0°
    this.randomOffset = config.randomOffset || 8; // ±5° случайное отклонение
  }

  generate({ guaranteed } = {}) {
    let targetSlot;

    if (guaranteed !== undefined) {
      targetSlot = guaranteed;
    } else {
      const weights = this.prizes.map(p => typeof p.chance === 'number' ? p.chance : 0);
      targetSlot = Random.weightedIndex(weights);
    }

    const fullRotations = Random.int(6, 8); // целые обороты
    const angleToSlot = ((this.visualZeroSlot - targetSlot + this.slots) % this.slots) * this.slotAngle;
    
    // Добавляем случайное отклонение (±randomOffset градусов)
    const randomDeviation = Random.between(-this.randomOffset, this.randomOffset);
    const totalRotation = fullRotations * 360 + angleToSlot + randomDeviation;

    return {
      id: `spin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      targetSlot,
      rotations: fullRotations,
      offsetAngle: angleToSlot,
      totalRotation,
      prize: this.prizes[targetSlot],
      slotAngle: this.slotAngle,
      randomDeviation // сохраняем величину отклонения для отладки
    };
  }
}

export const createSpinGenerator = (config) => new SpinResultGenerator(config);