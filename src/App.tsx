import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/dashboard/Dashboard';
import { EventsPage } from './pages/dashboard/Events';
import { CompaniesPage } from './pages/dashboard/Companies';
import { SurveysPage } from './pages/dashboard/Surveys';
import { BlogPage } from './pages/dashboard/Blog';
import { AnalyticsPage } from './pages/dashboard/Analytics';
import { ProfilePage } from './pages/dashboard/Profile';
import { SettingsPage } from './pages/dashboard/Settings';
import { NotificationsPage } from './pages/dashboard/Notifications';
import { MembersPage } from './pages/dashboard/Members';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="surveys" element={<SurveysPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="members" element={<MembersPage />} />
          {/* Additional routes will be added here */}
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;