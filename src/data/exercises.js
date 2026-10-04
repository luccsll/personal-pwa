// Catálogo inicial de exercícios.
// A imagem de cada exercício fica em public/images/exercises/<id>.jpg.
// Se o arquivo não existir, o app usa automaticamente a imagem padrão.

const IMAGE_BASE = '/images/exercises/';

const exercise = (id, name, muscleGroup, instructions, extra = {}) => ({
  id,
  name,
  muscleGroup,
  image: `${IMAGE_BASE}${id}.jpg`,
  instructions,
  sets: 3,
  repetitions: 10,
  restTime: 90,
  ...extra,
});

export const initialExercises = [
  // Peito
  exercise('supino-reto', 'Supino reto', 'Peito', 'Deite no banco, mantenha os pés apoiados e realize o movimento de forma controlada.', { sets: 4 }),
  exercise('supino-inclinado', 'Supino inclinado', 'Peito', 'Banco entre 30° e 45°. Desça a barra até a parte alta do peito e empurre sem travar os cotovelos.'),
  exercise('supino-reto-halteres', 'Supino reto com halteres', 'Peito', 'Desça os halteres alinhados ao peito, cotovelos a cerca de 45° do tronco.'),
  exercise('crucifixo', 'Crucifixo', 'Peito', 'Cotovelos levemente flexionados, abra os braços em arco e retorne contraindo o peito.', { repetitions: 12 }),
  exercise('crossover', 'Crossover', 'Peito', 'Puxe os cabos em arco à frente do corpo, mantendo o tronco levemente inclinado.', { repetitions: 12 }),
  exercise('paralelas', 'Paralelas', 'Peito', 'Incline o tronco à frente e desça até os cotovelos formarem 90°.'),

  // Tríceps
  exercise('triceps-pulley', 'Tríceps pulley', 'Tríceps', 'Cotovelos colados ao corpo. Estenda os braços totalmente e retorne devagar.', { sets: 4 }),
  exercise('triceps-frances', 'Tríceps francês', 'Tríceps', 'Halter atrás da cabeça, cotovelos apontados para cima. Estenda os braços sem abrir os cotovelos.'),
  exercise('triceps-corda', 'Tríceps corda', 'Tríceps', 'Estenda os braços e afaste as pontas da corda no final do movimento.', { repetitions: 12 }),

  // Costas
  exercise('puxada-frontal', 'Puxada frontal', 'Costas', 'Puxe a barra até a parte alta do peito, levando os cotovelos para baixo e para trás.', { sets: 4 }),
  exercise('remada-baixa', 'Remada baixa', 'Costas', 'Coluna neutra. Puxe o triângulo até o abdômen, aproximando as escápulas.', { sets: 4 }),
  exercise('remada-curvada', 'Remada curvada', 'Costas', 'Tronco inclinado à frente, puxe a barra em direção ao umbigo.'),
  exercise('remada-unilateral', 'Remada unilateral', 'Costas', 'Apoie joelho e mão no banco. Puxe o halter levando o cotovelo para trás.'),
  exercise('pulldown', 'Pulldown', 'Costas', 'Braços estendidos, puxe a barra até as coxas mantendo os cotovelos quase retos.', { repetitions: 12 }),

  // Bíceps
  exercise('rosca-direta', 'Rosca direta', 'Bíceps', 'Cotovelos fixos ao lado do corpo. Suba a barra sem balançar o tronco.'),
  exercise('rosca-martelo', 'Rosca martelo', 'Bíceps', 'Pegada neutra. Suba os halteres alternando ou simultaneamente.', { repetitions: 12 }),
  exercise('rosca-alternada', 'Rosca alternada', 'Bíceps', 'Gire o punho durante a subida e controle a descida.'),

  // Pernas
  exercise('agachamento', 'Agachamento', 'Pernas', 'Pés na largura dos ombros. Desça com o quadril para trás mantendo a coluna neutra.', { sets: 4, restTime: 120 }),
  exercise('leg-press', 'Leg press', 'Pernas', 'Desça até os joelhos formarem 90° e empurre sem travar os joelhos.', { sets: 4, repetitions: 12, restTime: 120 }),
  exercise('cadeira-extensora', 'Cadeira extensora', 'Pernas', 'Estenda as pernas totalmente e segure 1 segundo no topo.', { repetitions: 12 }),
  exercise('cadeira-flexora', 'Cadeira flexora', 'Pernas', 'Flexione os joelhos levando os calcanhares em direção ao glúteo.', { repetitions: 12 }),
  exercise('stiff', 'Stiff', 'Pernas', 'Joelhos levemente flexionados. Desça a barra rente às pernas levando o quadril para trás.'),
  exercise('afundo', 'Afundo', 'Pernas', 'Dê um passo à frente e desça até o joelho de trás quase tocar o chão.'),
  exercise('panturrilha', 'Panturrilha em pé', 'Pernas', 'Suba na ponta dos pés o máximo possível e desça alongando.', { sets: 4, repetitions: 15, restTime: 60 }),

  // Ombros
  exercise('desenvolvimento', 'Desenvolvimento', 'Ombros', 'Empurre os halteres acima da cabeça sem arquear a lombar.', { sets: 4 }),
  exercise('elevacao-lateral', 'Elevação lateral', 'Ombros', 'Eleve os braços lateralmente até a altura dos ombros, cotovelos levemente flexionados.', { sets: 4, repetitions: 12, restTime: 60 }),
  exercise('elevacao-frontal', 'Elevação frontal', 'Ombros', 'Eleve os halteres à frente até a linha dos ombros, sem balançar.', { repetitions: 12, restTime: 60 }),
  exercise('crucifixo-inverso', 'Crucifixo inverso', 'Ombros', 'Tronco inclinado, abra os braços focando na parte posterior do ombro.', { repetitions: 12, restTime: 60 }),
];
