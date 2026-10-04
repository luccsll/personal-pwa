import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Flag,
  Gauge,
  History,
  LayoutList,
  Plus,
  SquareStack,
  Timer,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { useExerciseMap } from '@/hooks/useDerivedData';
import ExerciseImage from '@/components/ExerciseImage';
import ProgressBar from '@/components/ProgressBar';
import SetInput from '@/components/SetInput';
import RestTimer from '@/components/RestTimer';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import WorkoutSummary from '@/components/WorkoutSummary';
import CardioCard from '@/components/CardioCard';
import UserAvatar from '@/components/UserAvatar';
import { RIR_RECOMMENDATION } from '@/data/initialData';
import { formatDate } from '@/utils/date';
import { comparePerformance, getPreviousPerformance, reachedTopOfRange } from '@/utils/stats';
import { formatReps, formatRest, formatSetValue, isTimed, repsUnit, topOfRange } from '@/utils/workout';
import './WorkoutExecutionPage.scss';

function ElapsedTime({ since }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const total = Math.max(0, Math.floor((now - new Date(since)) / 1000));
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return <span className="execution__timer">{h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`}</span>;
}

const vibrate = () => {
  try {
    navigator.vibrate?.(40);
  } catch {
    /* sem suporte */
  }
};

const formatSet = (s, exercise) =>
  `${formatSetValue(s, exercise)}${s.rir !== null && s.rir !== undefined ? ` · RIR ${s.rir}` : ''}`;

export default function WorkoutExecutionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const {
    userId,
    profile,
    sessions,
    records,
    updateSet,
    setSessionIndex,
    addSessionSet,
    setRestTimer,
    setSessionCardio,
    finishSession,
    deleteSession,
  } = useAppData();
  const exerciseMap = useExerciseMap();
  const [view, setView] = useState('single');
  const [finishOpen, setFinishOpen] = useState(false);

  const session = sessions.find((s) => s.id === sessionId);

  // Séries registradas nesta sessão, indexadas por item do treino
  const setsByItem = useMemo(() => {
    const map = new Map();
    for (const r of records) {
      if (r.sessionId !== sessionId) continue;
      if (!map.has(r.itemId)) map.set(r.itemId, new Map());
      map.get(r.itemId).set(r.setNumber, r);
    }
    return map;
  }, [records, sessionId]);

  // Execução anterior de cada exercício (antes deste treino)
  const lastByExercise = useMemo(() => {
    const map = new Map();
    session?.exercises.forEach((item) => {
      if (!map.has(item.exerciseId)) {
        map.set(item.exerciseId, getPreviousPerformance(item.exerciseId, sessions, records, session.startedAt, sessionId));
      }
    });
    return map;
    // O histórico anterior não muda durante o treino
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, session?.exercises.length]);

  const completedCount = (it) => [...(setsByItem.get(it.id)?.values() ?? [])].filter((r) => r.completed).length;
  const isItemDone = (it) => completedCount(it) >= it.sets;
  const allDone = Boolean(session && !session.completed && session.exercises.every(isItemDone));

  // Ao concluir a última série do treino, abre a finalização automaticamente
  const wasAllDone = useRef(allDone);
  useEffect(() => {
    if (allDone && !wasAllDone.current) setFinishOpen(true);
    wasAllDone.current = allDone;
  }, [allDone]);

  const closeRest = useCallback(() => setRestTimer(sessionId, null), [setRestTimer, sessionId]);

  if (!session) return <Navigate to="/" replace />;
  if (session.completed) return <WorkoutSummary session={session} />;

  const items = session.exercises;
  const index = Math.min(session.currentIndex ?? 0, items.length - 1);
  const item = items[index];
  const exercise = exerciseMap.get(item.exerciseId);
  const last = lastByExercise.get(item.exerciseId);
  const topReps = topOfRange(item);
  const timed = isTimed(exercise);
  // Peso do corpo / prancha começam com 0 kg
  const defaultWeight = timed || exercise?.bodyweight ? 0 : null;
  const cardioMinutes = session.cardioMinutes ?? profile.cardioMinutes;
  const toggleCardio = () => setSessionCardio(session.id, !session.cardioDone);

  const doneExercises = items.filter(isItemDone).length;
  const totalSetsDone = items.reduce((t, it) => t + completedCount(it), 0);
  const itemDone = isItemDone(item);
  const isLast = index === items.length - 1;

  /**
   * Valores exibidos em uma série: o registro salvo ou, se ainda não houver,
   * a mesma carga da série anterior (a 1ª série parte do último treino).
   */
  const getSetValues = (setNumber) => {
    const saved = setsByItem.get(item.id)?.get(setNumber);
    const previous = setNumber > 1 ? getSetValues(setNumber - 1) : null;
    const lastSet = last?.sets.find((s) => s.setNumber === 1) ?? last?.lastSet;
    return {
      weight: saved?.weight ?? previous?.weight ?? lastSet?.weight ?? defaultWeight,
      repetitions: saved?.repetitions ?? previous?.repetitions ?? lastSet?.repetitions ?? item.repetitions,
      rir: saved?.rir ?? null,
      completed: Boolean(saved?.completed),
    };
  };

  const currentSets = [...(setsByItem.get(item.id)?.values() ?? [])];
  const comparison = comparePerformance(currentSets, last?.sets);
  const suggestIncrease = reachedTopOfRange(currentSets, item.sets, topReps);
  const lastHitTop = last ? reachedTopOfRange(last.sets, item.sets, topReps) : false;
  const firstOpenSet = Array.from({ length: item.sets }, (_, i) => i + 1).find((n) => !getSetValues(n).completed);

  const goTo = (i) => {
    setSessionIndex(session.id, i);
    setView('single');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (setNumber, patch) => {
    const { weight, repetitions, rir } = getSetValues(setNumber);
    updateSet(session.id, item, setNumber, { weight, repetitions, rir, ...patch });
  };

  const startRest = (seconds) => {
    if (!seconds) return;
    setRestTimer(session.id, {
      itemId: item.id,
      duration: seconds,
      endsAt: new Date(Date.now() + seconds * 1000).toISOString(),
    });
  };

  const adjustRest = (delta) => {
    const timer = session.restTimer;
    if (!timer) return;
    const endsAt = Math.max(Date.now(), new Date(timer.endsAt).getTime() + delta * 1000);
    setRestTimer(session.id, {
      ...timer,
      duration: Math.max(1, timer.duration + delta),
      endsAt: new Date(endsAt).toISOString(),
    });
  };

  const handleToggle = (setNumber) => {
    const values = getSetValues(setNumber);
    if (values.completed) {
      updateSet(session.id, item, setNumber, { completed: false });
      return;
    }
    vibrate();
    updateSet(session.id, item, setNumber, {
      weight: values.weight,
      repetitions: values.repetitions,
      rir: values.rir,
      completed: true,
      completedAt: new Date().toISOString(),
    });
    // Descanso automático, exceto após a última série do treino
    const remainingSets = items.reduce((t, it) => t + Math.max(0, it.sets - completedCount(it)), 0);
    if (remainingSets > 1) startRest(item.restTime);
  };

  const handleFinish = () => {
    finishSession(session.id);
    setFinishOpen(false);
    window.scrollTo(0, 0);
  };

  const handleDiscard = () => {
    deleteSession(session.id);
    navigate('/', { replace: true });
  };

  return (
    <div className="execution">
      <header className="execution__topbar">
        <Link to="/" className="execution__icon-btn" aria-label="Sair (o progresso fica salvo)">
          <X size={22} />
        </Link>
        <div className="execution__title">
          <strong>{session.workoutName}</strong>
          <span>
            <UserAvatar userId={userId} name={profile.name} size="sm" /> {profile.name} ·{' '}
            <Timer size={13} /> <ElapsedTime since={session.startedAt} />
          </span>
        </div>
        <button
          className="execution__icon-btn"
          onClick={() => setView(view === 'single' ? 'list' : 'single')}
          aria-label={view === 'single' ? 'Ver todos os exercícios' : 'Ver exercício atual'}
        >
          {view === 'single' ? <LayoutList size={22} /> : <SquareStack size={22} />}
        </button>
      </header>

      <div className="execution__progress">
        <div className="execution__progress-text">
          <span>
            <strong>
              {doneExercises} / {items.length}
            </strong>{' '}
            exercícios
          </span>
          <span className="muted">{totalSetsDone} séries</span>
        </div>
        <ProgressBar value={doneExercises} max={items.length} />
      </div>

      {view === 'list' ? (
        <div className="execution__list">
          {items.map((it, i) => {
            const ex = exerciseMap.get(it.exerciseId);
            const done = isItemDone(it);
            return (
              <button
                key={it.id}
                className={`execution__list-item ${i === index ? 'is-current' : ''} ${done ? 'is-done' : ''}`}
                onClick={() => goTo(i)}
              >
                <ExerciseImage exercise={ex} className="execution__list-image" />
                <div>
                  <strong>{ex?.name ?? 'Exercício'}</strong>
                  <span>
                    {completedCount(it)} / {it.sets} séries · {formatReps(it)} {repsUnit(ex)}
                  </span>
                </div>
                {done ? <CircleCheck size={22} className="execution__list-check" /> : <ChevronRight size={20} />}
              </button>
            );
          })}
          <CardioCard minutes={cardioMinutes} done={session.cardioDone} onToggle={toggleCardio} />
          <Button variant="success" size="lg" block icon={Flag} onClick={() => setFinishOpen(true)}>
            Finalizar treino
          </Button>
        </div>
      ) : (
        <div className="execution__exercise" key={item.id}>
          <div className="execution__hero">
            <ExerciseImage exercise={exercise} className="execution__image" />
            <div className="execution__heading">
              <span className="execution__counter">
                Exercício {index + 1} de {items.length}
              </span>
              <h1>{exercise?.name ?? 'Exercício'}</h1>
              <p className="execution__group">{exercise?.muscleGroup}</p>
              <p className="execution__plan">
                {item.sets} × {formatReps(item)}
                {timed ? ' segundos' : ''}
              </p>
              <div className="execution__chips">
                <span>
                  <Timer size={13} /> Descanso {formatRest(item.restTime)}
                </span>
                {exercise?.type && (
                  <span>
                    <Gauge size={13} /> {RIR_RECOMMENDATION[exercise.type]}
                  </span>
                )}
              </div>
              {exercise?.instructions && <p className="execution__instructions">{exercise.instructions}</p>}
            </div>
          </div>

          <div className="execution__last">
            <History size={18} />
            <div>
              <span>Último treino{last ? ` · ${formatDate(last.date)}` : ''}</span>
              {last ? (
                <strong>{last.sets.map((s) => formatSet(s, exercise)).join('   ·   ')}</strong>
              ) : (
                <strong>{timed ? 'Primeira vez — registre o tempo que aguentar' : 'Primeira vez — escolha uma carga confortável'}</strong>
              )}
              {lastHitTop && !itemDone && (
                <em className="execution__last-hint">Você atingiu o topo da faixa no último treino.</em>
              )}
            </div>
          </div>

          {comparison === 'better' && (
            <div className="execution__banner execution__banner--success">
              <TrendingUp size={20} /> Você melhorou sua performance neste exercício.
            </div>
          )}
          {itemDone && suggestIncrease && (
            <div className="execution__banner execution__banner--info">
              <TrendingUp size={20} /> Considere aumentar a carga no próximo treino.
            </div>
          )}
          {itemDone && !suggestIncrease && comparison !== 'better' && (
            <div className="execution__banner execution__banner--success">
              <CircleCheck size={20} /> Exercício concluído!
            </div>
          )}

          <div className="execution__sets">
            {Array.from({ length: item.sets }, (_, i) => i + 1).map((setNumber) => {
              const values = getSetValues(setNumber);
              return (
                <SetInput
                  key={setNumber}
                  setNumber={setNumber}
                  weight={values.weight}
                  repetitions={values.repetitions}
                  rir={values.rir}
                  completed={values.completed}
                  timed={timed}
                  active={setNumber === firstOpenSet}
                  onChange={(patch) => handleChange(setNumber, patch)}
                  onToggle={() => handleToggle(setNumber)}
                />
              );
            })}
            <button className="execution__add-set" onClick={() => addSessionSet(session.id, item.id)}>
              <Plus size={16} /> Adicionar série
            </button>
          </div>

          {isLast && <CardioCard minutes={cardioMinutes} done={session.cardioDone} onToggle={toggleCardio} />}
        </div>
      )}

      {session.restTimer && <RestTimer timer={session.restTimer} onAdjust={adjustRest} onSkip={closeRest} />}

      {view === 'single' && (
        <nav className="execution__bottom">
          <Button
            variant="secondary"
            size="lg"
            icon={ChevronLeft}
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
            aria-label="Exercício anterior"
          >
            <span className="execution__bottom-label">Anterior</span>
          </Button>
          {isLast ? (
            <Button variant="success" size="lg" block icon={Flag} onClick={() => setFinishOpen(true)}>
              Finalizar treino
            </Button>
          ) : (
            <Button
              variant={itemDone ? 'success' : 'primary'}
              size="lg"
              block
              iconRight={ChevronRight}
              onClick={() => goTo(index + 1)}
            >
              Próximo exercício
            </Button>
          )}
        </nav>
      )}

      <Modal
        open={finishOpen}
        onClose={() => setFinishOpen(false)}
        title={allDone ? 'Todos os exercícios concluídos! 💪' : 'Finalizar treino?'}
        description={
          allDone
            ? 'Finalize para salvar o treino no histórico.'
            : `Você concluiu ${doneExercises} de ${items.length} exercícios. Séries não concluídas não serão salvas no histórico.`
        }
        footer={
          <>
            <Button variant="success" size="lg" block icon={Flag} onClick={handleFinish} disabled={totalSetsDone === 0}>
              Finalizar treino
            </Button>
            <Button variant="secondary" block onClick={() => setFinishOpen(false)}>
              {allDone ? 'Revisar séries' : 'Continuar treinando'}
            </Button>
            {!allDone && (
              <Button variant="ghost" block className="execution__discard" onClick={handleDiscard}>
                Descartar treino
              </Button>
            )}
          </>
        }
      >
        {cardioMinutes > 0 && <CardioCard minutes={cardioMinutes} done={session.cardioDone} onToggle={toggleCardio} />}
        {totalSetsDone === 0 && <p className="muted">Conclua pelo menos uma série para salvar o treino.</p>}
      </Modal>
    </div>
  );
}
