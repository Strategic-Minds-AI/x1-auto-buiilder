import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Portal from '@/pages/Portal';
import AutoBuilder from '@/pages/AutoBuilder';
import AgentOrchestrator from '@/pages/AgentOrchestrator';
import BrandAssets from '@/pages/BrandAssets';
import GPTSyncLogs from '@/pages/GPTSyncLogs';
import MassLaunchConsolePage from '@/pages/MassLaunchConsolePage';
import Analytics from '@/pages/Analytics';
import ResearchHub from '@/pages/ResearchHub';
import BusinessOnboarding from '@/pages/BusinessOnboarding';
import LogoWorkshop from '@/pages/LogoWorkshop';
import ProjectTimeline from '@/pages/ProjectTimeline';
import AssetRepository from '@/pages/AssetRepository';
import CampaignMonitor from '@/pages/CampaignMonitor';
import StyleGuideEditor from '@/pages/StyleGuideEditor';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/oauth/consent" element={<OAuthConsent />} />
            {/* Protected */}
            <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
              <Route path="/portal" element={<Portal />} />
              <Route path="/auto-builder" element={<AutoBuilder />} />
              <Route path="/agent-orchestrator" element={<AgentOrchestrator />} />
              <Route path="/brand-assets" element={<BrandAssets />} />
              <Route path="/gpt-sync-logs" element={<GPTSyncLogs />} />
              <Route path="/mass-launch-console" element={<MassLaunchConsolePage />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/research-hub" element={<ResearchHub />} />
              <Route path="/business-onboarding" element={<BusinessOnboarding />} />
              <Route path="/logo-workshop" element={<LogoWorkshop />} />
              <Route path="/project-timeline" element={<ProjectTimeline />} />
              <Route path="/asset-repository" element={<AssetRepository />} />
              <Route path="/campaign-monitor" element={<CampaignMonitor />} />
              <Route path="/style-guide-editor" element={<StyleGuideEditor />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;