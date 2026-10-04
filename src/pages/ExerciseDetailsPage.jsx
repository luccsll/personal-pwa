import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChartNoAxesCombined, History, Info } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { useExerciseMap } from '@/hooks/useDerivedData';
import PageHeader from '@/components/PageHeader';
import ExerciseImage from '@/components/ExerciseImage';
import ExerciseHistory from '@/components/ExerciseHistory';
import StatCard from '@/components/StatCard';
import Badge from '@/components/Badge';
import { formatDate } from '@/utils/date';
import { formatWeight } from '@/utils/format';
import { getExerciseHistory, getExerciseSummary } from '@/utils/stats';
import { muscleGroupColor } from '@/utils/muscleGroups';
import './ExerciseDetailsPage.scss';

export default function ExerciseDetailsPage() {
  const { id } = useParams();
  const { sessions, records } = useAppData();
  const exercise = useExerciseMap().get(id);
  const history = useMemo(() => getExerciseHistory(id, sessions, records), [id, sessions, records]);
  const summary = getExerciseSummary(history);

  if (!exercise) return <Navigate to="/treinos" replace />;

  return (
    <div className="exercise-details">
      <PageHeader back title={exercise.name} />

      <div className="exercise-details__layout">
        <ExerciseImage exercise={exercise} className="exercise-details__image" />

        <div className="stack">
          <div className="exercise-details__info card">
            <Badge color={muscleGroupColor(exercise.muscleGroup)}>{exercise.muscleGroup}</Badge>
            {exercise.instructions && (
              <p className="exercise-details__instructions">
                <Info size={16} /> {exercise.instructions}
              </p>
            )}
          </div>

          <div className="card exercise-details__last">
            <span className="secondary-text">
              <History size={16} /> Último treino
            </span>
            {summary ? (
              <>
                <strong>
                  {formatWeight(summary.last.lastSet.weight)} × {summary.last.lastSet.repetitions ?? '—'} reps
                </strong>
                <span className="muted">{formatDate(summary.last.date)}</span>
              </>
            ) : (
              <strong className="muted">Ainda sem registros</strong>
            )}
          </div>

          {summary && (
            <div className="grid-2">
              <StatCard label="Maior carga" value={formatWeight(summary.best.maxWeight)} hint={formatDate(summary.best.date)} />
              <StatCard label="Treinos" value={history.length} hint="com este exercício" />
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <section className="section">
          <div className="section__header">
            <h2>Histórico de cargas</h2>
            <Link to={`/evolucao?exercicio=${exercise.id}`}>
              <ChartNoAxesCombined size={14} /> Ver gráfico
            </Link>
          </div>
          <div className="card">
            <ExerciseHistory history={history} />
          </div>
        </section>
      )}
    </div>
  );
}
