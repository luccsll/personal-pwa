import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Check, Save } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { useBodyWeightStats } from '@/hooks/useDerivedData';
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import UserAvatar from '@/components/UserAvatar';
import { GOALS } from '@/data/initialData';
import { toDateKey } from '@/utils/date';
import { formatNumber, parseDecimal } from '@/utils/format';
import { bmiCategory, calculateBmi } from '@/utils/stats';
import './ProfilePage.scss';

const toInput = (n) => (n === null || n === undefined ? '' : String(n).replace('.', ','));

export default function ProfilePage() {
  const { userId, profile, updateProfile, addBodyWeight } = useAppData();
  const weightStats = useBodyWeightStats();
  const currentWeight = weightStats?.current.weight ?? null;

  const [form, setForm] = useState(() => ({
    name: profile.name ?? '',
    height: toInput(profile.height),
    weight: toInput(currentWeight),
    age: toInput(profile.age),
    cardioMinutes: toInput(profile.cardioMinutes),
    goal: profile.goal,
    focus: profile.focus ?? '',
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
    const age = parseDecimal(form.age);
    const cardioMinutes = parseDecimal(form.cardioMinutes);
    updateProfile({
      name: form.name.trim(),
      age: age && age > 0 ? Math.round(age) : null,
      height: height && height > 50 ? height : null,
      cardioMinutes: cardioMinutes !== null ? Math.round(cardioMinutes) : null,
      goal: form.goal,
      focus: form.focus.trim(),
    });
    // Peso alterado aqui vira um novo registro de peso corporal
    if (weight && weight !== currentWeight) addBodyWeight({ weight, date: toDateKey() });
    setSaved(true);
  };

  return (
    <div className="page--narrow profile">
      <PageHeader back title="Meus dados" />

      <div className="card profile__user">
        <UserAvatar userId={userId} name={profile.name} size="lg" />
        <div>
          <span className="secondary-text">Treinando agora</span>
          <strong>{profile.name}</strong>
        </div>
        <Button as={Link} to="/trocar-usuario" variant="secondary" icon={ArrowLeftRight}>
          Trocar usuário
        </Button>
      </div>

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
          <div className="grid-2">
            <label className="field">
              <span>Idade</span>
              <input
                className="input"
                inputMode="numeric"
                placeholder="Ex.: 30"
                value={form.age}
                onChange={(e) => set('age')(e.target.value.replace(/\D/g, ''))}
              />
            </label>
            <label className="field">
              <span>Cardio (min)</span>
              <input
                className="input"
                inputMode="numeric"
                placeholder="Ex.: 20"
                value={form.cardioMinutes}
                onChange={(e) => set('cardioMinutes')(e.target.value.replace(/\D/g, ''))}
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
          <label className="field">
            <span>Foco</span>
            <textarea
              className="input profile__focus"
              rows={3}
              placeholder="Ex.: ganhar massa muscular nos braços"
              value={form.focus}
              onChange={set('focus')}
            />
          </label>
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
