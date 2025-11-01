import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './pages/dashboard/Dashboard';
import { EventsPage } from './pages/dashboard/Events';
import { EventDetailPage } from './pages/dashboard/EventDetailPage';
import { CompaniesPage } from './pages/dashboard/Companies';
import { SurveysPage } from './pages/dashboard/Surveys';
import { BlogPage } from './pages/dashboard/Blog';
import { BlogDetailPage } from './pages/dashboard/BlogDetailPage';
import { AnalyticsPage } from './pages/dashboard/Analytics';
import { ProfilePage } from './pages/dashboard/Profile';
import { SettingsPage } from './pages/dashboard/Settings';
import { NotificationsPage } from './pages/dashboard/Notifications';
import { MembersPage } from './pages/dashboard/Members';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { OAuthCallback } from './pages/auth/OAuthCallback';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:pk" element={<EventDetailPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="surveys" element={<SurveysPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogDetailPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="members" element={<MembersPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;