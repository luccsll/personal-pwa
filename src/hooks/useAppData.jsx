import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import * as storage from '@/services/storageService';
import { createId, slugify } from '@/utils/id';
import { diffInMinutes, getWeekStart, toDateKey } from '@/utils/date';
import { estimateDuration } from '@/utils/workout';
import { DEFAULT_USER } from '@/data/users';

const AppDataContext = createContext(null);

const PERSIST = {
  profile: storage.saveProfile,
  exercises: storage.saveExercises,
  workouts: storage.saveWorkouts,
  sessions: storage.saveSessions,
  records: storage.saveRecords,
  bodyWeights: storage.saveBodyWeights,
  activeSessionId: storage.saveActiveSessionId,
  weekSelection: storage.saveWeekSelection,
};

/**
 * Estado global do app. Os dados vêm do storageService e toda alteração
 * é persistida imediatamente (salvamento automático).
 */
export function AppDataProvider({ children }) {
  // Sem usuário escolhido ainda: carrega o padrão e mostra "Quem está treinando hoje?"
  const [selectedUser, setSelectedUser] = useState(() => storage.getSelectedUser());
  const [state, setState] = useState(() => storage.loadAll(selectedUser ?? DEFAULT_USER));
  const stateRef = useRef(state);

  const update = useCallback((key, producer) => {
    const next = producer(stateRef.current[key]);
    PERSIST[key](next);
    stateRef.current = { ...stateRef.current, [key]: next };
    setState(stateRef.current);
    return next;
  }, []);

  const actions = useMemo(() => {
    const get = () => stateRef.current;

    return {
      // ----- Usuário ativo (Lucas / Anthony) -----
      /** Troca o usuário ativo. Os dados do outro usuário continuam salvos. */
      selectUser: (userId) => {
        storage.saveSelectedUser(userId);
        stateRef.current = storage.loadAll(userId);
        setState(stateRef.current);
        setSelectedUser(userId);
      },

      // ----- Perfil -----
      updateProfile: (patch) => update('profile', (p) => ({ ...p, ...patch })),

      // ----- Peso corporal -----
      addBodyWeight: ({ weight, date = toDateKey() }) =>
        update('bodyWeights', (list) => [
          ...list,
          { id: createId('peso'), weight, date, createdAt: new Date().toISOString() },
        ]),
      removeBodyWeight: (id) => update('bodyWeights', (list) => list.filter((e) => e.id !== id)),

      // ----- Escolha do treino do dia (válida na semana atual) -----
      selectWorkoutForDay: (dayOfWeek, workoutId) =>
        update('weekSelection', (sel) => {
          const weekStart = getWeekStart();
          const choices = sel?.weekStart === weekStart ? sel.choices : {};
          return { weekStart, choices: { ...choices, [dayOfWeek]: workoutId } };
        }),

      // ----- Treinos e exercícios -----
      saveWorkout: (workout) => {
        const id = workout.id ?? createId('treino');
        const exercises = workout.exercises.map((ex, i) => ({
          ...ex,
          id: ex.id ?? `${id}-${createId('ex')}`,
          order: i + 1,
        }));
        const saved = { ...workout, id, exercises, estimatedDuration: estimateDuration(exercises) };
        update('workouts', (list) => {
          const next = list.some((w) => w.id === id) ? list.map((w) => (w.id === id ? saved : w)) : [...list, saved];
          // Só um treino principal por dia: os demais viram alternativos
          return saved.type === 'primary'
            ? next.map((w) => (w.id !== id && w.dayOfWeek === saved.dayOfWeek && w.type === 'primary' ? { ...w, type: 'alternative' } : w))
            : next;
        });
        return saved;
      },
      deleteWorkout: (id) => update('workouts', (list) => list.filter((w) => w.id !== id)),

      addExercise: ({ name, muscleGroup }) => {
        const slug = slugify(name) || 'exercicio';
        const existing = new Set(get().exercises.map((e) => e.id));
        let id = slug;
        for (let n = 2; existing.has(id); n += 1) id = `${slug}-${n}`;
        const exercise = {
          id,
          name: name.trim(),
          muscleGroup,
          type: 'isolation',
          image: `/images/exercises/${id}.jpg`,
          instructions: '',
        };
        update('exercises', (list) => [...list, exercise]);
        return exercise;
      },

      // ----- Execução do treino -----
      startSession: (workoutId) => {
        const { activeSessionId, sessions, workouts } = get();
        const active = sessions.find((s) => s.id === activeSessionId && !s.completed);
        if (active) return active.id;

        const workout = workouts.find((w) => w.id === workoutId);
        if (!workout) return null;
        const session = {
          id: createId('sessao'),
          workoutId: workout.id,
          workoutName: workout.name,
          muscleGroups: workout.muscleGroups,
          // Cópia dos exercícios: o histórico não muda se o treino for editado depois
          exercises: workout.exercises.map(({ id, exerciseId, order, sets, repetitions, repetitionsMax, restTime }) => ({
            id,
            exerciseId,
            order,
            sets,
            repetitions,
            repetitionsMax: repetitionsMax ?? null,
            restTime,
          })),
          cardioMinutes: get().profile.cardioMinutes ?? null,
          cardioDone: false,
          startedAt: new Date().toISOString(),
          finishedAt: null,
          duration: null,
          completed: false,
          currentIndex: 0,
        };
        update('sessions', (list) => [...list, session]);
        update('activeSessionId', () => session.id);
        return session.id;
      },

      /**
       * Cronômetro de descanso. Guarda o horário de término (e não um contador),
       * assim continua correto mesmo com a tela bloqueada ou o app fechado.
       * timer: { endsAt: ISO, duration: segundos, itemId } ou null para encerrar.
       */
      setRestTimer: (sessionId, restTimer) =>
        update('sessions', (list) => list.map((s) => (s.id === sessionId ? { ...s, restTimer } : s))),

      setSessionCardio: (sessionId, cardioDone) =>
        update('sessions', (list) => list.map((s) => (s.id === sessionId ? { ...s, cardioDone } : s))),

      setSessionIndex: (sessionId, currentIndex) =>
        update('sessions', (list) => list.map((s) => (s.id === sessionId ? { ...s, currentIndex } : s))),

      /** Cria ou atualiza o registro de uma série (salvo a cada alteração). */
      updateSet: (sessionId, item, setNumber, patch) =>
        update('records', (list) => {
          const index = list.findIndex(
            (r) => r.sessionId === sessionId && r.itemId === item.id && r.setNumber === setNumber,
          );
          if (index >= 0) {
            const next = [...list];
            next[index] = { ...next[index], ...patch, updatedAt: new Date().toISOString() };
            return next;
          }
          return [
            ...list,
            {
              id: createId('serie'),
              sessionId,
              itemId: item.id,
              exerciseId: item.exerciseId,
              setNumber,
              weight: null,
              repetitions: null,
              completed: false,
              ...patch,
              updatedAt: new Date().toISOString(),
            },
          ];
        }),

      addSessionSet: (sessionId, itemId) =>
        update('sessions', (list) =>
          list.map((s) =>
            s.id === sessionId
              ? { ...s, exercises: s.exercises.map((ex) => (ex.id === itemId ? { ...ex, sets: ex.sets + 1 } : ex)) }
              : s,
          ),
        ),

      finishSession: (sessionId) => {
        const finishedAt = new Date().toISOString();
        update('sessions', (list) =>
          list.map((s) =>
            s.id === sessionId
              ? { ...s, finishedAt, duration: diffInMinutes(s.startedAt, finishedAt), completed: true, restTimer: null }
              : s,
          ),
        );
        // Séries não concluídas não fazem parte do histórico
        update('records', (list) => list.filter((r) => r.sessionId !== sessionId || r.completed));
        update('activeSessionId', () => null);
      },

      /** Remove um treino (em andamento ou do histórico) e suas séries. */
      deleteSession: (sessionId) => {
        update('sessions', (list) => list.filter((s) => s.id !== sessionId));
        update('records', (list) => list.filter((r) => r.sessionId !== sessionId));
        if (get().activeSessionId === sessionId) update('activeSessionId', () => null);
      },
    };
  }, [update]);

  const value = useMemo(
    () => ({ ...state, needsUserSelection: !selectedUser, ...actions }),
    [state, selectedUser, actions],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData deve ser usado dentro de <AppDataProvider>');
  return ctx;
}
