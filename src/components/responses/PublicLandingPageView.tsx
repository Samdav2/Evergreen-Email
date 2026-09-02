import React, { useState, useEffect } from 'react';
import { Leaf, Sparkles, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { LandingPageItem } from '../../types';
import { fetchPublicLandingPage, submitPublicForm, trackCtaClick } from '../../api/client';

interface PublicLandingPageViewProps {
  slug: string;
  onBackToApp?: () => void;
}

export const PublicLandingPageView: React.FC<PublicLandingPageViewProps> = ({ slug, onBackToApp }) => {
  const [pageData, setPageData] = useState<LandingPageItem | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPublicPage();
  }, [slug]);

  const loadPublicPage = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchPublicLandingPage(slug);
      setPageData(data);
      // Initialize form values
      const initial: Record<string, any> = {};
      if (data.form_fields) {
        data.form_fields.forEach(f => {
          initial[f.id] = '';
        });
      }
      setFormData(initial);
    } catch (err: any) {
      setErrorMessage(err.message || 'Landing page not found or disabled.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageData) return;

    // Validate required fields
    for (const f of pageData.form_fields || []) {
      if (f.required && (!formData[f.id] || String(formData[f.id]).trim() === '')) {
        setErrorMessage(`Please fill out ${f.label}.`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Submit Form Data
      await submitPublicForm(slug, formData);
      // 2. Track Click Event
      await trackCtaClick(slug).catch(() => null);

      setIsSubmitted(true);

      // 3. If redirect URL configured, redirect after brief delay
      if (pageData.cta_redirect_url && pageData.cta_redirect_url.startsWith('http')) {
        setTimeout(() => {
          window.location.href = pageData.cta_redirect_url!;
        }, 2000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading Landing Page...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !pageData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center space-y-4 border border-slate-100">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Page Unavailable</h2>
          <p className="text-xs text-slate-500">{errorMessage}</p>
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-5 py-2.5 bg-[#002d1c] text-white font-bold text-xs rounded-xl hover:bg-[#02472d] transition"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#002d1c] to-slate-950 flex flex-col justify-between p-4 md:p-8 text-slate-100 antialiased font-sans">
      {/* Top Brand Navbar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-tight text-white">SIMPLE EMAIL</span>
            <span className="text-[10px] text-emerald-400 font-medium block">Interactive Response Center</span>
          </div>
        </div>

        {onBackToApp && (
          <button
            onClick={onBackToApp}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/10"
          >
            ← Back to App
          </button>
        )}
      </header>

      {/* Main Landing Page Card */}
      <main className="max-w-xl w-full mx-auto my-8">
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-6 md:p-10 space-y-6">
          {pageData?.banner_url && (
            <div className="-mx-6 -mt-6 md:-mx-10 md:-mt-10 mb-6 overflow-hidden max-h-48">
              <img src={pageData.banner_url} alt="Banner" className="w-full h-full object-cover" />
            </div>
          )}

          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Thank You!</h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed font-medium">
                Your response has been successfully recorded. We appreciate your time and feedback!
              </p>
              {pageData?.cta_redirect_url && (
                <div className="pt-2">
                  <p className="text-[11px] text-slate-400">Redirecting you to next page...</p>
                  <a
                    href={pageData.cta_redirect_url}
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    <span>Continue Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[11px] font-extrabold uppercase tracking-wider border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Response Form</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {pageData?.headline}
                </h1>
                {pageData?.subheadline && (
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
                    {pageData.subheadline}
                  </p>
                )}
              </div>

              {pageData?.body_text && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
                  {pageData.body_text}
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {pageData?.form_fields?.map(field => (
                  <div key={field.id} className="space-y-1">
                    <label className="block text-xs font-bold text-slate-800">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.field_type === 'textarea' ? (
                      <textarea
                        rows={3}
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={e => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || 'Type your message...'}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                      />
                    ) : field.field_type === 'select' ? (
                      <select
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={e => handleInputChange(field.id, e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                      >
                        <option value="">Select an option...</option>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.field_type === 'checkbox' ? (
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={!!formData[field.id]}
                          onChange={e => handleInputChange(field.id, e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>{field.placeholder || field.label}</span>
                      </label>
                    ) : (
                      <input
                        type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : 'text'}
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={e => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}...`}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-[#002d1c] hover:bg-[#02472d] text-white py-3.5 px-6 rounded-2xl font-extrabold text-xs shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  ) : (
                    <>
                      <span>{pageData?.cta_button_text || 'Submit Response'}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 font-medium">
        Powered by Evergreen Email &bull; Marketing & Response Tracking System
      </footer>
    </div>
  );
};
