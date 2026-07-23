import { useState, useEffect } from 'react';
import { ActivePage } from './types';
import { useAuth } from './context/AuthContext';
import { SignUpPage } from './components/auth/SignUpPage';
import { SignInPage } from './components/auth/SignInPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ImportAudiencePage } from './components/audience/ImportAudiencePage';
import { TemplateDesignerPage } from './components/templates/TemplateDesignerPage';
import { SendCampaignWizardPage } from './components/campaigns/SendCampaignWizardPage';
import { CampaignHistoryPage } from './components/campaigns/CampaignHistoryPage';
import { CampaignAnalyticsPage } from './components/campaigns/CampaignAnalyticsPage';
import { RecipientListPage } from './components/campaigns/RecipientListPage';

function ProtectedApp({ onNavigate, activePage, selectedCampaignId, onSelectCampaignAnalytics }: {
  onNavigate: (page: ActivePage) => void;
  activePage: ActivePage;
  selectedCampaignId: number;
  onSelectCampaignAnalytics: (id: number) => void;
}) {
  return (
    <AppLayout activePage={activePage} onNavigate={onNavigate}>
      {activePage === 'dashboard' && (
        <DashboardOverview onNavigate={onNavigate} />
      )}

      {(activePage === 'campaigns' || activePage === 'history') && (
        <CampaignHistoryPage
          onNavigate={onNavigate}
          onSelectCampaignAnalytics={onSelectCampaignAnalytics}
        />
      )}

      {activePage === 'audience' && <ImportAudiencePage />}

      {activePage === 'templates' && <TemplateDesignerPage />}

      {activePage === 'new_campaign' && (
        <SendCampaignWizardPage onNavigate={onNavigate} />
      )}

      {activePage === 'analytics' && (
        <CampaignAnalyticsPage
          campaignId={selectedCampaignId}
          onNavigate={onNavigate}
        />
      )}

      {activePage === 'recipients' && (
        <RecipientListPage onNavigate={onNavigate} />
      )}

      {activePage === 'settings' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xs max-w-2xl space-y-6">
          <h1 className="text-xl font-bold text-slate-900">CRM Settings & Integrations</h1>
          <div className="space-y-4 text-xs text-slate-600">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="font-bold text-slate-900 text-sm mb-1">Python FastAPI + SQLModel Engine</p>
              <p className="text-slate-500">
                Backend API service structured in <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">/backend/app</code> with repositories, services, SQLModel models, schemas, and FastAPI routers.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="font-bold text-slate-900 text-sm mb-1">API Endpoint Proxy Base</p>
              <p className="text-slate-500">Base URL: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">http://localhost:3000/api/v1</code></p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>('signin');
  const [selectedCampaignId, setSelectedCampaignId] = useState<number>(101);

  useEffect(() => {
    if (isAuthenticated) {
      setActivePage(prev => prev === 'signin' || prev === 'signup' || prev === 'reset_password' ? 'history' : prev);
    } else if (!isLoading) {
      setActivePage('signin');
    }
  }, [isAuthenticated, isLoading]);

  const handleNavigate = (page: ActivePage) => {
    setActivePage(page);
  };

  const handleSelectCampaignAnalytics = (campaignId: number) => {
    setSelectedCampaignId(campaignId);
    setActivePage('analytics');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (activePage === 'signup') {
      return <SignUpPage onNavigate={handleNavigate} onSignUpSuccess={() => setActivePage('history')} />;
    }
    if (activePage === 'reset_password') {
      return <ResetPasswordPage onNavigate={handleNavigate} />;
    }
    return <SignInPage onNavigate={handleNavigate} onSignInSuccess={() => setActivePage('history')} />;
  }

  return (
    <ProtectedApp
      onNavigate={handleNavigate}
      activePage={activePage}
      selectedCampaignId={selectedCampaignId}
      onSelectCampaignAnalytics={handleSelectCampaignAnalytics}
    />
  );
}
