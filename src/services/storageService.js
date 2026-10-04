// Camada única de persistência do app.
// Nenhum componente acessa o localStorage diretamente: tudo passa por aqui.
// Para migrar para uma API no futuro, basta reimplementar estas funções
// mantendo as mesmas assinaturas (ou versões assíncronas delas).

import { DATA_VERSION, getInitialData } from '@/data/initialData';
import { DEFAULT_USER, isValidUser } from '@/data/users';

// Cada usuário (Lucas, Anthony) tem seus próprios dados:
// myworkout_<usuario>_<dado>, ex.: myworkout_lucas_records, myworkout_anthony_records.
const DATA_KEYS = {
  profile: 'profile',
  workouts: 'workouts',
  exercises: 'exercises',
  sessions: 'sessions',
  records: 'records',
  bodyWeight: 'body_weight',
  activeSession: 'active_session',
  weekSelection: 'week_selection',
  dataVersion: 'data_version',
};

/** Usuário escolhido na tela "Quem está treinando hoje?" (guardado no aparelho). */
export const SELECTED_USER_KEY = 'selectedUser';

let currentUser = DEFAULT_USER;

const STORAGE_KEYS = new Proxy(DATA_KEYS, {
  get: (keys, name) => `myworkout_${currentUser}_${keys[name]}`,
});

/** Chaves da versão de um usuário só (antes de existir o Anthony) — migradas para o Lucas. */
const legacyKey = (name) => `myworkout_${DATA_KEYS[name]}`;

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
          name: typeof p.name === 'string' ? p.name : seed().profile.name,
          age: toNumberOrNull(p.age),
          height: toNumberOrNull(p.height),
          goal: typeof p.goal === 'string' ? p.goal : null,
          focus: typeof p.focus === 'string' ? p.focus : '',
          cardioMinutes: toNumberOrNull(p.cardioMinutes),
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

// ---------- Usuário ativo ----------

export function getSelectedUser() {
  const id = readRaw(SELECTED_USER_KEY);
  return isValidUser(id) ? id : null;
}

export function saveSelectedUser(id) {
  try {
    // Valor simples ("lucas" / "anthony"), sem JSON
    window.localStorage.setItem(SELECTED_USER_KEY, id);
  } catch (error) {
    console.error('[storage] Falha ao salvar o usuário', error);
  }
}

/** Define de qual usuário os dados serão lidos/gravados a partir de agora. */
export function setActiveUser(id) {
  currentUser = isValidUser(id) ? id : DEFAULT_USER;
}

function readRaw(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

const seed = () => getInitialData(currentUser);

// ---------- Inicialização ----------

/** Copia os dados da versão de um usuário só para o Lucas (uma única vez). */
function migrateLegacyToLucas() {
  if (currentUser !== 'lucas' || read(STORAGE_KEYS.workouts) !== undefined) return;
  if (read(legacyKey('workouts')) === undefined) return;
  for (const name of Object.keys(DATA_KEYS)) {
    const value = read(legacyKey(name));
    if (value !== undefined) write(STORAGE_KEYS[name], value);
    write(legacyKey(name), null);
  }
}

/** Grava os dados iniciais do usuário ativo no primeiro acesso dele. */
export function initializeStorage() {
  migrateLegacyToLucas();
  const initial = seed();
  const isFirstRun = read(STORAGE_KEYS.workouts) === undefined;
  if (read(STORAGE_KEYS.profile) === undefined) write(STORAGE_KEYS.profile, initial.profile);
  if (read(STORAGE_KEYS.exercises) === undefined) write(STORAGE_KEYS.exercises, initial.exercises);
  if (read(STORAGE_KEYS.workouts) === undefined) write(STORAGE_KEYS.workouts, initial.workouts);
  if (read(STORAGE_KEYS.sessions) === undefined) write(STORAGE_KEYS.sessions, initial.sessions);
  if (read(STORAGE_KEYS.records) === undefined) write(STORAGE_KEYS.records, initial.records);
  if (read(STORAGE_KEYS.bodyWeight) === undefined) write(STORAGE_KEYS.bodyWeight, initial.bodyWeight);

  const version = read(STORAGE_KEYS.dataVersion);
  if (!isFirstRun) {
    if (!isNumber(version) || version < 2) migrateSeedData();
    if (!isNumber(version) || version < 3) migrateProfileFields();
  }
  write(STORAGE_KEYS.dataVersion, DATA_VERSION);
}

/**
 * v2: troca treinos e exercícios pelos dados iniciais (PPL),
 * preservando histórico, séries registradas, peso corporal e perfil.
 */
function migrateSeedData() {
  const initial = seed();
  const sessions = readList(STORAGE_KEYS.sessions, validators.session, []);
  const records = readList(STORAGE_KEYS.records, validators.record, []);
  const usedIds = new Set([
    ...records.map((r) => r.exerciseId),
    ...sessions.flatMap((s) => s.exercises.map((e) => e.exerciseId)),
  ]);
  const seedIds = new Set(initial.exercises.map((e) => e.id));
  // Exercícios antigos só são mantidos se fizerem parte do histórico
  const legacy = readList(STORAGE_KEYS.exercises, validators.exercise, []).filter(
    (e) => !seedIds.has(e.id) && usedIds.has(e.id),
  );

  write(STORAGE_KEYS.exercises, [...initial.exercises, ...legacy]);
  write(STORAGE_KEYS.workouts, initial.workouts);
  write(STORAGE_KEYS.weekSelection, null);

  const profile = validators.profile(read(STORAGE_KEYS.profile));
  if (profile && !profile.goal) write(STORAGE_KEYS.profile, { ...profile, goal: initial.profile.goal });
}

/** v3: novos campos do perfil (idade, foco, minutos de cardio). Treinos não são alterados. */
function migrateProfileFields() {
  const initial = seed();
  const profile = validators.profile(read(STORAGE_KEYS.profile));
  if (!profile) return;
  write(STORAGE_KEYS.profile, {
    ...profile,
    cardioMinutes: profile.cardioMinutes ?? initial.profile.cardioMinutes,
  });
}

// ---------- Dados pessoais ----------

export const getProfile = () => validators.profile(read(STORAGE_KEYS.profile)) ?? { ...seed().profile };
export const saveProfile = (profile) => write(STORAGE_KEYS.profile, profile);

// ---------- Exercícios ----------

export const getExercises = () => readList(STORAGE_KEYS.exercises, validators.exercise, seed().exercises);
export const saveExercises = (exercises) => write(STORAGE_KEYS.exercises, exercises);

// ---------- Treinos ----------

export const getWorkouts = () => readList(STORAGE_KEYS.workouts, validators.workout, seed().workouts);
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

/** Carrega todos os dados de um usuário de uma vez. */
export function loadAll(userId = currentUser) {
  setActiveUser(userId);
  initializeStorage();
  return {
    userId: currentUser,
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
