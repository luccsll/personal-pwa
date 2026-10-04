import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Dumbbell, House, Layers, PartyPopper, Weight } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import Button from './Button';
import SessionExercises from './SessionExercises';
import { formatDate, formatDuration, formatTime } from '@/utils/date';
import { formatNumber, formatSigned } from '@/utils/format';
import { getPreviousSession, getSessionTotals } from '@/utils/stats';
import './WorkoutSummary.scss';

function Diff({ value, suffix = '', neutral = false }) {
  if (value === null || value === 0) return <span className="workout-summary__diff">=</span>;
  const tone = neutral ? '' : value > 0 ? 'is-good' : 'is-bad';
  return <span className={`workout-summary__diff ${tone}`}>{formatSigned(value, suffix)}</span>;
}

/** Tela exibida ao finalizar um treino. */
export default function WorkoutSummary({ session }) {
  const { sessions, records } = useAppData();
  const totals = getSessionTotals(session.id, records);
  const previous = getPreviousSession(session, sessions);
  const previousTotals = previous ? getSessionTotals(previous.id, records) : null;
  const volumeChange =
    previousTotals && previousTotals.volume > 0 ? ((totals.volume - previousTotals.volume) / previousTotals.volume) * 100 : null;

  return (
    <div className="workout-summary">
      <section className="workout-summary__hero">
        <span className="workout-summary__icon">
          <PartyPopper size={34} strokeWidth={1.8} />
        </span>
        <h1>Treino concluído! 💪</h1>
        <p>{session.workoutName}</p>
        <span className="workout-summary__time">
          <CalendarDays size={14} /> {formatDate(session.startedAt)} · {formatTime(session.startedAt)} –{' '}
          {formatTime(session.finishedAt)}
        </span>
      </section>

      <div className="grid-2">
        <div className="workout-summary__stat card">
          <Clock size={18} />
          <strong>{formatDuration(session.duration)}</strong>
          <span>duração</span>
        </div>
        <div className="workout-summary__stat card">
          <Dumbbell size={18} />
          <strong>
            {totals.exercises}/{session.exercises.length}
          </strong>
          <span>exercícios realizados</span>
        </div>
        <div className="workout-summary__stat card">
          <Layers size={18} />
          <strong>{totals.sets}</strong>
          <span>séries realizadas</span>
        </div>
        <div className="workout-summary__stat card">
          <Weight size={18} />
          <strong>{formatNumber(totals.volume)} kg</strong>
          <span>volume total</span>
        </div>
      </div>

      <section className="section">
        <h2>Comparação com o treino anterior</h2>
        {previous ? (
          <div className="card workout-summary__compare">
            <p className="secondary-text">{formatDate(previous.startedAt)}</p>
            <ul>
              <li>
                <span>Volume total</span>
                <strong>{formatNumber(totals.volume)} kg</strong>
                <Diff value={totals.volume - previousTotals.volume} suffix=" kg" />
              </li>
              {volumeChange !== null && (
                <li>
                  <span>Variação do volume</span>
                  <strong />
                  <Diff value={Math.round(volumeChange)} suffix="%" />
                </li>
              )}
              <li>
                <span>Séries</span>
                <strong>{totals.sets}</strong>
                <Diff value={totals.sets - previousTotals.sets} />
              </li>
              <li>
                <span>Duração</span>
                <strong>{formatDuration(session.duration)}</strong>
                <Diff value={session.duration - previous.duration} suffix=" min" neutral />
              </li>
            </ul>
          </div>
        ) : (
          <p className="card secondary-text">Este é o primeiro registro deste treino. Na próxima vez você verá a comparação aqui.</p>
        )}
      </section>

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
