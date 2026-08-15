import React, { useState, useEffect } from 'react';
import { Share2, Download, MousePointer, Mail, MapPin, Smartphone, Laptop, Tablet, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { ActivePage } from '../../types';
import { fetchCampaignAnalytics } from '../../api/client';

interface CampaignAnalyticsPageProps {
  campaignId: number;
  onNavigate: (page: ActivePage) => void;
}

export const CampaignAnalyticsPage: React.FC<CampaignAnalyticsPageProps> = ({ campaignId, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'recipients' | 'preview'>('analytics');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [campaignId]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCampaignAnalytics(campaignId);
      setAnalyticsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-sm text-slate-500">Loading analytics...</span>
      </div>
    );
  }

  const trendData = analyticsData?.engagement_trends || [];

  return (
    <div className="space-y-6">
      {/* Top Header Tabs & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 rounded-lg transition ${activeTab === 'analytics' ? 'bg-white text-[#002d1c] shadow-xs' : 'text-slate-500'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => { setActiveTab('recipients'); onNavigate('recipients'); }}
            className={`px-4 py-1.5 rounded-lg transition ${activeTab === 'recipients' ? 'bg-white text-[#002d1c] shadow-xs' : 'text-slate-500'}`}
          >
            Recipient List
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-1.5 rounded-lg transition ${activeTab === 'preview' ? 'bg-white text-[#002d1c] shadow-xs' : 'text-slate-500'}`}
          >
            Content Preview
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Share2 className="w-3.5 h-3.5" /> Share Report
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#002d1c] hover:bg-[#02472d] text-white rounded-lg text-xs font-bold shadow-xs">
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Export PDF
          </button>
        </div>
      </div>

      {/* Campaign Metadata Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">SENT</span>
          <span className="text-xs text-slate-400 font-medium">• {analyticsData?.sent_date || '—'}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{analyticsData?.subject || 'Campaign Analytics'}</h1>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Mail className="w-5 h-5 text-emerald-600" />
            {analyticsData && (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {analyticsData.open_rate !== undefined ? `${analyticsData.open_rate}% Rate` : '+2.4%'}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-500">Total Opens</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {analyticsData ? (analyticsData.total_opens || 0).toLocaleString() : '—'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <MousePointer className="w-5 h-5 text-emerald-600" />
            {analyticsData && (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> {analyticsData.total_clicks || 0} Clicks
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-500">Click-Through Rate (CTR)</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {analyticsData ? `${analyticsData.ctr || 0}%` : '—'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Mail className="w-5 h-5 text-emerald-600" />
            {analyticsData && (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {analyticsData.total_sent || 0} Sent
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-500">Delivered</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {analyticsData ? (analyticsData.total_delivered || 0).toLocaleString() : '—'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Mail className="w-5 h-5 text-slate-400" />
            {analyticsData && (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {analyticsData.bounce_rate <= 2 ? 'Healthy' : 'High'}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-500">Bounce Rate</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {analyticsData ? `${analyticsData.bounce_rate || 0}%` : '—'}
          </p>
        </div>
      </div>

      {/* Engagement Trends Chart Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Engagement Trends</h2>
          <p className="text-xs text-slate-500">Tracking opens vs clicks over time</p>
        </div>

        <div className="h-64 w-full pt-4">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#002d1c" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#002d1c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="opens" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOpens)" />
                <Area type="monotone" dataKey="clicks" stroke="#002d1c" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">No engagement data available</div>
          )}
        </div>
      </div>

      {/* Bottom 3 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Engagement by Device</h3>
          <div className="space-y-3">
            {(analyticsData?.device_breakdown && analyticsData.device_breakdown.length > 0) ? (
              analyticsData.device_breakdown.map((item: any) => {
                const isMobile = item.device?.toLowerCase() === 'mobile';
                const isDesktop = item.device?.toLowerCase() === 'desktop';
                const IconComp = isMobile ? Smartphone : isDesktop ? Laptop : Tablet;
                const barColor = isMobile ? 'bg-emerald-600' : isDesktop ? 'bg-[#002d1c]' : 'bg-slate-300';
                return (
                  <div key={item.device} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium text-slate-700">
                        <IconComp className="w-4 h-4 text-emerald-600" /> {item.device}
                      </span>
                      <span className="font-bold text-slate-900">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${barColor} h-full`} style={{ width: `${Math.max(item.percentage, 2)}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No device data available</p>
            )}
          </div>
        </div>

        {/* Geographic Reach */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Geographic Reach</h3>
          <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-2">
            <MapPin className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-slate-900 text-center">Top Locations</p>
            {analyticsData?.location_breakdown && analyticsData.location_breakdown.length > 0 ? (
              <p className="text-[11px] text-slate-600 text-center leading-relaxed font-medium">
                {analyticsData.location_breakdown.map((loc: any) => `${loc.location} (${loc.percentage}%)`).join(', ')}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 text-center">No location logs available</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
            <span className="text-[11px] font-bold text-slate-400">Live Logs</span>
          </div>

          <div className="space-y-3 text-xs max-h-56 overflow-y-auto pr-1">
            {analyticsData?.recent_activity && analyticsData.recent_activity.length > 0 ? (
              analyticsData.recent_activity.map((act: any, idx: number) => {
                const initials = act.recipient_email?.substring(0, 2).toUpperCase() || 'EM';
                const eventLabel = act.event_type === 'opened' ? 'opened the email' : act.event_type === 'clicked' ? 'clicked email link' : act.event_type === 'delivered' ? 'email delivered' : 'delivery failed';
                const badgeColor = act.event_type === 'clicked' ? 'bg-emerald-600 text-white' : act.event_type === 'opened' ? 'bg-emerald-100 text-[#002d1c]' : 'bg-slate-100 text-slate-700';

                return (
                  <div key={act.id || idx} className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 ${badgeColor} rounded-full flex items-center justify-center font-bold text-[10px] shrink-0`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        <span className="font-bold">{act.recipient_email}</span> {eventLabel}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {act.timestamp} • {act.location} ({act.device_type})
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No recent activity logs recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


