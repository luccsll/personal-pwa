import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Flame, Play, Scale, Trophy, TrendingDown, TrendingUp, User } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { useActiveSession, useBodyWeightStats, useCompletedSessions, useTodayWorkout } from '@/hooks/useDerivedData';
import FeaturedWorkoutCard from '@/components/FeaturedWorkoutCard';
import SwitchWorkoutSheet from '@/components/SwitchWorkoutSheet';
import StatCard from '@/components/StatCard';
import WeeklyProgress from '@/components/WeeklyProgress';
import WorkoutHistory from '@/components/WorkoutHistory';
import ProgressBar from '@/components/ProgressBar';
import { WEEK_DAYS, dayLabel, formatDate, formatLongDate, formatShortDate, getGreeting, toDateKey } from '@/utils/date';
import { formatSigned, formatWeight } from '@/utils/format';
import { getPersonalRecords, getStreak, getWeekProgress } from '@/utils/stats';
import { getSelectedWorkout, getWorkoutsForDay } from '@/utils/workout';
import './DashboardPage.scss';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, workouts, sessions, records, exercises, weekSelection, startSession, selectWorkoutForDay } = useAppData();
  const todayWorkout = useTodayWorkout();
  const activeSession = useActiveSession();
  const completed = useCompletedSessions();
  const weightStats = useBodyWeightStats();
  const [switchOpen, setSwitchOpen] = useState(false);

  const today = new Date();
  const todayIndex = today.getDay();
  const todayOptions = getWorkoutsForDay(workouts, todayIndex);

  const doneToday = completed.some(
    (s) => toDateKey(s.startedAt) === toDateKey(today) && todayOptions.some((w) => w.id === s.workoutId),
  );
  const status = activeSession?.workoutId === todayWorkout?.id ? 'active' : doneToday ? 'done' : 'pending';

  const nextWorkout = useMemo(() => {
    for (let i = 1; i <= 7; i += 1) {
      const day = (todayIndex + i) % 7;
      const workout = getSelectedWorkout(workouts, day, weekSelection);
      if (workout) return { dayLabel: dayLabel(day), workout };
    }
    return null;
  }, [todayIndex, workouts, weekSelection]);

  const weekDays = useMemo(() => getWeekProgress(sessions, workouts), [sessions, workouts]);
  const streak = useMemo(() => getStreak(sessions, workouts), [sessions, workouts]);
  const recentRecords = useMemo(
    () => getPersonalRecords(exercises, sessions, records).slice(0, 3),
    [exercises, sessions, records],
  );

  const handleStart = () => {
    const id = activeSession?.id ?? startSession(todayWorkout.id);
    if (id) navigate(`/treino/${id}`);
  };

  const activeProgress = activeSession
    ? activeSession.exercises.filter((item) => {
        const done = records.filter((r) => r.sessionId === activeSession.id && r.itemId === item.id && r.completed).length;
        return done >= item.sets;
      }).length
    : 0;

  const lastSession = completed[0];

  return (
    <>
      <header className="dashboard__header">
        <div>
          <p className="dashboard__date">{formatLongDate(today)}</p>
          <h1>
            {getGreeting(today).replace('!', '')}
            {profile.name ? `, ${profile.name}` : ''}!
          </h1>
          <p className="dashboard__subtitle">Vamos treinar?</p>
        </div>
        <Link to="/perfil" className="dashboard__avatar" aria-label="Meus dados">
          {profile.name ? profile.name.charAt(0).toUpperCase() : <User size={20} />}
        </Link>
      </header>

      {activeSession && activeSession.workoutId !== todayWorkout?.id && (
        <Link to={`/treino/${activeSession.id}`} className="dashboard__resume card">
          <span className="dashboard__resume-icon">
            <Play size={18} />
          </span>
          <div>
            <strong>Treino em andamento</strong>
            <p>{activeSession.workoutName}</p>
            <ProgressBar value={activeProgress} max={activeSession.exercises.length} />
          </div>
        </Link>
      )}

      <div className="page-columns">
        <div className="stack dashboard__main">
          <FeaturedWorkoutCard
            workout={todayWorkout}
            status={status}
            onStart={handleStart}
            canSwitch={todayOptions.length > 1}
            onSwitch={() => setSwitchOpen(true)}
            nextWorkout={nextWorkout}
          />

          <div className="grid-3">
            <StatCard
              icon={Scale}
              label="Peso atual"
              value={weightStats ? formatWeight(weightStats.current.weight) : '—'}
              hint={weightStats ? `em ${formatShortDate(weightStats.current.date)}` : 'Registrar'}
              to="/peso"
            />
            <StatCard icon={Dumbbell} label="Treinos" value={completed.length} hint="realizados" to="/historico" />
            <StatCard icon={Flame} label="Sequência" value={`${streak} ${streak === 1 ? 'dia' : 'dias'}`} hint="de treino" />
          </div>

          <WeeklyProgress days={weekDays} />
        </div>

        <div className="stack">
          <section className="section">
            <div className="section__header">
              <h2>Último treino</h2>
              {lastSession && <Link to="/historico">Ver todos</Link>}
            </div>
            {lastSession ? (
              <WorkoutHistory sessions={[lastSession]} />
            ) : (
              <p className="card secondary-text">Nenhum treino realizado ainda. Que tal começar hoje?</p>
            )}
          </section>

          <section className="section">
            <div className="section__header">
              <h2>Evolução</h2>
              <Link to="/evolucao">Ver mais</Link>
            </div>
            <div className="card dashboard__evolution">
              <div className="dashboard__evolution-row">
                <span className="dashboard__evolution-icon">
                  {weightStats && weightStats.change > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </span>
                <div>
                  <span className="secondary-text">Peso corporal</span>
                  {weightStats ? (
                    <p>
                      <strong>{formatWeight(weightStats.current.weight)}</strong>{' '}
                      <span className="muted">
                        ({formatSigned(weightStats.change, ' kg')} desde {formatDate(weightStats.initial.date)})
                      </span>
                    </p>
                  ) : (
                    <p>
                      <Link to="/peso" className="dashboard__link">
                        Registre seu peso
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              {recentRecords.map((pr) => (
                <div key={pr.exercise.id} className="dashboard__evolution-row">
                  <span className="dashboard__evolution-icon dashboard__evolution-icon--gold">
                    <Trophy size={18} />
                  </span>
                  <div>
                    <span className="secondary-text">Recorde · {pr.exercise.name}</span>
                    <p>
                      <strong>{formatWeight(pr.weight)}</strong> <span className="muted">em {formatShortDate(pr.date)}</span>
                    </p>
                  </div>
                </div>
              ))}

              {!recentRecords.length && (
                <p className="muted dashboard__evolution-empty">
                  Seus recordes de carga aparecem aqui depois do primeiro treino.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <SwitchWorkoutSheet
        open={switchOpen}
        dayLabel={WEEK_DAYS.find((d) => d.index === todayIndex)?.label}
        options={todayOptions}
        selectedId={todayWorkout?.id}
        onSelect={(id) => selectWorkoutForDay(todayIndex, id)}
        onClose={() => setSwitchOpen(false)}
      />
    </>
  );
}
