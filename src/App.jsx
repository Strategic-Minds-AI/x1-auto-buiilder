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
import ApexCommand from '@/pages/ApexCommand';
import AgentOrchestrator from '@/pages/AgentOrchestrator';
import BrandAssets from '@/pages/BrandAssets';
import GPTSyncLogs from '@/pages/GPTSyncLogs';
import MassLaunchConsolePage from '@/pages/MassLaunchConsolePage';
import Analytics from '@/pages/Analytics';
import ResearchHub from '@/pages/ResearchHub';
import BusinessOnboarding from '@/pages/BusinessOnboarding';
import BusinessNameStudio from '@/pages/BusinessNameStudio';
import LogoWorkshop from '@/pages/LogoWorkshop';
import ProjectTimeline from '@/pages/ProjectTimeline';
import AssetRepository from '@/pages/AssetRepository';
import CampaignMonitor from '@/pages/CampaignMonitor';
import LaunchMonitorPage from '@/components/portal/LaunchMonitor';
import StyleGuideEditor from '@/pages/StyleGuideEditor';
import PremiumDesignLibrary from '@/pages/PremiumDesignLibrary';
import CardFlyerStudio from '@/pages/CardFlyerStudio';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
import PerformanceReport from '@/pages/PerformanceReport';
import CRM from '@/pages/CRM';
import AIToolLibrary from '@/pages/AIToolLibrary';
import AgentLibrary from '@/pages/AgentLibrary';
import AISkillsLibrary from '@/pages/AISkillsLibrary';
import CommLibrary from '@/pages/CommLibrary';
import ApiKeyManager from '@/pages/ApiKeyManager';
import ApiConnectorSettings from '@/pages/ApiConnectorSettings';
import SheetsSetupGuide from '@/pages/SheetsSetupGuide';
import IntelligenceHub from '@/pages/IntelligenceHub';
import PerformanceDashboard from '@/pages/PerformanceDashboard';
import MockupIngestion from '@/pages/MockupIngestion';
import FaultLine from '@/pages/FaultLine';
import ClientPortal from '@/pages/ClientPortal';
import UniversalGenerator from '@/pages/UniversalGenerator';
import UniversalGeneratorStudio from '@/pages/UniversalGeneratorStudio';
import CloneGenerator from '@/pages/CloneGenerator';
import ApexDashboard from '@/pages/ApexDashboard';
import AgentInstructions from '@/pages/AgentInstructions';
import VisualBuilder from '@/pages/VisualBuilder';
import BuilderDocs from '@/pages/BuilderDocs';
import SystemTestDashboard from '@/pages/SystemTestDashboard';
import EmailTemplateLibrary from '@/pages/EmailTemplateLibrary';
import EntityLibrary from '@/pages/EntityLibrary';
import PlatformDashboard from '@/pages/PlatformDashboard';
import WorkflowLibrary from '@/pages/WorkflowLibrary';
import MarketingLibrary from '@/pages/MarketingLibrary';
import WorkflowBuilder from '@/pages/WorkflowBuilder';
import ApiDocs from '@/pages/ApiDocs';
import FreeLibrary from '@/pages/FreeLibrary';
import PromptLibrary from '@/pages/PromptLibrary';
import FactoryConsole from '@/pages/FactoryConsole';
import IntegrationHub from '@/pages/IntegrationHub';
import SuperAgentChat from '@/components/SuperAgentChat';

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
              <Route path="/apex-command" element={<ApexCommand />} />
              <Route path="/agent-orchestrator" element={<AgentOrchestrator />} />
              <Route path="/brand-assets" element={<BrandAssets />} />
              <Route path="/gpt-sync-logs" element={<GPTSyncLogs />} />
              <Route path="/mass-launch-console" element={<MassLaunchConsolePage />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/research-hub" element={<ResearchHub />} />
              <Route path="/business-onboarding" element={<BusinessOnboarding />} />
              <Route path="/business-name-studio" element={<BusinessNameStudio />} />
              <Route path="/logo-workshop" element={<LogoWorkshop />} />
              <Route path="/project-timeline" element={<ProjectTimeline />} />
              <Route path="/asset-repository" element={<AssetRepository />} />
              <Route path="/campaign-monitor" element={<CampaignMonitor />} />
              <Route path="/launch-monitor" element={<div className="portal-light min-h-screen bg-white"><LaunchMonitorPage /></div>} />
              <Route path="/style-guide-editor" element={<StyleGuideEditor />} />
              <Route path="/design-library" element={<div className="portal-light min-h-screen bg-white"><PremiumDesignLibrary /></div>} />
              <Route path="/card-flyer-studio" element={<div className="portal-light min-h-screen bg-white"><CardFlyerStudio /></div>} />
              <Route path="/performance-report" element={<PerformanceReport />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/ai-tool-library" element={<AIToolLibrary />} />
              <Route path="/agent-library" element={<AgentLibrary />} />
              <Route path="/ai-skills-library" element={<AISkillsLibrary />} />
              <Route path="/comm-library" element={<CommLibrary />} />
              <Route path="/api-keys" element={<ApiKeyManager />} />
              <Route path="/api-connectors" element={<ApiConnectorSettings />} />
              <Route path="/sheets-setup" element={<SheetsSetupGuide />} />
              <Route path="/intelligence-hub" element={<IntelligenceHub />} />
              <Route path="/performance-dashboard" element={<PerformanceDashboard />} />
              <Route path="/mockup-ingestion" element={<MockupIngestion />} />
              <Route path="/fault-line" element={<FaultLine />} />
              <Route path="/client-portal" element={<ClientPortal />} />
              <Route path="/universal-generator" element={<UniversalGenerator />} />
              <Route path="/universal-studio" element={<UniversalGeneratorStudio />} />
              <Route path="/clone-generator" element={<CloneGenerator />} />
              <Route path="/apex-god-mode" element={<ApexDashboard />} />
              <Route path="/agent-instructions" element={<AgentInstructions />} />
              <Route path="/visual-builder" element={<VisualBuilder />} />
              <Route path="/builder-docs" element={<BuilderDocs />} />
              <Route path="/system-tests" element={<SystemTestDashboard />} />
              <Route path="/email-templates" element={<EmailTemplateLibrary />} />
              <Route path="/entity-library" element={<EntityLibrary />} />
              <Route path="/platform-dashboard" element={<PlatformDashboard />} />
              <Route path="/workflow-library" element={<WorkflowLibrary />} />
              <Route path="/marketing-library" element={<MarketingLibrary />} />
              <Route path="/workflow-builder" element={<WorkflowBuilder />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="/free-library" element={<FreeLibrary />} />
              <Route path="/prompt-library" element={<PromptLibrary />} />
              <Route path="/factory-console" element={<FactoryConsole />} />
              <Route path="/integration-hub" element={<IntegrationHub />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <Toaster />
          <SuperAgentChat />
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;