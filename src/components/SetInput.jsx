import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { parseDecimal } from '@/utils/format';
import './SetInput.scss';

function Stepper({ label, unit, value, step, onChange, disabled, decimal }) {
  // Texto digitado enquanto o campo está em foco (permite digitar "32,5")
  const [draft, setDraft] = useState(null);
  const display = draft ?? (value === null || value === undefined ? '' : String(value).replace('.', ','));

  const change = (delta) => {
    const next = Math.max(0, Math.round(((value ?? 0) + delta) * 100) / 100);
    setDraft(null);
    onChange(next);
  };

  return (
    <div className="stepper">
      <span className="stepper__label">{label}</span>
      <div className="stepper__control">
        <button type="button" onClick={() => change(-step)} disabled={disabled} aria-label={`Diminuir ${label.toLowerCase()}`}>
          <Minus size={18} strokeWidth={2.4} />
        </button>
        <label className="stepper__input">
          <input
            type="text"
            inputMode={decimal ? 'decimal' : 'numeric'}
            value={display}
            placeholder="0"
            disabled={disabled}
            onFocus={(e) => {
              setDraft(display);
              e.target.select();
            }}
            onBlur={() => setDraft(null)}
            onChange={(e) => {
              const text = e.target.value.replace(decimal ? /[^\d,.]/g : /\D/g, '');
              setDraft(text);
              onChange(parseDecimal(text));
            }}
            aria-label={label}
          />
          <span>{unit}</span>
        </label>
        <button type="button" onClick={() => change(step)} disabled={disabled} aria-label={`Aumentar ${label.toLowerCase()}`}>
          <Plus size={18} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

/** Registro de uma série: peso, repetições e botão de concluir. */
export default function SetInput({ setNumber, weight, repetitions, completed, active, onChange, onToggle }) {
  const canComplete = weight !== null && repetitions !== null && repetitions > 0;

  return (
    <div className={`set-input ${completed ? 'is-completed' : ''} ${active ? 'is-active' : ''}`}>
      <div className="set-input__header">
        <span className="set-input__number">Série {setNumber}</span>
        {completed && (
          <span className="set-input__done">
            <Check size={14} strokeWidth={3} /> Concluída
          </span>
        )}
      </div>

      <div className="set-input__fields">
        <Stepper label="Peso" unit="kg" value={weight} step={2.5} decimal onChange={(v) => onChange({ weight: v })} />
        <Stepper label="Reps" unit="reps" value={repetitions} step={1} onChange={(v) => onChange({ repetitions: v })} />
      </div>

      <button
        type="button"
        className="set-input__toggle"
        onClick={onToggle}
        disabled={!completed && !canComplete}
        aria-pressed={completed}
      >
        <Check size={20} strokeWidth={2.6} />
        {completed ? 'Concluída · toque para editar' : 'Concluir série'}
      </button>
    </div>
  );
}
