import { useEffect, useRef, useState } from 'react';
import { createWheel } from '../utils/wheel/createWheel';
import { wheelConfig } from '../utils/wheel/config';
import { startSpinAdvanced, initSpinGenerator } from '../logic/spinLogic';
import { createSpinGenerator } from '../logic/random';

export const Wheel = () => {
  const svgRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastSpinResult, setLastSpinResult] = useState(null);
  const cancelSpinRef = useRef(null);
  const spinGeneratorRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    createWheel(svgRef);
    
    // Инициализация с перевернутым указателем (180 градусов)
    spinGeneratorRef.current = createSpinGenerator({
      slots: wheelConfig.slots,
      prizes: wheelConfig.prizes,
      pointerPosition: 0 // Указатель теперь сверху
    });
    
    initSpinGenerator({
      slots: wheelConfig.slots,
      prizes: wheelConfig.prizes,
      pointerPosition: 0
    });
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    if (cancelSpinRef.current) {
      cancelSpinRef.current.cancel();
    }

    const spinInstance = startSpinAdvanced({
      currentRotation: rotation,
      slots: wheelConfig.slots,
      prizes: wheelConfig.prizes,
      generator: spinGeneratorRef.current,
      generateOptions: {
        antiRepeat: true,
        maxRepeats: 3,
      },
      onGenerate: (result) => {
        console.log('🎲 Сгенерирован результат:', {
          слот: result.targetSlot,
          приз: `${result.prize?.image || ''} ${result.prize?.value || 'неизвестно'}`,
          обороты: result.rotations.toFixed(1),
          id: result.id
        });
        setLastSpinResult(result);
      },
      onUpdate: (newRotation) => {
        setRotation(newRotation);
      },
      onComplete: (finalRotation, winningIndex, prize) => {
        console.log('🏆 Выигрышный приз:', `${prize?.value || 'Неизвестно'}`);
        console.log(`🎯 Реальный результат ->>> slot ${winningIndex}: ${prize?.image} ${prize?.value}`);
        
        setIsSpinning(false);
        setRotation(finalRotation);
        
        if (prize && prize.value && parseInt(prize.value) >= 100) {
          console.log('🎉 БОЛЬШОЙ ВЫИГРЫШ!');
        }
      }
    });

    cancelSpinRef.current = spinInstance;
  };

  const debugPrizes = () => {
    console.log('🔍 Призы по слотам:');
    wheelConfig.prizes.forEach((prize, index) => {
      console.log(`Слот ${index}: ${prize.image} ${prize.value}`);
    });
  };

  return (
    <div className="wheel-container">
      <div className="roulette-container">
        <svg
          ref={svgRef}
          viewBox="0 0 800 800"
          style={{ 
            width: '100%', 
            height: '100%',
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center',
            transition: 'none',
            overflow: 'visible'
          }}
        >
          <defs>
            <filter id="slot-glow" x="-200%" y="-200%" width="400%" height="400%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="25" />
            </filter>
          </defs>
          <circle cx="400" cy="400" r="400" fill="none" stroke="none" />
        </svg>
      </div>

      {/* Перевернутый поинтер (теперь сверху) */}
      <div className="pointer" style={{ 
        top: '12%', 
        bottom: 'auto',
        transform: 'translateX(-50%)'
      }}></div>

      <div className="bottom-panel">
        <button
          className="spin-button"
          onClick={handleSpin}
          disabled={isSpinning}
        >
          {isSpinning ? 'КРУТИТСЯ...' : 'КРУТИТЬ'}
        </button>
        <button
          className="debug-button"
          onClick={debugPrizes}
          style={{ marginLeft: '10px', padding: '10px', fontSize: '12px' }}
        >
          ОТЛАДКА ПРИЗОВ
        </button>
      </div>
    </div>
  );
};