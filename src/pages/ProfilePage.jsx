import { useState } from 'react';
import { Check, Save } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { useBodyWeightStats } from '@/hooks/useDerivedData';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import { GOALS } from '@/data/initialData';
import { toDateKey } from '@/utils/date';
import { formatNumber, parseDecimal } from '@/utils/format';
import { bmiCategory, calculateBmi } from '@/utils/stats';
import './ProfilePage.scss';

const toInput = (n) => (n === null || n === undefined ? '' : String(n).replace('.', ','));

export default function ProfilePage() {
  const { profile, updateProfile, addBodyWeight } = useAppData();
  const weightStats = useBodyWeightStats();
  const currentWeight = weightStats?.current.weight ?? null;

  const [form, setForm] = useState(() => ({
    name: profile.name ?? '',
    height: toInput(profile.height),
    weight: toInput(currentWeight),
    goal: profile.goal,
  }));
  const [saved, setSaved] = useState(false);

  const set = (field) => (e) => {
    setSaved(false);
    setForm((f) => ({ ...f, [field]: e?.target ? e.target.value : e }));
  };

  const height = parseDecimal(form.height);
  const weight = parseDecimal(form.weight);
  const bmi = calculateBmi(weight, height);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({ name: form.name.trim(), height: height && height > 50 ? height : null, goal: form.goal });
    // Peso alterado aqui vira um novo registro de peso corporal
    if (weight && weight !== currentWeight) addBodyWeight({ weight, date: toDateKey() });
    setSaved(true);
  };

  return (
    <div className="page--narrow profile">
      <PageHeader back title="Meus dados" />

      <form className="profile__form" onSubmit={handleSubmit}>
        <div className="card stack">
          <label className="field">
            <span>Nome</span>
            <input className="input" value={form.name} onChange={set('name')} autoComplete="given-name" />
          </label>
          <div className="grid-2">
            <label className="field">
              <span>Altura (cm)</span>
              <input
                className="input"
                inputMode="decimal"
                placeholder="Ex.: 178"
                value={form.height}
                onChange={(e) => set('height')(e.target.value.replace(/[^\d,.]/g, ''))}
              />
            </label>
            <label className="field">
              <span>Peso (kg)</span>
              <input
                className="input"
                inputMode="decimal"
                placeholder="Ex.: 80,5"
                value={form.weight}
                onChange={(e) => set('weight')(e.target.value.replace(/[^\d,.]/g, ''))}
              />
            </label>
          </div>
        </div>

        <div className="card stack">
          <span className="profile__label">Objetivo</span>
          <div className="profile__goals">
            {GOALS.map((goal) => (
              <button
                type="button"
                key={goal}
                className={`profile__goal ${form.goal === goal ? 'is-selected' : ''}`}
                aria-pressed={form.goal === goal}
                onClick={() => set('goal')(goal)}
              >
                {form.goal === goal && <Check size={16} strokeWidth={2.6} />}
                {goal}
              </button>
            ))}
          </div>
        </div>

        <div className="card profile__bmi">
          <span className="profile__label">IMC</span>
          {bmi ? (
            <p>
              <strong>{formatNumber(Math.round(bmi * 10) / 10)}</strong> <span>{bmiCategory(bmi)}</span>
            </p>
          ) : (
            <p className="muted">Informe altura e peso para calcular.</p>
          )}
        </div>

        <Button type="submit" size="lg" block icon={saved ? Check : Save} variant={saved ? 'success' : 'primary'}>
          {saved ? 'Dados salvos' : 'Salvar'}
        </Button>
      </form>
    </div>
  );
}
