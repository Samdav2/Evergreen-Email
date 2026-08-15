import React, { useState, useEffect } from 'react';
import { Plus, Users, Mail, TrendingUp, Sparkles, ArrowRight, Layout, Loader2 } from 'lucide-react';
import { ActivePage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { fetchAnalyticsSummary } from '../../api/client';

interface DashboardOverviewProps {
  onNavigate: (page: ActivePage) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await fetchAnalyticsSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#002d1c] to-[#02472d] text-white p-8 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> SIMPLE EMAIL CRM v1.0
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}.
          </h1>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            Your marketing CRM is running smoothly. Overall open rate is up 2.4% this week.
          </p>
        </div>

        <div className="flex gap-3 z-10">
          <button
            onClick={() => onNavigate('new_campaign')}
            className="bg-emerald-400 hover:bg-emerald-300 text-[#002d1c] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> New Campaign
          </button>
          <button
            onClick={() => onNavigate('audience')}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition border border-white/10"
          >
            Import Contacts
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="ml-2 text-sm text-slate-500">Loading analytics...</span>
        </div>
      )}

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+14%</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">Total Contacts</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {summary ? summary.total_contacts.toLocaleString() : '—'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Mail className="w-5 h-5 text-emerald-600" />
            {summary && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +{summary.sent_growth_pct}%
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-500">Emails Sent (30d)</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {summary ? summary.total_sent_30d.toLocaleString() : '—'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            {summary && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +{summary.open_rate_growth_pct}%
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-500">Avg. Open Rate</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {summary ? `${summary.avg_open_rate}%` : '—'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Layout className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{summary?.active_automations || '—'} Active</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">Active Automations</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {summary ? `${summary.active_automations} Active` : '—'}
          </p>
        </div>
      </div>

      {/* Quick Launch Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('audience')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-500 transition cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">Import Audience</h3>
          <p className="text-xs text-slate-500">Upload CSV/XLS lists or paste contacts with automated duplicate detection.</p>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
            Start Import <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('templates')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-500 transition cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
            <Layout className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">Template Designer</h3>
          <p className="text-xs text-slate-500">Design responsive emails with drag-and-drop content blocks and live preview.</p>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
            Open Designer <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('history')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-500 transition cursor-pointer group space-y-3"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">Campaign Analytics</h3>
          <p className="text-xs text-slate-500">Track real-time open trends, CTRs, device engagement, and recipient logs.</p>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
            View Analytics <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
