// Divisão Push / Pull / Legs (PPL) — cada grupo 2x por semana.
// dayOfWeek segue o padrão do JavaScript: 0 = domingo, 1 = segunda ... 6 = sábado.
// Domingo não tem treino: é dia de descanso.
//
// Cada item do treino define séries, faixa de repetições (repetitions → repetitionsMax)
// e descanso em segundos. Tudo pode ser editado depois pela tela "Editar treino".
// Lucas e Anthony treinam juntos: a musculação é a mesma e o Anthony
// tem exercícios extras de abdômen nos dias de pernas.

import { estimateDuration } from '@/utils/workout';

const item = (exerciseId, sets, repetitions, repetitionsMax, restTime) => ({
  exerciseId,
  sets,
  repetitions,
  repetitionsMax,
  restTime,
});

const workout = (id, name, dayOfWeek, timeOfDay, muscleGroups, items) => {
  const exercises = items.map((it, index) => ({ id: `${id}-${index + 1}`, order: index + 1, ...it }));
  return {
    id,
    name,
    dayOfWeek,
    timeOfDay,
    muscleGroups,
    type: 'primary',
    estimatedDuration: estimateDuration(exercises),
    exercises,
  };
};

// Descanso dos exercícios de abdômen (não especificado no plano)
const ABS_REST = 60;

function buildWorkouts({ withAbs = false } = {}) {
  const legsAbs = withAbs ? ['Abdômen'] : [];
  return [
    workout('push-a', 'Push A — Peito, Ombros e Tríceps', 1, 'Noite', ['Peito', 'Ombros', 'Tríceps'], [
      item('supino-reto', 4, 6, 10, 150),
      item('supino-inclinado-halteres', 3, 8, 12, 120),
      item('crucifixo-maquina', 3, 10, 15, 90),
      item('desenvolvimento-halteres', 3, 8, 12, 120),
      item('elevacao-lateral', 3, 12, 15, 75),
      item('triceps-pulley-corda', 3, 10, 15, 75),
      item('triceps-frances', 2, 10, 15, 75),
    ]),
    workout('pull-a', 'Pull A — Costas e Bíceps', 2, 'Noite', ['Costas', 'Bíceps'], [
      item('puxada-frontal', 4, 8, 12, 120),
      item('remada-baixa', 3, 8, 12, 120),
      item('remada-unilateral', 3, 8, 12, 90),
      item('pulldown', 2, 12, 15, 75),
      item('face-pull', 3, 12, 15, 75),
      item('rosca-direta', 3, 8, 12, 90),
      item('rosca-martelo', 3, 10, 12, 75),
    ]),
    workout('legs-a', 'Legs A — Pernas', 3, 'Noite', ['Pernas', ...legsAbs], [
      item('agachamento', 4, 6, 10, 180),
      item('leg-press', 3, 8, 12, 120),
      item('cadeira-extensora', 3, 10, 15, 75),
      item('stiff', 3, 8, 12, 120),
      item('mesa-flexora', 3, 10, 15, 75),
      item('panturrilha-em-pe', 4, 10, 15, 75),
      ...(withAbs ? [item('maquina-abdominal', 3, 10, 15, ABS_REST), item('elevacao-pernas', 3, 10, 15, ABS_REST)] : []),
    ]),
    workout('push-b', 'Push B — Peito, Ombros e Tríceps', 4, 'Noite', ['Peito', 'Ombros', 'Tríceps'], [
      item('supino-inclinado', 4, 6, 10, 150),
      item('supino-reto-halteres', 3, 8, 12, 120),
      item('crossover', 3, 10, 15, 75),
      item('desenvolvimento-maquina', 3, 8, 12, 120),
      item('elevacao-lateral-polia', 3, 12, 15, 75),
      item('triceps-testa', 3, 8, 12, 90),
      item('triceps-corda', 2, 12, 15, 75),
    ]),
    workout('pull-b', 'Pull B — Costas e Bíceps', 5, 'Noite', ['Costas', 'Bíceps'], [
      item('barra-fixa', 4, 6, 10, 150),
      item('remada-articulada', 3, 8, 12, 120),
      item('remada-unilateral-maquina', 3, 10, 12, 90),
      item('pullover-maquina', 2, 10, 15, 75),
      item('crucifixo-inverso', 3, 12, 15, 75),
      item('rosca-scott', 3, 8, 12, 90),
      item('rosca-alternada', 3, 10, 12, 75),
    ]),
    workout('legs-b', 'Legs B — Pernas', 6, 'Manhã', ['Pernas', ...legsAbs], [
      item('hack-squat', 4, 8, 12, 120),
      item('leg-press', 3, 10, 15, 120),
      item('cadeira-extensora', 3, 12, 15, 75),
      item('stiff-halteres', 3, 8, 12, 120),
      item('cadeira-flexora', 3, 10, 15, 75),
      item('elevacao-pelvica', 3, 8, 12, 120),
      item('panturrilha-sentado', 4, 12, 15, 75),
      ...(withAbs ? [item('maquina-abdominal', 3, 10, 15, ABS_REST), item('prancha', 3, 30, 60, ABS_REST)] : []),
    ]),
  ];
}

export const lucasWorkouts = buildWorkouts();
export const anthonyWorkouts = buildWorkouts({ withAbs: true });

/** @deprecated mantido por compatibilidade: treinos do Lucas */
export const initialWorkouts = lucasWorkouts;
