// Camada única de persistência do app.
// Nenhum componente acessa o localStorage diretamente: tudo passa por aqui.
// Para migrar para uma API no futuro, basta reimplementar estas funções
// mantendo as mesmas assinaturas (ou versões assíncronas delas).

import { DATA_VERSION, initialData } from '@/data/initialData';

export const STORAGE_KEYS = {
  profile: 'myworkout_profile',
  workouts: 'myworkout_workouts',
  exercises: 'myworkout_exercises',
  sessions: 'myworkout_sessions',
  records: 'myworkout_records',
  bodyWeight: 'myworkout_body_weight',
  activeSession: 'myworkout_active_session',
  weekSelection: 'myworkout_week_selection',
  dataVersion: 'myworkout_data_version',
};

// ---------- Acesso de baixo nível ----------

function read(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function write(key, value) {
  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    console.error(`[storage] Falha ao salvar "${key}"`, error);
    return false;
  }
}

// ---------- Validação ----------

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isString = (v) => typeof v === 'string' && v.length > 0;
const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const toNumberOrNull = (v) => (isNumber(v) ? v : null);

const validators = {
  profile: (p) =>
    isObject(p)
      ? {
          name: typeof p.name === 'string' ? p.name : initialData.profile.name,
          height: toNumberOrNull(p.height),
          goal: typeof p.goal === 'string' ? p.goal : null,
        }
      : null,

  exercise: (e) =>
    isObject(e) && isString(e.id) && isString(e.name)
      ? {
          ...e,
          muscleGroup: typeof e.muscleGroup === 'string' ? e.muscleGroup : '',
          image: typeof e.image === 'string' ? e.image : '',
          instructions: typeof e.instructions === 'string' ? e.instructions : '',
        }
      : null,

  workout: (w) =>
    isObject(w) && isString(w.id) && isString(w.name) && Array.isArray(w.exercises)
      ? {
          ...w,
          dayOfWeek: isNumber(w.dayOfWeek) ? w.dayOfWeek : null,
          muscleGroups: Array.isArray(w.muscleGroups) ? w.muscleGroups.filter(isString) : [],
          type: w.type === 'alternative' ? 'alternative' : 'primary',
          exercises: w.exercises
            .filter((x) => isObject(x) && isString(x.exerciseId))
            .map((x, i) => ({
              ...x,
              id: isString(x.id) ? x.id : `${w.id}-${i + 1}`,
              order: isNumber(x.order) ? x.order : i + 1,
              sets: isNumber(x.sets) && x.sets > 0 ? x.sets : 3,
              repetitions: isNumber(x.repetitions) ? x.repetitions : 10,
              repetitionsMax: isNumber(x.repetitionsMax) && x.repetitionsMax >= x.repetitions ? x.repetitionsMax : null,
              restTime: isNumber(x.restTime) ? x.restTime : 90,
            }))
            .sort((a, b) => a.order - b.order),
        }
      : null,

  session: (s) =>
    isObject(s) && isString(s.id) && isString(s.startedAt) && Array.isArray(s.exercises)
      ? { ...s, completed: Boolean(s.completed) }
      : null,

  record: (r) =>
    isObject(r) && isString(r.id) && isString(r.sessionId) && isString(r.exerciseId) && isNumber(r.setNumber)
      ? {
          ...r,
          weight: toNumberOrNull(r.weight),
          repetitions: toNumberOrNull(r.repetitions),
          rir: toNumberOrNull(r.rir),
          completed: Boolean(r.completed),
        }
      : null,

  bodyWeight: (b) =>
    isObject(b) && isString(b.id) && isNumber(b.weight) && isString(b.date) ? b : null,
};

function readList(key, validate, fallback) {
  const value = read(key);
  if (!Array.isArray(value)) return fallback;
  return value.map(validate).filter(Boolean);
}

// ---------- Inicialização ----------

/** Grava os dados iniciais (treinos e exercícios) na primeira execução. */
export function initializeStorage() {
  const isFirstRun = read(STORAGE_KEYS.workouts) === undefined;
  if (read(STORAGE_KEYS.profile) === undefined) write(STORAGE_KEYS.profile, initialData.profile);
  if (read(STORAGE_KEYS.exercises) === undefined) write(STORAGE_KEYS.exercises, initialData.exercises);
  if (read(STORAGE_KEYS.workouts) === undefined) write(STORAGE_KEYS.workouts, initialData.workouts);
  if (read(STORAGE_KEYS.sessions) === undefined) write(STORAGE_KEYS.sessions, initialData.sessions);
  if (read(STORAGE_KEYS.records) === undefined) write(STORAGE_KEYS.records, initialData.records);
  if (read(STORAGE_KEYS.bodyWeight) === undefined) write(STORAGE_KEYS.bodyWeight, initialData.bodyWeight);

  const version = read(STORAGE_KEYS.dataVersion);
  if (!isFirstRun && (!isNumber(version) || version < DATA_VERSION)) migrateSeedData();
  write(STORAGE_KEYS.dataVersion, DATA_VERSION);
}

/**
 * Atualiza treinos e exercícios para a versão atual dos dados iniciais,
 * preservando histórico, séries registradas, peso corporal e perfil.
 */
function migrateSeedData() {
  const sessions = readList(STORAGE_KEYS.sessions, validators.session, []);
  const records = readList(STORAGE_KEYS.records, validators.record, []);
  const usedIds = new Set([
    ...records.map((r) => r.exerciseId),
    ...sessions.flatMap((s) => s.exercises.map((e) => e.exerciseId)),
  ]);
  const seedIds = new Set(initialData.exercises.map((e) => e.id));
  // Exercícios antigos só são mantidos se fizerem parte do histórico
  const legacy = readList(STORAGE_KEYS.exercises, validators.exercise, []).filter(
    (e) => !seedIds.has(e.id) && usedIds.has(e.id),
  );

  write(STORAGE_KEYS.exercises, [...initialData.exercises, ...legacy]);
  write(STORAGE_KEYS.workouts, initialData.workouts);
  write(STORAGE_KEYS.weekSelection, null);

  const profile = validators.profile(read(STORAGE_KEYS.profile));
  if (profile && !profile.goal) write(STORAGE_KEYS.profile, { ...profile, goal: initialData.profile.goal });
}

// ---------- Dados pessoais ----------

export const getProfile = () => validators.profile(read(STORAGE_KEYS.profile)) ?? { ...initialData.profile };
export const saveProfile = (profile) => write(STORAGE_KEYS.profile, profile);

// ---------- Exercícios ----------

export const getExercises = () => readList(STORAGE_KEYS.exercises, validators.exercise, initialData.exercises);
export const saveExercises = (exercises) => write(STORAGE_KEYS.exercises, exercises);

// ---------- Treinos ----------

export const getWorkouts = () => readList(STORAGE_KEYS.workouts, validators.workout, initialData.workouts);
export const saveWorkouts = (workouts) => write(STORAGE_KEYS.workouts, workouts);

// ---------- Histórico (sessões e séries registradas) ----------

export const getSessions = () => readList(STORAGE_KEYS.sessions, validators.session, []);
export const saveSessions = (sessions) => write(STORAGE_KEYS.sessions, sessions);

export const getRecords = () => readList(STORAGE_KEYS.records, validators.record, []);
export const saveRecords = (records) => write(STORAGE_KEYS.records, records);

/** Id do treino em andamento (permite retomar após recarregar a página). */
export const getActiveSessionId = () => {
  const id = read(STORAGE_KEYS.activeSession);
  return isString(id) ? id : null;
};
export const saveActiveSessionId = (id) => write(STORAGE_KEYS.activeSession, id);

// ---------- Escolha de treino alternativo na semana ----------

export const getWeekSelection = () => {
  const value = read(STORAGE_KEYS.weekSelection);
  return isObject(value) && isString(value.weekStart) && isObject(value.choices) ? value : null;
};
export const saveWeekSelection = (selection) => write(STORAGE_KEYS.weekSelection, selection);

// ---------- Peso corporal ----------

export const getBodyWeights = () => readList(STORAGE_KEYS.bodyWeight, validators.bodyWeight, []);
export const saveBodyWeights = (entries) => write(STORAGE_KEYS.bodyWeight, entries);

/** Carrega todos os dados do app de uma vez. */
export function loadAll() {
  initializeStorage();
  return {
    profile: getProfile(),
    exercises: getExercises(),
    workouts: getWorkouts(),
    sessions: getSessions(),
    records: getRecords(),
    bodyWeights: getBodyWeights(),
    activeSessionId: getActiveSessionId(),
    weekSelection: getWeekSelection(),
  };
}
