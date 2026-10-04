import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Dumbbell, House, Layers, PartyPopper } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import Button from './Button';
import SessionExercises from './SessionExercises';
import { formatDate, formatDuration, formatTime } from '@/utils/date';
import { formatNumber } from '@/utils/format';
import './WorkoutSummary.scss';

/** Tela exibida ao finalizar um treino. */
export default function WorkoutSummary({ session }) {
  const { records } = useAppData();
  const sets = records.filter((r) => r.sessionId === session.id && r.completed);
  const volume = sets.reduce((t, s) => t + (s.weight ?? 0) * (s.repetitions ?? 0), 0);
  const exercisesDone = new Set(sets.map((s) => s.itemId)).size;

  return (
    <div className="workout-summary">
      <section className="workout-summary__hero">
        <span className="workout-summary__icon">
          <PartyPopper size={34} strokeWidth={1.8} />
        </span>
        <h1>Treino concluído!</h1>
        <p>{session.workoutName}</p>
        <span className="workout-summary__time">
          <CalendarDays size={14} /> {formatDate(session.startedAt)} · {formatTime(session.startedAt)} –{' '}
          {formatTime(session.finishedAt)}
        </span>
      </section>

      <div className="grid-3">
        <div className="workout-summary__stat card">
          <Clock size={18} />
          <strong>{formatDuration(session.duration)}</strong>
          <span>duração</span>
        </div>
        <div className="workout-summary__stat card">
          <Dumbbell size={18} />
          <strong>
            {exercisesDone}/{session.exercises.length}
          </strong>
          <span>exercícios</span>
        </div>
        <div className="workout-summary__stat card">
          <Layers size={18} />
          <strong>{formatNumber(volume)}</strong>
          <span>kg levantados</span>
        </div>
      </div>

      <section className="section">
        <h2>Resumo</h2>
        <SessionExercises session={session} />
      </section>

      <div className="workout-summary__actions">
        <Button as={Link} to="/" size="lg" block icon={House}>
          Voltar ao início
        </Button>
      </div>
    </div>
  );
}
