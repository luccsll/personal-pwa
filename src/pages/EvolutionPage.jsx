import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChartNoAxesCombined, Search, Trophy } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { useBodyWeightStats } from '@/hooks/useDerivedData';
import PageHeader from '@/components/PageHeader';
import WeightChart from '@/components/WeightChart';
import ExerciseHistory from '@/components/ExerciseHistory';
import ExerciseImage from '@/components/ExerciseImage';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import { formatDate, formatShortDate } from '@/utils/date';
import { formatNumber, formatSigned, formatWeight } from '@/utils/format';
import { getExerciseHistory, getExerciseSummary, getPersonalRecords, sortBodyWeights } from '@/utils/stats';
import './EvolutionPage.scss';

const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export default function EvolutionPage() {
  const { exercises, sessions, records, bodyWeights } = useAppData();
  const weightStats = useBodyWeightStats();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const personalRecords = useMemo(() => getPersonalRecords(exercises, sessions, records), [exercises, sessions, records]);
  const trainedIds = useMemo(() => new Set(personalRecords.map((pr) => pr.exercise.id)), [personalRecords]);

  // Exercícios com registros aparecem primeiro
  const options = useMemo(
    () =>
      [...exercises]
        .filter((e) => normalize(e.name).includes(normalize(query)))
        .sort((a, b) => Number(trainedIds.has(b.id)) - Number(trainedIds.has(a.id)) || a.name.localeCompare(b.name)),
    [exercises, query, trainedIds],
  );

  const selectedId = params.get('exercicio') ?? personalRecords[0]?.exercise.id ?? exercises[0]?.id;
  const selected = exercises.find((e) => e.id === selectedId);
  const history = useMemo(() => getExerciseHistory(selectedId, sessions, records), [selectedId, sessions, records]);
  const summary = getExerciseSummary(history);

  const weightData = useMemo(() => sortBodyWeights(bodyWeights).map((e) => ({ date: e.date, value: e.weight })), [bodyWeights]);
  const loadData = history.map((h) => ({ date: h.date, value: h.maxWeight }));

  const select = (id) => setParams({ exercicio: id }, { replace: true });

  return (
    <>
      <PageHeader title="Minha evolução" />

      <div className="page-columns">
        <section className="section">
          <div className="section__header">
            <h2>Carga por exercício</h2>
          </div>

          <div className="card evolution__picker">
            <label className="evolution__search">
              <Search size={18} />
              <input
                className="input"
                type="search"
                placeholder="Buscar exercício"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="evolution__chips" role="listbox" aria-label="Exercícios">
              {options.map((e) => (
                <button
                  key={e.id}
                  role="option"
                  aria-selected={e.id === selectedId}
                  className={`evolution__chip ${e.id === selectedId ? 'is-selected' : ''} ${trainedIds.has(e.id) ? '' : 'is-empty'}`}
                  onClick={() => select(e.id)}
                >
                  {e.name}
                </button>
              ))}
              {!options.length && <span className="muted">Nenhum exercício encontrado.</span>}
            </div>
          </div>

          {selected && (
            <div className="card evolution__exercise">
              <header className="evolution__exercise-header">
                <ExerciseImage exercise={selected} className="evolution__exercise-image" />
                <div>
                  <h3>{selected.name}</h3>
                  <span className="secondary-text">{selected.muscleGroup}</span>
                </div>
                <Link to={`/exercicios/${selected.id}`} className="evolution__more">
                  Detalhes
                </Link>
              </header>

              {summary ? (
                <>
                  <div className="grid-2">
                    <StatCard label="Última carga" value={formatWeight(summary.last.maxWeight)} hint={formatDate(summary.last.date)} />
                    <StatCard label="Maior carga" value={formatWeight(summary.best.maxWeight)} hint={formatDate(summary.best.date)} />
                    <StatCard
                      label="Evolução"
                      value={formatSigned(summary.change, ' kg')}
                      hint={summary.changePercent !== null ? `${formatSigned(Math.round(summary.changePercent))}% desde o início` : ''}
                    />
                    <StatCard label="Últimas repetições" value={`${summary.last.lastSet.repetitions ?? '—'} reps`} hint={`com ${formatWeight(summary.last.lastSet.weight)}`} />
                  </div>
                  <WeightChart data={loadData} />
                  <h3>Histórico</h3>
                  <ExerciseHistory history={history} />
                </>
              ) : (
                <p className="muted evolution__empty">Nenhum registro para este exercício ainda.</p>
              )}
            </div>
          )}
        </section>

        <div className="stack">
          <section className="section">
            <div className="section__header">
              <h2>Peso corporal</h2>
              <Link to="/peso">Registrar peso</Link>
            </div>
            <div className="card evolution__weight">
              {weightStats ? (
                <>
                  <div className="grid-3">
                    <div>
                      <span>Atual</span>
                      <strong>{formatWeight(weightStats.current.weight)}</strong>
                    </div>
                    <div>
                      <span>Inicial</span>
                      <strong>{formatWeight(weightStats.initial.weight)}</strong>
                    </div>
                    <div>
                      <span>Variação</span>
                      <strong>{formatSigned(weightStats.change, ' kg')}</strong>
                    </div>
                  </div>
                  <WeightChart data={weightData} height={180} />
                </>
              ) : (
                <p className="muted">
                  Nenhum peso registrado. <Link to="/peso">Registre seu peso</Link> para acompanhar a evolução.
                </p>
              )}
            </div>
          </section>

          <section className="section">
            <h2>Meus recordes</h2>
            {personalRecords.length ? (
              <ul className="card evolution__records">
                {personalRecords.map((pr) => (
                  <li key={pr.exercise.id}>
                    <button onClick={() => select(pr.exercise.id)}>
                      <span className="evolution__trophy">
                        <Trophy size={16} />
                      </span>
                      <span className="evolution__record-name">{pr.exercise.name}</span>
                      <strong>{formatNumber(pr.weight)} kg</strong>
                      <span className="muted">{formatShortDate(pr.date)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={ChartNoAxesCombined}
                title="Sem recordes ainda"
                description="Finalize seu primeiro treino para começar a acompanhar suas cargas."
              />
            )}
          </section>
        </div>
      </div>
    </>
  );
}
