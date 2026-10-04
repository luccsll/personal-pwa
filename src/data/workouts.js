// Treinos iniciais da semana.
// dayOfWeek segue o padrão do JavaScript: 0 = domingo, 1 = segunda ... 6 = sábado.
// Dias sem treino são considerados descanso.

const item = (exerciseId, sets, repetitions, restTime = 90) => ({ exerciseId, sets, repetitions, restTime });

const workout = (id, name, dayOfWeek, muscleGroups, type, estimatedDuration, items) => ({
  id,
  name,
  dayOfWeek,
  muscleGroups,
  type,
  estimatedDuration,
  exercises: items.map((it, index) => ({ id: `${id}-${index + 1}`, order: index + 1, ...it })),
});

export const initialWorkouts = [
  workout('peito-triceps-a', 'Peito + Tríceps', 1, ['Peito', 'Tríceps'], 'primary', 50, [
    item('supino-reto', 4, 10),
    item('supino-inclinado', 3, 10),
    item('crucifixo', 3, 12),
    item('crossover', 3, 12),
    item('triceps-pulley', 4, 10),
    item('triceps-frances', 3, 10),
  ]),
  workout('peito-triceps-b', 'Peito + Tríceps Alternativo', 1, ['Peito', 'Tríceps'], 'alternative', 45, [
    item('supino-reto-halteres', 4, 10),
    item('supino-inclinado', 3, 10),
    item('crossover', 3, 15),
    item('paralelas', 3, 10),
    item('triceps-corda', 3, 12),
  ]),
  workout('costas-biceps-a', 'Costas + Bíceps', 2, ['Costas', 'Bíceps'], 'primary', 50, [
    item('puxada-frontal', 4, 10),
    item('remada-baixa', 4, 10),
    item('remada-curvada', 3, 10),
    item('pulldown', 3, 12),
    item('rosca-direta', 3, 10),
    item('rosca-martelo', 3, 12),
  ]),
  workout('costas-biceps-b', 'Costas + Bíceps Alternativo', 2, ['Costas', 'Bíceps'], 'alternative', 45, [
    item('puxada-frontal', 4, 10),
    item('remada-unilateral', 3, 10),
    item('pulldown', 3, 12),
    item('rosca-alternada', 3, 10),
    item('rosca-martelo', 3, 12),
  ]),
  workout('pernas-a', 'Pernas', 3, ['Pernas'], 'primary', 55, [
    item('agachamento', 4, 10, 120),
    item('leg-press', 4, 12, 120),
    item('cadeira-extensora', 3, 12),
    item('cadeira-flexora', 3, 12),
    item('stiff', 3, 10),
    item('panturrilha', 4, 15, 60),
  ]),
  workout('ombros-triceps-a', 'Ombros + Tríceps', 5, ['Ombros', 'Tríceps'], 'primary', 50, [
    item('desenvolvimento', 4, 10),
    item('elevacao-lateral', 4, 12, 60),
    item('elevacao-frontal', 3, 12, 60),
    item('crucifixo-inverso', 3, 12, 60),
    item('triceps-pulley', 3, 12),
    item('triceps-frances', 3, 10),
  ]),
  workout('pernas-b', 'Pernas', 6, ['Pernas'], 'primary', 50, [
    item('leg-press', 4, 12, 120),
    item('afundo', 3, 10),
    item('cadeira-extensora', 3, 12),
    item('cadeira-flexora', 3, 12),
    item('stiff', 3, 10),
    item('panturrilha', 4, 15, 60),
  ]),
];
