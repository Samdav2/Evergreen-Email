import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, RotateCcw, Clock, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { Campaign, ActivePage } from '../../types';
import { fetchCampaigns } from '../../api/client';

interface CampaignHistoryPageProps {
  onNavigate: (page: ActivePage) => void;
  onSelectCampaignAnalytics: (campaignId: number) => void;
}

export const CampaignHistoryPage: React.FC<CampaignHistoryPageProps> = ({ onSelectCampaignAnalytics }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c =>
    c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category_label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-bold text-slate-900">History</h1>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaign history..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Sent (30d)</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-900">124,502</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> +12%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Avg. Open Rate</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-900">24.8%</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> +2.4%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Click Rate</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-900">3.2%</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              <ArrowDownRight className="w-3 h-3" /> -0.8%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Bounce Rate</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-900">0.14%</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Stable
            </span>
          </div>
        </div>
      </div>

      {/* Main Email Logs Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Email Logs</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Subject Line</th>
                <th className="py-3 px-4">Sent Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Audience</th>
                <th className="py-3 px-4">Open Rate</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCampaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/50 transition">
                  {/* Subject Line */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onSelectCampaignAnalytics(camp.id)}
                      className="font-bold text-slate-900 hover:text-emerald-700 text-left block"
                    >
                      {camp.subject}
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      {camp.category_label}
                    </span>
                  </td>

                  {/* Sent Date */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {camp.sent_date}
                  </td>

                  {/* Status Pill */}
                  <td className="py-3.5 px-4">
                    {camp.status === 'Sent' && (
                      <span className="bg-emerald-100/80 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Sent
                      </span>
                    )}
                    {camp.status === 'Failed' && (
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Failed
                      </span>
                    )}
                    {camp.status === 'Scheduled' && (
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Scheduled
                      </span>
                    )}
                    {camp.status === 'Active' && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </td>

                  {/* Audience */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {camp.recipients_count.toLocaleString()} users
                  </td>

                  {/* Open Rate Bar */}
                  <td className="py-3.5 px-4">
                    {camp.open_rate > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 w-10">{camp.open_rate}%</span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, camp.open_rate)}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-bold">--</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    {camp.status === 'Failed' ? (
                      <button className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1 rounded-lg text-xs transition inline-flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Retry
                      </button>
                    ) : camp.status === 'Scheduled' ? (
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <Clock className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectCampaignAnalytics(camp.id)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>Showing 1-10 of 1,240 campaigns</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded border border-slate-200 hover:bg-slate-50">&lt;</button>
            <button className="px-3 py-1 rounded font-bold bg-[#002d1c] text-white">1</button>
            <button className="px-3 py-1 rounded hover:bg-slate-100">2</button>
            <button className="px-3 py-1 rounded hover:bg-slate-100">3</button>
            <button className="p-1.5 rounded border border-slate-200 hover:bg-slate-50">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};
