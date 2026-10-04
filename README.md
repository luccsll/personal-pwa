# MyWorkout

Aplicativo web pessoal (PWA) para acompanhar treinos de academia, cargas, peso corporal e evolução.
Usado por **Lucas e Anthony**, sem login e sem backend — todos os dados ficam no `localStorage` do navegador.

## Usuários

No primeiro acesso o app pergunta **"Quem está treinando hoje?"** (Lucas ou Anthony). A escolha fica salva
no aparelho (`localStorage.selectedUser`) e pode ser trocada em **Meus dados → Trocar usuário**
(ou no rodapé da barra lateral no desktop).

Cada usuário tem dados totalmente independentes — treinos, histórico, cargas, peso e dados pessoais —
guardados em chaves próprias: `myworkout_lucas_*` e `myworkout_anthony_*`.

## Rodando

```bash
npm install
npm run dev       # desenvolvimento
npm run build     # build de produção (gera o service worker / PWA)
npm run preview   # serve o build localmente
```

### Publicar na Vercel

O `vercel.json` já configura o build (Vite → `dist`), o redirecionamento das rotas da SPA para `index.html`
e o cache do service worker. Basta importar o repositório em [vercel.com/new](https://vercel.com/new)
ou rodar `npx vercel --prod` na pasta do projeto.

## Treino (dados iniciais)

Divisão **Push / Pull / Legs**, cada grupo muscular 2× por semana. Lucas e Anthony treinam juntos,
então a musculação é a mesma; as diferenças são:

- **Cardio:** Lucas 10 min, Anthony 20 min (editável em Meus dados).
- **Abdômen (Anthony):** Legs A + máquina abdominal e elevação de pernas; Legs B + máquina abdominal e prancha.

| Dia | Treino | Período |
| --- | --- | --- |
| Segunda | Push A — Peito, Ombros e Tríceps | Noite |
| Terça | Pull A — Costas e Bíceps | Noite |
| Quarta | Legs A — Pernas | Noite |
| Quinta | Push B — Peito, Ombros e Tríceps | Noite |
| Sexta | Pull B — Costas e Bíceps | Noite |
| Sábado | Legs B — Pernas | Manhã |
| Domingo | Descanso | — |

Os treinos estão em `src/data/workouts.js` (séries, faixa de repetições e descanso de cada exercício)
e podem ser editados pelo próprio app em **Treinos → abrir treino → editar**.
Quem já usava uma versão anterior tem os dados movidos automaticamente para o Lucas; o histórico é mantido.

## Funcionalidades

- **Início** — saudação, treino do dia (com status, duração estimada e "Trocar treino"), peso atual, total de treinos, sequência, semana e resumo da evolução.
- **Meus treinos** — semana de segunda a domingo, várias opções de treino por dia (Treino A/B), troca do treino da semana, criação e edição de treinos.
- **Detalhes do treino / exercício** — lista de exercícios com imagem, séries × repetições e a última carga usada.
- **Execução do treino** — um exercício por vez (ou lista completa), registro de peso, repetições e RIR opcional por série, "Último treino" de cada exercício, cronômetro de descanso automático (com +30s / −15s / Pular), salvamento automático (o treino continua de onde parou mesmo se o app for fechado), aviso quando a performance melhora e sugestão para aumentar a carga ao atingir o topo da faixa de repetições. Ao final: duração, exercícios, séries, volume e comparação com o treino anterior.
- **Evolução** — carga por exercício (gráfico, maior carga, última carga, evolução, últimas repetições), peso corporal e recordes.
- **Meu peso** — registro por data, peso atual/inicial/maior/menor, gráfico e IMC.
- **Histórico** — todos os treinos realizados com as cargas de cada série.
- **Meus dados** — nome, idade, altura, peso, cardio, objetivo, foco e **Trocar usuário**.

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
