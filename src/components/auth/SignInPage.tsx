import React, { useState } from 'react';
import { Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { ActivePage } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SignInPageProps {
  onNavigate: (page: ActivePage) => void;
  onSignInSuccess: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate, onSignInSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
      setIsLoading(false);
      onSignInSuccess();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Invalid login credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafb] to-[#f0f4f2] flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#002d1c] text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Mail className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Evergreen Mail</h1>
          <p className="text-xs text-slate-500 mt-1">Marketing CRM for modern growth</p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-200">
              {errorMsg}
            </div>
          )}
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('reset_password')}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <label htmlFor="remember" className="text-xs text-slate-600">
                Remember for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#002d1c] hover:bg-[#02472d] text-white py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm mt-2"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
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
              onClick={onSignInSuccess}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <span className="text-blue-500 font-bold text-sm">G</span> Google
            </button>
            <button
              type="button"
              onClick={onSignInSuccess}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <span className="font-bold text-sm">🔒</span> SSO
            </button>
          </div>

          <p className="text-xs text-center text-slate-500 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="font-bold text-emerald-600 hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 mt-8">
          <span>© 2024 Evergreen Mail.</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Contact Support</a>
        </div>
      </div>
    </div>
  );
};
