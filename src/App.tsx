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

import { SettingsPage } from './components/settings/SettingsPage';

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

      {activePage === 'settings' && <SettingsPage />}
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
