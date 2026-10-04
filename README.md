# MyWorkout

Aplicativo web pessoal (PWA) para acompanhar treinos de academia, cargas, peso corporal e evolução.
Uso individual: sem login, sem backend — todos os dados ficam no `localStorage` do navegador.

## Rodando

```bash
npm install
npm run dev       # desenvolvimento
npm run build     # build de produção (gera o service worker / PWA)
npm run preview   # serve o build localmente
```

> Para hospedar, configure o servidor para redirecionar todas as rotas para `index.html` (SPA).

## Funcionalidades

- **Início** — saudação, treino do dia (com status, duração estimada e "Trocar treino"), peso atual, total de treinos, sequência, semana e resumo da evolução.
- **Meus treinos** — semana de segunda a domingo, várias opções de treino por dia (Treino A/B), troca do treino da semana, criação e edição de treinos.
- **Detalhes do treino / exercício** — lista de exercícios com imagem, séries × repetições e a última carga usada.
- **Execução do treino** — um exercício por vez (ou lista completa), registro de peso/repetições por série com sugestão da última carga, salvamento automático (sobrevive a recarregar a página), progresso e tela de "Treino concluído!" com horário de início/fim.
- **Evolução** — carga por exercício (gráfico, maior carga, última carga, evolução, últimas repetições), peso corporal e recordes.
- **Meu peso** — registro por data, peso atual/inicial/maior/menor, gráfico e IMC.
- **Histórico** — todos os treinos realizados com as cargas de cada série.
- **Meus dados** — nome, altura, peso e objetivo.

## Estrutura

```
src/
  components/   componentes reutilizáveis (WorkoutCard, ExerciseCard, SetInput, WeightChart...)
  pages/        telas
  layouts/      MainLayout (sidebar/navegação inferior) e FocusLayout (execução do treino)
  services/     storageService.js — único ponto de acesso ao localStorage
  hooks/        useAppData (estado global + ações) e hooks derivados
  utils/        datas, formatação, estatísticas
  data/         dados iniciais (exercícios e treinos da semana)
  styles/       tokens do design system e estilos globais
```

Para migrar para uma API no futuro, basta reimplementar `src/services/storageService.js`
mantendo as mesmas funções; os componentes não acessam o armazenamento diretamente.

## Imagens dos exercícios

Coloque as fotos em `public/images/exercises/<id-do-exercicio>.jpg` (ex.: `supino-reto.jpg`).
Se a imagem não existir, o app usa `placeholder.jpg` automaticamente.
Veja a lista completa em [`public/images/exercises/README.md`](public/images/exercises/README.md).
