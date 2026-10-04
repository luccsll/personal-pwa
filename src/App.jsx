import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppDataProvider } from '@/hooks/useAppData';
import MainLayout from '@/layouts/MainLayout';
import FocusLayout from '@/layouts/FocusLayout';
import DashboardPage from '@/pages/DashboardPage';
import WorkoutsPage from '@/pages/WorkoutsPage';
import WorkoutDetailsPage from '@/pages/WorkoutDetailsPage';
import WorkoutEditorPage from '@/pages/WorkoutEditorPage';
import ExerciseDetailsPage from '@/pages/ExerciseDetailsPage';
import WorkoutExecutionPage from '@/pages/WorkoutExecutionPage';
import EvolutionPage from '@/pages/EvolutionPage';
import BodyWeightPage from '@/pages/BodyWeightPage';
import HistoryPage from '@/pages/HistoryPage';
import HistoryDetailsPage from '@/pages/HistoryDetailsPage';
import ProfilePage from '@/pages/ProfilePage';

export default function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/treinos" element={<WorkoutsPage />} />
            <Route path="/treinos/novo" element={<WorkoutEditorPage />} />
            <Route path="/treinos/:id" element={<WorkoutDetailsPage />} />
            <Route path="/treinos/:id/editar" element={<WorkoutEditorPage />} />
            <Route path="/exercicios/:id" element={<ExerciseDetailsPage />} />
            <Route path="/evolucao" element={<EvolutionPage />} />
            <Route path="/peso" element={<BodyWeightPage />} />
            <Route path="/historico" element={<HistoryPage />} />
            <Route path="/historico/:sessionId" element={<HistoryDetailsPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
          <Route element={<FocusLayout />}>
            <Route path="/treino/:sessionId" element={<WorkoutExecutionPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppDataProvider>
  );
}
