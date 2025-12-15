import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './pages/dashboard/Dashboard';
import { EventsPage } from './pages/dashboard/Events';
import { EventDetailPage } from './pages/dashboard/EventDetailPage';
import { CompaniesPage } from './pages/dashboard/Companies';
import { SurveysPage } from './pages/dashboard/Surveys';
import { BlogPage } from './pages/dashboard/Blog';
import { BlogCreatePage } from './pages/dashboard/BlogCreatePage';
import { BlogEditPage } from './pages/dashboard/BlogEditPage';
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
import Landing from './pages/public/Landing';
import PublicEventsPage from './pages/public/Events';
import PublicEventDetailPage from './pages/public/EventDetail';
import PublicBlogPage from './pages/public/Blog';
import PublicBlogDetailPage from './pages/public/BlogDetail';
import PublicAboutPage from './pages/public/About';
import PublicCompaniesPage from './pages/public/Companies';
import PublicCompanyDetailPage from './pages/public/CompanyDetail';
import PublicMemberProfilePage from './pages/public/MemberProfile';
import { PublicMembersPage } from './pages/public/Members';
import { MarkdownTest } from './components/test/MarkdownTest';
import { BlogDetailTest } from './components/test/BlogDetailTest';
import { AboutPage } from './pages/dashboard/About';
import { MemberLayout } from './components/layout/MemberLayout';
import { MemberProfilePage } from './pages/member/Profile';
import { MemberMyEventsPage } from './pages/member/MyEvents';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Landing Page */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/test/markdown" element={<MarkdownTest />} />
        <Route path="/test/blog-detail" element={<BlogDetailTest />} />
        {/* Public Events & Blog Pages */}
        <Route path="/events" element={<PublicEventsPage />} />
        <Route path="/events/:pk" element={<PublicEventDetailPage />} />
        <Route path="/blog" element={<PublicBlogPage />} />
        <Route path="/blog/:slug" element={<PublicBlogDetailPage />} />
        <Route path="/about" element={<PublicAboutPage />} />
        <Route path="/companies" element={<PublicCompaniesPage />} />
        <Route path="/companies/:id" element={<PublicCompanyDetailPage />} />
        <Route path="/members" element={<PublicMembersPage />} />
        <Route path="/member/:username" element={<PublicMemberProfilePage />} />
        {/* Member Routes */}
        <Route path="/member" element={
          <ProtectedRoute>
            <MemberLayout />
          </ProtectedRoute>
        }>
          <Route path="profile" element={<MemberProfilePage />} />
          <Route path="events" element={<MemberMyEventsPage />} />
        </Route>
        <Route path="/dashboard" element={
          <ProtectedRoute requireAdmin>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:pk" element={<EventDetailPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="surveys" element={<SurveysPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/create" element={<BlogCreatePage />} />
          <Route path="blog/edit/:id" element={<BlogEditPage />} />
          <Route path="blog/:slug" element={<BlogDetailPage />} />
          <Route path="about" element={<AboutPage />} />
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
