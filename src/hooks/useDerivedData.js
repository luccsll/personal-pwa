import { useMemo } from 'react';
import { useAppData } from './useAppData';
import { getSelectedWorkout } from '@/utils/workout';
import { getBodyWeightStats, getCompletedSessions } from '@/utils/stats';

/** Mapa id -> exercício do catálogo. */
export function useExerciseMap() {
  const { exercises } = useAppData();
  return useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
}

/** Treino do dia de hoje (considerando a troca por alternativo). */
export function useTodayWorkout() {
  const { workouts, weekSelection } = useAppData();
  const today = new Date().getDay();
  return useMemo(() => getSelectedWorkout(workouts, today, weekSelection), [workouts, today, weekSelection]);
}

/** Treino em andamento, se houver. */
export function useActiveSession() {
  const { sessions, activeSessionId } = useAppData();
  return useMemo(
    () => sessions.find((s) => s.id === activeSessionId && !s.completed) ?? null,
    [sessions, activeSessionId],
  );
}

export function useCompletedSessions() {
  const { sessions } = useAppData();
  return useMemo(() => getCompletedSessions(sessions), [sessions]);
}

export function useBodyWeightStats() {
  const { bodyWeights } = useAppData();
  return useMemo(() => getBodyWeightStats(bodyWeights), [bodyWeights]);
}
