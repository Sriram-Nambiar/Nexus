import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { SearchPage } from './pages/SearchPage';
import { AssistantPage } from './pages/AssistantPage';
import { PlannerPage } from './pages/PlannerPage';
import { AdminResourcesPage } from './pages/AdminResourcesPage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:id" element={<CourseDetailPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="planner" element={<PlannerPage />} />
            <Route path="admin/resources" element={<AdminResourcesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
