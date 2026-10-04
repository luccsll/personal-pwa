import { useEffect, useRef, useState } from 'react';
import { Timer } from 'lucide-react';
import { formatRest } from '@/utils/workout';
import './RestTimer.scss';

const remainingSeconds = (endsAt) => Math.max(0, Math.ceil((new Date(endsAt) - Date.now()) / 1000));

/**
 * Cronômetro de descanso exibido após concluir uma série.
 * Calcula o tempo a partir do horário de término, então continua certo
 * mesmo se a tela bloquear ou o app for fechado e reaberto.
 */
export default function RestTimer({ timer, onAdjust, onSkip }) {
  const [remaining, setRemaining] = useState(() => remainingSeconds(timer.endsAt));
  const alerted = useRef(false);
  const onSkipRef = useRef(onSkip);
  onSkipRef.current = onSkip;

  useEffect(() => {
    alerted.current = remainingSeconds(timer.endsAt) === 0;
    const tick = () => setRemaining(remainingSeconds(timer.endsAt));
    tick();
    const id = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [timer.endsAt]);

  const finished = remaining === 0;

  useEffect(() => {
    if (!finished || alerted.current) return undefined;
    alerted.current = true;
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      /* sem suporte */
    }
    // Fecha sozinho alguns segundos depois de avisar
    const id = setTimeout(() => onSkipRef.current(), 4000);
    return () => clearTimeout(id);
  }, [finished]);

  const progress = timer.duration > 0 ? Math.min(1, remaining / timer.duration) : 0;

  return (
    <div className={`rest-timer ${finished ? 'is-finished' : ''}`} role="timer" aria-live="polite">
      <div className="rest-timer__bar" style={{ transform: `scaleX(${progress})` }} />
      <div className="rest-timer__info">
        <span className="rest-timer__label">
          <Timer size={14} /> {finished ? 'Descanso concluído' : 'Descanso'}
        </span>
        <strong className="rest-timer__time">{finished ? 'Bora!' : formatRest(remaining)}</strong>
      </div>
      <div className="rest-timer__actions">
        {!finished && (
          <>
            <button type="button" onClick={() => onAdjust(-15)} aria-label="Diminuir 15 segundos">
              −15s
            </button>
            <button type="button" onClick={() => onAdjust(30)} aria-label="Aumentar 30 segundos">
              +30s
            </button>
          </>
        )}
        <button type="button" className="rest-timer__skip" onClick={onSkip}>
          {finished ? 'Fechar' : 'Pular'}
        </button>
      </div>
    </div>
  );
}
