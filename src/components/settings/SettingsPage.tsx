import React, { useState, useEffect } from 'react';
import {
  Mail,
  Building2,
  Layout,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  Key,
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import { fetchSettings, updateSettings, sendTestEmail } from '../../api/client';

type Tab = 'mail_service' | 'business_address' | 'template_defaults';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('mail_service');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields state
  const [settingsData, setSettingsData] = useState({
    active_email_provider: 'resend',
    resend_api_key: '',
    mailjet_api_key: '',
    mailjet_secret_key: '',

    default_from_email: '',
    default_from_name: '',
    default_reply_to: '',

    business_name: '',
    business_address: '',
    business_city: '',
    business_state: '',
    business_zip: '',
    business_country: '',

    website_url: '',
    cta_link_text: '',
    cta_as_button: true,

    header_logo_url: '',
    header_title: '',
    header_bg_color: '#002d1c',
    header_text_color: '#ffffff',
  });

  // Test email state
  const [testRecipient, setTestRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data: any = await fetchSettings();
      setSettingsData({
        active_email_provider: data?.active_email_provider || 'resend',
        resend_api_key: data?.resend_api_key || '',
        mailjet_api_key: data?.mailjet_api_key || '',
        mailjet_secret_key: data?.mailjet_secret_key || '',

        default_from_email: data?.default_from_email || 'onboarding@resend.dev',
        default_from_name: data?.default_from_name || 'Evergreen Mail',
        default_reply_to: data?.default_reply_to || 'support@example.com',

        business_name: data?.business_name || 'Evergreen Mail Inc.',
        business_address: data?.business_address || '123 Evergreen Terrace',
        business_city: data?.business_city || 'Springfield',
        business_state: data?.business_state || 'OR',
        business_zip: data?.business_zip || '97477',
        business_country: data?.business_country || 'United States',

        website_url: data?.website_url || 'https://evergreenmail.com',
        cta_link_text: data?.cta_link_text || 'Visit Our Website',
        cta_as_button: data?.cta_as_button ?? true,

        header_logo_url: data?.header_logo_url || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&auto=format&fit=crop&q=80',
        header_title: data?.header_title || 'Evergreen Weekly Bulletin',
        header_bg_color: data?.header_bg_color || '#002d1c',
        header_text_color: data?.header_text_color || '#ffffff',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettingsData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);
    try {
      const updated: any = await updateSettings(settingsData);
      setSettingsData((prev) => ({ ...prev, ...updated }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testRecipient) {
      setTestResult({ status: 'error', error: 'Please enter a valid recipient email address.' });
      return;
    }
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await sendTestEmail(testRecipient, settingsData.active_email_provider);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ status: 'error', error: err.message || 'Test email failed to dispatch.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center flex-col space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading CRM system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002d1c] to-[#044c32] text-white p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Engine Configuration
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">CRM & Dispatch Settings</h1>
          <p className="text-xs text-emerald-100/80">
            Manage active mail service providers, API keys, physical business compliance address, and template defaults.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="z-10 bg-emerald-400 hover:bg-emerald-300 text-[#002d1c] px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Settings updated successfully! Changes applied to email engine.</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6">
        <button
          onClick={() => setActiveTab('mail_service')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'mail_service'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4" /> Mail Provider & Credentials
        </button>

        <button
          onClick={() => setActiveTab('business_address')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'business_address'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" /> Physical Business Address
        </button>

        <button
          onClick={() => setActiveTab('template_defaults')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'template_defaults'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layout className="w-4 h-4" /> Template Header & CTA Defaults
        </button>
      </div>

      {/* Tab 1: Mail Provider & Credentials */}
      {activeTab === 'mail_service' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" /> Active Mail Service Provider
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select which cloud email delivery provider Evergreen Mail uses to dispatch marketing campaigns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Resend Option */}
              <div
                onClick={() => handleChange('active_email_provider', 'resend')}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  settingsData.active_email_provider === 'resend'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                      R
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Resend API</h3>
                      <p className="text-[11px] text-slate-500">Developer-first transactional & marketing email platform.</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="provider"
                    checked={settingsData.active_email_provider === 'resend'}
                    onChange={() => handleChange('active_email_provider', 'resend')}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span>API Key Configured:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {settingsData.resend_api_key ? '••••' + settingsData.resend_api_key.slice(-6) : 'Not Set'}
                  </span>
                </div>
              </div>

              {/* Mailjet Option */}
              <div
                onClick={() => handleChange('active_email_provider', 'mailjet')}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  settingsData.active_email_provider === 'mailjet'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                      M
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Mailjet v3.1 REST API</h3>
                      <p className="text-[11px] text-slate-500">Enterprise email delivery with HTTP Basic auth.</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="provider"
                    checked={settingsData.active_email_provider === 'mailjet'}
                    onChange={() => handleChange('active_email_provider', 'mailjet')}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span>API Credentials:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {settingsData.mailjet_api_key && settingsData.mailjet_secret_key ? 'Ready' : 'Incomplete'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* API Credentials Input Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" /> Service Credentials & API Keys
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resend Keys */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Resend Credentials
                </h3>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Resend API Key</label>
                  <input
                    type="password"
                    value={settingsData.resend_api_key}
                    onChange={(e) => handleChange('resend_api_key', e.target.value)}
                    placeholder="re_123456789..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Obtain from resend.com API Keys dashboard.</p>
                </div>
              </div>

              {/* Mailjet Keys */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Mailjet Credentials
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mailjet API Key</label>
                    <input
                      type="text"
                      value={settingsData.mailjet_api_key}
                      onChange={(e) => handleChange('mailjet_api_key', e.target.value)}
                      placeholder="e.g. 8a73b281..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mailjet Secret Key</label>
                    <input
                      type="password"
                      value={settingsData.mailjet_secret_key}
                      onChange={(e) => handleChange('mailjet_secret_key', e.target.value)}
                      placeholder="e.g. 7c94a910..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sender Details */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-900">Default Sender Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Default From Name</label>
                  <input
                    type="text"
                    value={settingsData.default_from_name}
                    onChange={(e) => handleChange('default_from_name', e.target.value)}
                    placeholder="Evergreen Mail"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Default From Email</label>
                  <input
                    type="email"
                    value={settingsData.default_from_email}
                    onChange={(e) => handleChange('default_from_email', e.target.value)}
                    placeholder="onboarding@resend.dev"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Default Reply-To Email</label>
                  <input
                    type="email"
                    value={settingsData.default_reply_to}
                    onChange={(e) => handleChange('default_reply_to', e.target.value)}
                    placeholder="support@example.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Test Email Dispatcher */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                  <Send className="w-4 h-4" /> Send Test Connection Email
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Dispatch a test message using active provider ({settingsData.active_email_provider.toUpperCase()}) to verify key authorization.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="Enter recipient email address..."
                className="flex-1 px-4 py-2.5 text-xs text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSendingTest ? 'Sending...' : 'Send Test'}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl text-xs border ${
                  testResult.status === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : testResult.status === 'mock'
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="font-bold flex items-center gap-2 mb-1">
                  {testResult.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {testResult.status === 'mock' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                  {testResult.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                  Status: {testResult.status.toUpperCase()} (Provider: {testResult.provider || settingsData.active_email_provider})
                </div>
                <p className="text-[11px] opacity-90">{testResult.message || testResult.error || JSON.stringify(testResult.response)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Physical Business Address */}
      {activeTab === 'business_address' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" /> Physical Business Address Settings
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                CAN-SPAM Act and GDPR compliance require a valid physical street address in every commercial email footer.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Company / Organization Legal Name</label>
                <input
                  type="text"
                  value={settingsData.business_name}
                  onChange={(e) => handleChange('business_name', e.target.value)}
                  placeholder="Evergreen Mail Inc."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={settingsData.business_address}
                  onChange={(e) => handleChange('business_address', e.target.value)}
                  placeholder="123 Evergreen Terrace"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={settingsData.business_city}
                    onChange={(e) => handleChange('business_city', e.target.value)}
                    placeholder="Springfield"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={settingsData.business_state}
                    onChange={(e) => handleChange('business_state', e.target.value)}
                    placeholder="OR"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Zip / Postal Code</label>
                  <input
                    type="text"
                    value={settingsData.business_zip}
                    onChange={(e) => handleChange('business_zip', e.target.value)}
                    placeholder="97477"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={settingsData.business_country}
                  onChange={(e) => handleChange('business_country', e.target.value)}
                  placeholder="United States"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Footer Preview</h3>
            <div className="p-6 bg-white rounded-xl border border-slate-200 text-center space-y-2 max-w-lg mx-auto">
              <p className="text-[11px] text-slate-400">
                You received this email because you're subscribed to Evergreen Mail updates.
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                <strong>{settingsData.business_name || 'Your Company Name'}</strong> &bull;{' '}
                {[
                  settingsData.business_address,
                  settingsData.business_city,
                  `${settingsData.business_state} ${settingsData.business_zip}`.trim(),
                  settingsData.business_country,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              <p className="text-[11px] text-emerald-700 underline font-semibold">Unsubscribe from these emails</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Template Header & CTA Defaults */}
      {activeTab === 'template_defaults' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layout className="w-4 h-4 text-emerald-600" /> Default Header Image & Banner Controls
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Customize global email header images, title text, and header background colors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Header Image / Logo URL
                  </label>
                  <input
                    type="url"
                    value={settingsData.header_logo_url}
                    onChange={(e) => handleChange('header_logo_url', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Header Title Text</label>
                  <input
                    type="text"
                    value={settingsData.header_title}
                    onChange={(e) => handleChange('header_title', e.target.value)}
                    placeholder="Evergreen Weekly Bulletin"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settingsData.header_bg_color}
                        onChange={(e) => handleChange('header_bg_color', e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settingsData.header_bg_color}
                        onChange={(e) => handleChange('header_bg_color', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settingsData.header_text_color}
                        onChange={(e) => handleChange('header_text_color', e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settingsData.header_text_color}
                        onChange={(e) => handleChange('header_text_color', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Website CTA Section */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" /> Website CTA Link & Button Controls
                </h3>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Website Link URL</label>
                  <input
                    type="url"
                    value={settingsData.website_url}
                    onChange={(e) => handleChange('website_url', e.target.value)}
                    placeholder="https://evergreenmail.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">CTA Label Text</label>
                  <input
                    type="text"
                    value={settingsData.cta_link_text}
                    onChange={(e) => handleChange('cta_link_text', e.target.value)}
                    placeholder="Visit Our Website"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-2">Display Mode</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="cta_mode"
                        checked={settingsData.cta_as_button === true}
                        onChange={() => handleChange('cta_as_button', true)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      Styled Button
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="cta_mode"
                        checked={settingsData.cta_as_button === false}
                        onChange={() => handleChange('cta_as_button', false)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      Hyperlink Text
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Visual Header & CTA Preview */}
          <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Header & CTA Preview</h3>
            <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div
                style={{ backgroundColor: settingsData.header_bg_color }}
                className="p-6 text-center transition-colors"
              >
                {settingsData.header_logo_url && (
                  <img
                    src={settingsData.header_logo_url}
                    alt="Header Logo"
                    className="max-h-12 max-w-[180px] mx-auto mb-3 inline-block object-contain"
                  />
                )}
                {settingsData.header_title && (
                  <h1
                    style={{ color: settingsData.header_text_color }}
                    className="text-lg font-bold tracking-tight"
                  >
                    {settingsData.header_title}
                  </h1>
                )}
              </div>

              <div className="p-6 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sample body content paragraph in rendered campaign email...
                </p>
              </div>

              {settingsData.website_url && (
                <div className="p-6 text-center border-t border-slate-100">
                  {settingsData.cta_as_button ? (
                    <a
                      href={settingsData.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#002d1c] text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      {settingsData.cta_link_text || 'Visit Our Website'} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <a
                      href={settingsData.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-600 underline inline-flex items-center gap-1"
                    >
                      {settingsData.cta_link_text || 'Visit Our Website'} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
