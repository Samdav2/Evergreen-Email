import React, { useState } from 'react';
import { Leaf, Eye, EyeOff, Sparkles, TrendingUp, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { ActivePage } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SignUpPageProps {
  onNavigate: (page: ActivePage) => void;
  onSignUpSuccess: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate, onSignUpSuccess }) => {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signup(fullName, email, password);
      setIsLoading(false);
      onSignUpSuccess();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center p-4 md:p-8 font-sans text-slate-800">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        {/* Left Branding Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#f2f9f5] to-[#e6f4ed] p-8 md:p-10 flex flex-col justify-between border-r border-slate-100 relative">
          <div>
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-9 h-9 bg-[#002d1c] text-white rounded-lg flex items-center justify-center shadow-sm">
                <Leaf className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xl font-extrabold text-[#002d1c] tracking-tight">SIMPLE EMAIL</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              Grow your audience with <span className="text-emerald-600">organic efficiency.</span>
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed mb-8">
              The premium marketing CRM designed for professionals who value precision, automation, and sustainable growth.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-auto">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-emerald-100/60 shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-600 mb-2" />
              <h3 className="text-xs font-bold text-slate-900 mb-0.5">Smart Campaigns</h3>
              <p className="text-[11px] text-slate-500 leading-tight">Automated workflows that learn.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-emerald-100/60 shadow-xs">
              <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
              <h3 className="text-xs font-bold text-slate-900 mb-0.5">Real-time Analytics</h3>
              <p className="text-[11px] text-slate-500 leading-tight">Deep insights into every open.</p>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
            <p className="text-xs text-slate-500 mb-6">Join the community of high-performance marketers.</p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Cooper"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@simpleemail.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Must be at least 8 characters long.</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="terms" className="text-xs text-slate-600">
                  I agree to the <a href="#" className="font-semibold text-slate-800 hover:underline">Terms of Service</a> and <a href="#" className="font-semibold text-slate-800 hover:underline">Privacy Policy</a>.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#002d1c] hover:bg-[#02472d] text-white py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm mt-2"
              >
                {isLoading ? 'Creating account...' : 'Join SIMPLE EMAIL'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">OR CONTINUE WITH</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onSignUpSuccess}
                className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <span className="text-blue-500 font-bold text-sm">G</span> Google
              </button>
              <button
                type="button"
                onClick={onSignUpSuccess}
                className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <span className="font-bold text-sm">🍎</span> Apple
              </button>
            </div>

            <p className="text-xs text-center text-slate-500 mt-6">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('signin')}
                className="font-bold text-slate-900 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
