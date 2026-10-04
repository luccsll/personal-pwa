import { toDateKey, parseDate, WEEK_DAYS, getWeekStart } from './date';
import { getWorkoutsForDay } from './workout';

const byDateAsc = (a, b) => new Date(a.startedAt) - new Date(b.startedAt);

export const getCompletedSessions = (sessions) =>
  sessions.filter((s) => s.completed).sort((a, b) => byDateAsc(b, a));

/** Séries concluídas de uma sessão, agrupadas pelo item do treino. */
export function getSessionSets(sessionId, records, itemId) {
  return records
    .filter((r) => r.sessionId === sessionId && (!itemId || r.itemId === itemId))
    .sort((a, b) => a.setNumber - b.setNumber);
}

/**
 * Histórico de um exercício: uma entrada por treino concluído em que ele foi realizado.
 * Ordenado do mais antigo para o mais recente.
 */
export function getExerciseHistory(exerciseId, sessions, records, { excludeSessionId } = {}) {
  const completed = sessions.filter((s) => s.completed && s.id !== excludeSessionId);
  const sessionById = new Map(completed.map((s) => [s.id, s]));
  const grouped = new Map();

  for (const r of records) {
    if (r.exerciseId !== exerciseId || !r.completed || r.weight === null) continue;
    if (!sessionById.has(r.sessionId)) continue;
    if (!grouped.has(r.sessionId)) grouped.set(r.sessionId, []);
    grouped.get(r.sessionId).push(r);
  }

  return [...grouped.entries()]
    .map(([sessionId, sets]) => {
      const session = sessionById.get(sessionId);
      const ordered = [...sets].sort((a, b) => a.setNumber - b.setNumber);
      const top = ordered.reduce((best, s) =>
        s.weight > best.weight || (s.weight === best.weight && (s.repetitions ?? 0) > (best.repetitions ?? 0)) ? s : best,
      );
      return {
        sessionId,
        date: session.startedAt,
        sets: ordered,
        maxWeight: top.weight,
        repsAtMax: top.repetitions,
        lastSet: ordered[ordered.length - 1],
        volume: ordered.reduce((t, s) => t + s.weight * (s.repetitions ?? 0), 0),
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

/** Última execução de um exercício (para sugerir a carga). */
export function getLastPerformance(exerciseId, sessions, records, excludeSessionId) {
  const history = getExerciseHistory(exerciseId, sessions, records, { excludeSessionId });
  return history[history.length - 1] ?? null;
}

export function getExerciseSummary(history) {
  if (!history.length) return null;
  const first = history[0];
  const last = history[history.length - 1];
  const best = history.reduce((b, h) => (h.maxWeight > b.maxWeight ? h : b), first);
  const change = last.maxWeight - first.maxWeight;
  return {
    first,
    last,
    best,
    change,
    changePercent: first.maxWeight > 0 ? (change / first.maxWeight) * 100 : null,
  };
}

/** Maior carga de cada exercício já realizado, do recorde mais recente para o mais antigo. */
export function getPersonalRecords(exercises, sessions, records) {
  return exercises
    .map((exercise) => {
      const summary = getExerciseSummary(getExerciseHistory(exercise.id, sessions, records));
      return summary ? { exercise, weight: summary.best.maxWeight, reps: summary.best.repsAtMax, date: summary.best.date } : null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/** Dias (YYYY-MM-DD) em que algum treino foi concluído. */
export const getTrainedDays = (sessions) =>
  new Set(sessions.filter((s) => s.completed).map((s) => toDateKey(s.startedAt)));

/**
 * Sequência atual: dias de treino consecutivos cumpridos.
 * Dias de descanso programados e o dia de hoje (ainda em aberto) não quebram a sequência.
 */
export function getStreak(sessions, workouts, now = new Date()) {
  const trained = getTrainedDays(sessions);
  if (!trained.size) return 0;
  let streak = 0;
  const day = new Date(now);
  for (let i = 0; i < 366; i += 1) {
    const key = toDateKey(day);
    const isRestDay = getWorkoutsForDay(workouts, day.getDay()).length === 0;
    if (trained.has(key)) streak += 1;
    else if (!isRestDay && i > 0) break;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

/** Situação de cada dia da semana atual (segunda a domingo). */
export function getWeekProgress(sessions, workouts, now = new Date()) {
  const trained = getTrainedDays(sessions);
  const start = parseDate(getWeekStart(now));
  const todayKey = toDateKey(now);
  return WEEK_DAYS.map((d, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = toDateKey(date);
    return {
      ...d,
      key,
      isToday: key === todayKey,
      isPast: key < todayKey,
      done: trained.has(key),
      rest: getWorkoutsForDay(workouts, d.index).length === 0,
    };
  });
}

// ---------- Peso corporal ----------

export const sortBodyWeights = (entries) =>
  [...entries].sort((a, b) => (a.date === b.date ? (a.createdAt ?? '').localeCompare(b.createdAt ?? '') : a.date.localeCompare(b.date)));

export function getBodyWeightStats(entries) {
  if (!entries.length) return null;
  const sorted = sortBodyWeights(entries);
  const weights = sorted.map((e) => e.weight);
  const current = sorted[sorted.length - 1];
  const initial = sorted[0];
  return {
    current,
    initial,
    previous: sorted[sorted.length - 2] ?? null,
    max: Math.max(...weights),
    min: Math.min(...weights),
    change: current.weight - initial.weight,
  };
}

export function calculateBmi(weight, heightCm) {
  if (!weight || !heightCm) return null;
  const h = heightCm / 100;
  return weight / (h * h);
}

export function bmiCategory(bmi) {
  if (bmi === null) return '';
  if (bmi < 18.5) return 'Abaixo do peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  if (bmi < 35) return 'Obesidade grau I';
  if (bmi < 40) return 'Obesidade grau II';
  return 'Obesidade grau III';
}

// ---------- Progressão ----------

/** Execução anterior de um exercício, antes de uma data (ex.: início do treino atual). */
export function getPreviousPerformance(exerciseId, sessions, records, beforeDate, excludeSessionId) {
  const history = getExerciseHistory(exerciseId, sessions, records, { excludeSessionId });
  const before = history.filter((h) => new Date(h.date) < new Date(beforeDate));
  return before[before.length - 1] ?? null;
}

const setScore = (s) => (s.weight ?? 0) * (s.repetitions ?? 0);

/**
 * Compara as séries concluídas com as do treino anterior (mesmo número de série).
 * Retorna 'better' | 'same' | 'worse' ou null quando não há como comparar.
 * Ex.: 30 kg × 8 -> 30 kg × 10 = 'better'.
 */
export function comparePerformance(currentSets, previousSets) {
  if (!previousSets?.length) return null;
  const previousByNumber = new Map(previousSets.map((s) => [s.setNumber, s]));
  const matched = currentSets.filter((s) => s.completed && previousByNumber.has(s.setNumber));
  if (!matched.length) return null;
  const current = matched.reduce((t, s) => t + setScore(s), 0);
  const previous = matched.reduce((t, s) => t + setScore(previousByNumber.get(s.setNumber)), 0);
  if (current > previous) return 'better';
  if (current < previous) return 'worse';
  return 'same';
}

/**
 * Atingiu o topo da faixa de repetições em todas as séries planejadas?
 * Séries registradas com RIR 0 (falha) não contam como "boa execução".
 */
export function reachedTopOfRange(sets, plannedSets, topReps) {
  const completed = sets.filter((s) => s.completed);
  if (!topReps || completed.length < plannedSets) return false;
  return completed.every((s) => (s.repetitions ?? 0) >= topReps && s.rir !== 0);
}

/** Totais de um treino: séries concluídas, exercícios realizados e volume (kg × reps). */
export function getSessionTotals(sessionId, records) {
  const sets = records.filter((r) => r.sessionId === sessionId && r.completed);
  return {
    sets: sets.length,
    exercises: new Set(sets.map((s) => s.itemId)).size,
    volume: sets.reduce((t, s) => t + setScore(s), 0),
  };
}

/** Último treino concluído do mesmo modelo antes deste. */
export function getPreviousSession(session, sessions) {
  return (
    sessions
      .filter(
        (s) =>
          s.completed &&
          s.id !== session.id &&
          s.workoutId === session.workoutId &&
          new Date(s.startedAt) < new Date(session.startedAt),
      )
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0] ?? null
  );
}
