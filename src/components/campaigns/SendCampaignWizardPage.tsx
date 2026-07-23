import React, { useState, useEffect } from 'react';
import { Mail, Clock, Sparkles, Send, Calendar, CheckCircle2, ArrowRight, ArrowLeft, Users, Layout, Loader2 } from 'lucide-react';
import { ActivePage, EmailTemplate } from '../../types';
import { createCampaign, launchCampaign, fetchTemplates, fetchContacts } from '../../api/client';

interface SendCampaignWizardPageProps {
  onNavigate: (page: ActivePage) => void;
}

const CATEGORIES = [
  'NEWSLETTER',
  'PRODUCT NEWSLETTER',
  'SALES CAMPAIGN',
  'SECURITY WARNING',
  'CONTENT DIGEST',
  'AUTOMATION SEQUENCE',
  'PROMOTIONAL',
  'EVENT INVITATION',
];

export const SendCampaignWizardPage: React.FC<SendCampaignWizardPageProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1 state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [contactCount, setContactCount] = useState(0);

  // Step 2 state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Step 3 state
  const [scheduleOption, setScheduleOption] = useState<'immediate' | 'scheduled'>('immediate');
  const [showLaunchModal, setShowLaunchModal] = useState(false);

  useEffect(() => {
    fetchContacts(1, 1)
      .then(c => setContactCount(c.total))
      .catch(() => setContactCount(0));
  }, []);

  useEffect(() => {
    if (currentStep === 2) {
      loadTemplates();
    }
  }, [currentStep]);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
      if (data.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleLaunch = async (option: 'immediate' | 'scheduled') => {
    setIsLaunching(true);
    setErrorMsg('');
    try {
      const camp: any = await createCampaign({
        subject: subject || 'Untitled Campaign',
        category_label: category,
        template_id: selectedTemplateId,
        scheduled_time: option === 'immediate' ? 'Send Immediately' : 'Scheduled',
      });
      await launchCampaign(camp.id, option);
      setShowLaunchModal(false);
      setIsSuccess(true);
      setTimeout(() => onNavigate('history'), 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to launch campaign');
    } finally {
      setIsLaunching(false);
    }
  };

  const canGoNext = () => {
    if (currentStep === 1) return subject.trim().length > 0;
    if (currentStep === 2) return selectedTemplateId !== null;
    return true;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900">Campaign Details</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Your Monthly Growth Analysis"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <Users className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Target Audience</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {contactCount > 0 ? `${contactCount} contacts available` : 'No contacts loaded'}
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Select Template</h2>
              <button
                onClick={() => onNavigate('templates')}
                className="text-xs font-semibold text-emerald-600 hover:underline"
              >
                Create New Template
              </button>
            </div>

            {isLoadingTemplates ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span className="ml-2 text-xs text-slate-500">Loading templates...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Layout className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>No templates yet. Create one in the Template Designer first.</p>
                <button
                  onClick={() => onNavigate('templates')}
                  className="mt-3 bg-[#002d1c] text-white px-4 py-2 rounded-lg font-bold text-xs"
                >
                  Go to Template Designer
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`w-full text-left p-4 rounded-xl border transition ${
                      selectedTemplateId === tpl.id
                        ? 'border-emerald-500 bg-emerald-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-900">{tpl.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{tpl.subject_line}</p>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 block">{tpl.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 mb-2">Final Review</h2>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Email Subject</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{subject}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <Layout className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Category</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{category.replace(/_/g, ' ')}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <Users className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Audience</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{contactCount} contacts</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <Clock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Schedule</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {scheduleOption === 'immediate' ? 'Send Immediately' : 'Scheduled for Later'}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setScheduleOption('scheduled'); setShowLaunchModal(true); }}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-bold text-xs transition"
              >
                <Calendar className="w-4 h-4 inline mr-1" /> Schedule
              </button>
              <button
                onClick={() => { setScheduleOption('immediate'); setShowLaunchModal(true); }}
                className="flex-1 bg-[#002d1c] hover:bg-[#02472d] text-white py-2.5 rounded-lg font-bold text-xs transition"
              >
                <Send className="w-4 h-4 inline mr-1 text-emerald-400" /> Send Now
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto relative">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">New Campaign</h1>
        <p className="text-xs text-slate-500 mt-1">Configure and launch a new email campaign.</p>
      </div>

      {/* Progress Step Indicator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between max-w-md mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 -z-0"></div>

          {[
            { num: 1, label: 'Details' },
            { num: 2, label: 'Template' },
            { num: 3, label: 'Review' },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center gap-1.5 z-10 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep >= step.num ? 'bg-[#002d1c] text-emerald-400' : 'bg-slate-200 text-slate-500'
              }`}>
                {step.num}
              </div>
              <span className="text-xs font-bold text-slate-800">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {renderStep()}

        {/* Launch Modal Card (step 3 only) */}
        {currentStep === 3 && showLaunchModal && (
          <div className="md:col-span-5 bg-[#002d1c] text-white p-6 rounded-2xl shadow-xl space-y-6 border border-emerald-900">
            <div>
              <h2 className="text-lg font-bold mb-2">Confirm Launch</h2>
              <p className="text-xs text-emerald-100 leading-relaxed">
                You are about to send to <span className="font-bold text-white">{contactCount} recipients</span>.
                {scheduleOption === 'scheduled' && ' The campaign will be queued for delivery.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/20 text-red-200 rounded-lg text-xs font-semibold border border-red-400/30">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3">
              <button
                disabled={isLaunching}
                onClick={() => handleLaunch(scheduleOption)}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  scheduleOption === 'immediate'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-[#002d1c]'
                    : 'bg-white hover:bg-slate-100 text-[#002d1c]'
                }`}
              >
                {isLaunching ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Dispatching...</>
                ) : scheduleOption === 'immediate' ? (
                  <><Send className="w-4 h-4" /> Send Now</>
                ) : (
                  <><Calendar className="w-4 h-4" /> Confirm Schedule</>
                )}
              </button>

              <button
                onClick={() => setShowLaunchModal(false)}
                className="w-full bg-transparent hover:bg-white/10 text-white py-2 px-4 rounded-xl font-bold text-xs transition border border-white/20"
              >
                Cancel
              </button>
            </div>

            <p className="text-[10px] text-emerald-300 text-center">
              By sending, you agree to our anti-spam policy.
            </p>
          </div>
        )}
      </div>

      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <div>
            <p className="text-sm font-bold">Campaign Dispatched!</p>
            <p className="text-xs text-emerald-700">Redirecting to campaign logs...</p>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      {!isSuccess && currentStep < 3 && (
        <div className="flex items-center justify-between pt-4 bg-white p-4 rounded-xl border border-slate-100">
          <button
            onClick={() => currentStep === 1 ? onNavigate('history') : setCurrentStep(currentStep - 1)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          <button
            disabled={!canGoNext()}
            onClick={() => setCurrentStep(currentStep + 1)}
            className="bg-[#002d1c] hover:bg-[#02472d] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
