// Catálogo de exercícios do treino PPL (hipertrofia).
// A imagem de cada exercício fica em public/images/exercises/<id>.jpg.
// Se o arquivo não existir, o app usa automaticamente a imagem padrão.
//
// type: 'compound' (multiarticular) ou 'isolation' (isolador) — usado na recomendação de RIR.

const IMAGE_BASE = '/images/exercises/';

const exercise = (id, name, muscleGroup, type, instructions) => ({
  id,
  name,
  muscleGroup,
  type,
  image: `${IMAGE_BASE}${id}.jpg`,
  instructions,
});

export const initialExercises = [
  // ---------- Peito ----------
  exercise('supino-reto', 'Supino reto com barra', 'Peito', 'compound',
    'Deite no banco com os pés apoiados e escápulas retraídas. Desça a barra até o meio do peito e empurre de forma controlada.'),
  exercise('supino-inclinado-halteres', 'Supino inclinado com halteres', 'Peito', 'compound',
    'Banco entre 30° e 45°. Desça os halteres alinhados à parte alta do peito e empurre sem bater um no outro.'),
  exercise('crucifixo-maquina', 'Crucifixo na máquina', 'Peito', 'isolation',
    'Cotovelos levemente flexionados. Feche os braços contraindo o peito e retorne devagar, sentindo o alongamento.'),
  exercise('supino-inclinado', 'Supino inclinado com barra', 'Peito', 'compound',
    'Banco entre 30° e 45°. Desça a barra até a parte alta do peito e empurre sem travar os cotovelos.'),
  exercise('supino-reto-halteres', 'Supino reto com halteres', 'Peito', 'compound',
    'Desça os halteres alinhados ao peito, cotovelos a cerca de 45° do tronco, e empurre de forma controlada.'),
  exercise('crossover', 'Crossover', 'Peito', 'isolation',
    'Tronco levemente inclinado à frente. Puxe os cabos em arco até as mãos se encontrarem à frente do corpo.'),

  // ---------- Ombros ----------
  exercise('desenvolvimento-halteres', 'Desenvolvimento com halteres', 'Ombros', 'compound',
    'Sentado com apoio nas costas. Empurre os halteres acima da cabeça sem arquear a lombar.'),
  exercise('elevacao-lateral', 'Elevação lateral', 'Ombros', 'isolation',
    'Eleve os braços lateralmente até a altura dos ombros, cotovelos levemente flexionados, sem balançar o tronco.'),
  exercise('desenvolvimento-maquina', 'Desenvolvimento na máquina', 'Ombros', 'compound',
    'Ajuste o banco para as pegadas ficarem na altura dos ombros. Empurre para cima e desça controlando.'),
  exercise('elevacao-lateral-polia', 'Elevação lateral na máquina ou polia', 'Ombros', 'isolation',
    'Eleve o braço lateralmente até a linha do ombro, mantendo a tensão constante do cabo ou da máquina.'),
  exercise('face-pull', 'Face pull', 'Ombro posterior', 'isolation',
    'Corda na altura do rosto. Puxe em direção à testa abrindo os cotovelos e girando os ombros para fora.'),
  exercise('crucifixo-inverso', 'Crucifixo inverso', 'Ombro posterior', 'isolation',
    'Tronco inclinado ou na máquina. Abra os braços focando na parte posterior do ombro, sem usar impulso.'),

  // ---------- Tríceps ----------
  exercise('triceps-pulley-corda', 'Tríceps pulley com corda', 'Tríceps', 'isolation',
    'Cotovelos colados ao corpo. Estenda os braços e afaste as pontas da corda no final do movimento.'),
  exercise('triceps-frances', 'Tríceps francês', 'Tríceps', 'isolation',
    'Halter atrás da cabeça, cotovelos apontados para cima. Estenda os braços sem abrir os cotovelos.'),
  exercise('triceps-testa', 'Tríceps testa', 'Tríceps', 'isolation',
    'Deitado, desça a barra em direção à testa flexionando só os cotovelos e estenda de volta.'),
  exercise('triceps-corda', 'Tríceps corda', 'Tríceps', 'isolation',
    'Cotovelos fixos. Estenda os braços totalmente e abra a corda no final, controlando a volta.'),

  // ---------- Costas ----------
  exercise('puxada-frontal', 'Puxada frontal', 'Costas', 'compound',
    'Puxe a barra até a parte alta do peito, levando os cotovelos para baixo e para trás.'),
  exercise('remada-baixa', 'Remada baixa', 'Costas', 'compound',
    'Coluna neutra. Puxe o triângulo até o abdômen, aproximando as escápulas.'),
  exercise('remada-unilateral', 'Remada unilateral com halter', 'Costas', 'compound',
    'Apoie joelho e mão no banco. Puxe o halter levando o cotovelo para trás, em direção ao quadril.'),
  exercise('pulldown', 'Pulldown com braços estendidos', 'Costas', 'isolation',
    'Braços quase estendidos, puxe a barra ou corda até as coxas contraindo as costas.'),
  exercise('barra-fixa', 'Barra fixa ou puxada alta', 'Costas', 'compound',
    'Pegada um pouco mais aberta que os ombros. Suba levando o peito em direção à barra, desça controlando.'),
  exercise('remada-articulada', 'Remada articulada ou máquina', 'Costas', 'compound',
    'Peito apoiado. Puxe as pegadas levando os cotovelos para trás e contraia as escápulas.'),
  exercise('remada-unilateral-maquina', 'Remada unilateral na máquina', 'Costas', 'compound',
    'Um braço por vez. Puxe a pegada até a lateral do tronco e controle a volta alongando as costas.'),
  exercise('pullover-maquina', 'Pullover na máquina', 'Costas', 'isolation',
    'Leve os braços em arco de cima para baixo, focando na contração do latíssimo.'),

  // ---------- Bíceps ----------
  exercise('rosca-direta', 'Rosca direta', 'Bíceps', 'isolation',
    'Cotovelos fixos ao lado do corpo. Suba a barra sem balançar o tronco e desça devagar.'),
  exercise('rosca-martelo', 'Rosca martelo', 'Bíceps', 'isolation',
    'Pegada neutra. Suba os halteres sem mover os cotovelos e controle a descida.'),
  exercise('rosca-scott', 'Rosca Scott', 'Bíceps', 'isolation',
    'Braços apoiados no banco Scott. Suba contraindo o bíceps e desça até quase estender os braços.'),
  exercise('rosca-alternada', 'Rosca alternada', 'Bíceps', 'isolation',
    'Alterne os braços, girando o punho durante a subida e controlando a descida.'),

  // ---------- Pernas ----------
  exercise('agachamento', 'Agachamento livre', 'Quadríceps / Glúteos', 'compound',
    'Pés na largura dos ombros. Desça com o quadril para trás, coluna neutra, e suba empurrando o chão.'),
  exercise('leg-press', 'Leg press', 'Quadríceps / Glúteos', 'compound',
    'Desça até os joelhos formarem cerca de 90° e empurre sem travar os joelhos.'),
  exercise('cadeira-extensora', 'Cadeira extensora', 'Quadríceps', 'isolation',
    'Estenda as pernas totalmente, segure 1 segundo no topo e desça controlando.'),
  exercise('stiff', 'Stiff com barra ou halteres', 'Posterior de coxa / Glúteos', 'compound',
    'Joelhos levemente flexionados. Desça o peso rente às pernas levando o quadril para trás.'),
  exercise('mesa-flexora', 'Mesa flexora', 'Posterior de coxa', 'isolation',
    'Deitado, flexione os joelhos levando os calcanhares em direção ao glúteo, sem tirar o quadril do banco.'),
  exercise('panturrilha-em-pe', 'Panturrilha em pé', 'Panturrilha', 'isolation',
    'Suba na ponta dos pés o máximo possível, segure no topo e desça alongando bem.'),
  exercise('hack-squat', 'Hack squat', 'Quadríceps / Glúteos', 'compound',
    'Costas apoiadas na máquina. Desça controlando até a coxa ficar paralela e empurre com os pés inteiros.'),
  exercise('stiff-halteres', 'Stiff com halteres', 'Posterior de coxa / Glúteos', 'compound',
    'Halteres à frente das coxas. Desça levando o quadril para trás e sinta o alongamento do posterior.'),
  exercise('cadeira-flexora', 'Cadeira flexora', 'Posterior de coxa', 'isolation',
    'Sentado, flexione os joelhos levando os calcanhares para baixo do banco e volte devagar.'),
  exercise('elevacao-pelvica', 'Elevação pélvica', 'Glúteos', 'compound',
    'Costas apoiadas no banco, barra no quadril. Suba contraindo os glúteos e desça controlando.'),
  exercise('panturrilha-sentado', 'Panturrilha sentado', 'Panturrilha', 'isolation',
    'Joelhos a 90°. Suba na ponta dos pés, segure no topo e desça alongando.'),
];

// ---------- Abdômen (treino de pernas do Anthony) ----------
// bodyweight: o peso padrão é 0 kg (peso do corpo).
// unit 'seconds': as "repetições" são registradas em segundos (ex.: prancha).
export const abdominalExercises = [
  exercise('maquina-abdominal', 'Máquina abdominal', 'Abdômen', 'isolation',
    'Ajuste o peso, encaixe os pés e flexione o tronco contraindo o abdômen, sem puxar com os braços.'),
  {
    ...exercise('elevacao-pernas', 'Elevação de pernas', 'Abdômen', 'isolation',
      'Apoiado no banco ou na barra, eleve as pernas controlando a descida, sem balançar o corpo.'),
    bodyweight: true,
  },
  {
    ...exercise('prancha', 'Prancha', 'Abdômen', 'isolation',
      'Apoie antebraços e pontas dos pés, mantenha o corpo alinhado e o abdômen contraído.'),
    bodyweight: true,
    unit: 'seconds',
  },
];
