import React, { useState } from 'react';
import { Mail, Clock, Sparkles, Send, Calendar, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ActivePage } from '../../types';
import { createCampaign, launchCampaign } from '../../api/client';

interface SendCampaignWizardPageProps {
  onNavigate: (page: ActivePage) => void;
}

export const SendCampaignWizardPage: React.FC<SendCampaignWizardPageProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState<number>(3);
  const [showLaunchModal, setShowLaunchModal] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);

  const handleLaunchNow = async (option: 'immediate' | 'scheduled') => {
    setIsLaunching(true);
    try {
      const camp = await createCampaign({
        subject: 'Your Monthly Growth Analysis - September 2024',
        category_label: 'NEWSLETTER',
        scheduled_time: option === 'immediate' ? 'Send Immediately' : 'Scheduled'
      });
      await launchCampaign(camp.id, option);
      setShowLaunchModal(false);
      setIsSuccess(true);
      setTimeout(() => {
        onNavigate('history');
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto relative">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">New Campaign Delivery</h1>
        <p className="text-xs text-slate-500 mt-1">Configure your bulk email broadcast in three simple steps.</p>
      </div>

      {/* Progress Step Indicator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between max-w-md mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 -z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1.5 z-10 bg-white px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 1 ? 'bg-[#002d1c] text-emerald-400' : 'bg-slate-200 text-slate-500'}`}>
              1
            </div>
            <span className="text-xs font-bold text-slate-800">Audience</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1.5 z-10 bg-white px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 2 ? 'bg-[#002d1c] text-emerald-400' : 'bg-slate-200 text-slate-500'}`}>
              2
            </div>
            <span className="text-xs font-bold text-slate-800">Template</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1.5 z-10 bg-white px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 3 ? 'bg-[#002d1c] text-emerald-400' : 'bg-slate-200 text-slate-500'}`}>
              3
            </div>
            <span className="text-xs font-bold text-slate-800">Schedule</span>
          </div>
        </div>
      </div>

      {/* Final Review Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 mb-2">Final Review</h2>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <Mail className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Email Subject</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">Your Monthly Growth Analysis - September 2024</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <Clock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Sending Schedule</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">Currently set to: <span className="text-emerald-700">Send Immediately</span></p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-emerald-800 tracking-wider uppercase block">Delivery Optimization</span>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                We recommend <span className="font-bold text-slate-900">Send Time Optimization</span> to increase open rates by 14% based on your audience's past behavior.
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Launch Modal Card */}
        {showLaunchModal && (
          <div className="md:col-span-5 bg-[#002d1c] text-white p-6 rounded-2xl shadow-xl space-y-6 border border-emerald-900">
            <div>
              <h2 className="text-lg font-bold mb-2">Campaign Launch</h2>
              <p className="text-xs text-emerald-100 leading-relaxed">
                You are about to send to <span className="font-bold text-white">12,450 recipients</span>. Please double check all details before proceeding.
              </p>
            </div>

            <div className="space-y-3">
              <button
                disabled={isLaunching}
                onClick={() => handleLaunchNow('scheduled')}
                className="w-full bg-white hover:bg-slate-100 text-[#002d1c] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Calendar className="w-4 h-4" />
                Schedule for Later
              </button>

              <button
                disabled={isLaunching}
                onClick={() => handleLaunchNow('immediate')}
                className="w-full bg-[#02472d] hover:bg-[#035a39] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition border border-emerald-700 shadow-sm"
              >
                <Send className="w-4 h-4 text-emerald-400" />
                {isLaunching ? 'Dispatching...' : 'Send Now'}
              </button>
            </div>

            <p className="text-[10px] text-emerald-300 text-center">
              By clicking Send Now, you agree to our anti-spam policy.
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

      {/* Footer Navigation Controls */}
      <div className="flex items-center justify-between pt-4 bg-white p-4 rounded-xl border border-slate-100">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Previous
        </button>

        <div className="flex items-center gap-3">
          <button className="text-xs font-semibold text-slate-500 hover:text-slate-800">
            Save as Draft
          </button>
          <button
            onClick={() => setShowLaunchModal(true)}
            className="bg-[#002d1c] hover:bg-[#02472d] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-xs transition"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
