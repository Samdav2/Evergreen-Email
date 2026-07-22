import React, { useState } from 'react';
import { Trees, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ActivePage } from '../../types';

interface ResetPasswordPageProps {
  onNavigate: (page: ActivePage) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafb] to-[#f0f4f2] flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md">
        {/* Top Branding Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#002d1c] text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Trees className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Evergreen Mail</h1>
          <p className="text-xs text-slate-500 mt-0.5">Recover access to your marketing CRM</p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          {isSent ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-slate-900 mb-1">Recovery Link Sent</h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                We've sent a password reset link to <span className="font-semibold text-slate-800">{email}</span>. Please check your inbox.
              </p>
              <button
                onClick={() => onNavigate('signin')}
                className="w-full bg-[#002d1c] hover:bg-[#02472d] text-white py-2.5 px-4 rounded-lg font-semibold text-sm transition shadow-sm"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Reset Password</h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Enter the email address associated with your account and we'll send you a recovery link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#002d1c] hover:bg-[#02472d] text-white py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm mt-2"
                >
                  {isLoading ? 'Sending...' : 'Send Recovery Link'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => onNavigate('signin')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 mt-10">
          <span>© 2024 Evergreen Mail. All rights reserved.</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Contact Support</a>
        </div>
      </div>
    </div>
  );
};
