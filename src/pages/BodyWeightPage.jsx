import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Scale, Target, Trash2 } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { useBodyWeightStats } from '@/hooks/useDerivedData';
import PageHeader from '@/components/PageHeader';
import WeightChart from '@/components/WeightChart';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import { formatDate, toDateKey } from '@/utils/date';
import { formatNumber, formatSigned, formatWeight, parseDecimal } from '@/utils/format';
import { bmiCategory, calculateBmi, sortBodyWeights } from '@/utils/stats';
import './BodyWeightPage.scss';

export default function BodyWeightPage() {
  const { bodyWeights, profile, addBodyWeight, removeBodyWeight } = useAppData();
  const stats = useBodyWeightStats();
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(toDateKey());

  const sorted = useMemo(() => sortBodyWeights(bodyWeights), [bodyWeights]);
  const chartData = sorted.map((e) => ({ date: e.date, value: e.weight }));
  const bmi = calculateBmi(stats?.current.weight, profile.height);
  const parsed = parseDecimal(weight);
  const valid = parsed !== null && parsed > 20 && parsed < 400 && date;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    addBodyWeight({ weight: parsed, date });
    setWeight('');
    setDate(toDateKey());
  };

  return (
    <>
      <PageHeader back title="Meu peso" />

      <div className="page-columns">
        <div className="stack">
          <form className="card body-weight__form" onSubmit={handleSubmit}>
            <h3>Registrar peso</h3>
            <div className="grid-2">
              <label className="field">
                <span>Peso (kg)</span>
                <input
                  className="input"
                  inputMode="decimal"
                  placeholder={stats ? formatNumber(stats.current.weight) : 'Ex.: 80,5'}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value.replace(/[^\d,.]/g, ''))}
                />
              </label>
              <label className="field">
                <span>Data</span>
                <input className="input" type="date" value={date} max={toDateKey()} onChange={(e) => setDate(e.target.value)} />
              </label>
            </div>
            <Button type="submit" block icon={Plus} disabled={!valid}>
              Registrar
            </Button>
          </form>

          {stats && (
            <div className="grid-2">
              <StatCard icon={Scale} label="Peso atual" value={formatWeight(stats.current.weight)} hint={formatDate(stats.current.date)} />
              <StatCard label="Peso inicial" value={formatWeight(stats.initial.weight)} hint={formatDate(stats.initial.date)} />
              <StatCard label="Maior peso" value={formatWeight(stats.max)} />
              <StatCard label="Menor peso" value={formatWeight(stats.min)} />
            </div>
          )}

          <div className="card body-weight__bmi">
            <div>
              <span className="secondary-text">IMC</span>
              {bmi ? (
                <>
                  <strong>{formatNumber(Math.round(bmi * 10) / 10)}</strong>
                  <span className="body-weight__bmi-category">{bmiCategory(bmi)}</span>
                </>
              ) : (
                <p className="muted">
                  {profile.height ? 'Registre seu peso para calcular.' : 'Informe sua altura em '}
                  {!profile.height && <Link to="/perfil">Meus dados</Link>}
                </p>
              )}
            </div>
            <div>
              <span className="secondary-text">
                <Target size={14} /> Objetivo
              </span>
              <strong className="body-weight__goal">{profile.goal ?? <Link to="/perfil">Definir</Link>}</strong>
            </div>
          </div>
        </div>

        <div className="stack">
          <section className="section">
            <div className="section__header">
              <h2>Evolução do peso</h2>
              {stats && <span className="secondary-text">{formatSigned(stats.change, ' kg')}</span>}
            </div>
            <div className="card">
              <WeightChart data={chartData} />
            </div>
          </section>

          <section className="section">
            <h2>Registros</h2>
            {sorted.length ? (
              <ul className="card body-weight__list">
                {[...sorted].reverse().map((entry, i, list) => {
                  const previous = list[i + 1];
                  const diff = previous ? entry.weight - previous.weight : null;
                  return (
                    <li key={entry.id}>
                      <span className="secondary-text">{formatDate(entry.date)}</span>
                      <strong>{formatWeight(entry.weight)}</strong>
                      <span className="body-weight__diff">
                        {diff ? formatSigned(diff) : ''}
                      </span>
                      <button onClick={() => removeBodyWeight(entry.id)} aria-label={`Excluir registro de ${formatDate(entry.date)}`}>
                        <Trash2 size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState icon={Scale} title="Nenhum registro" description="Registre seu peso para acompanhar a evolução." />
            )}
          </section>
        </div>
      </div>
    </>
  );
}
