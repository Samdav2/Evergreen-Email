import React, { useState, useEffect } from 'react';
import { Search, Download, Star, Filter, Loader2 } from 'lucide-react';
import { ActivePage, Contact } from '../../types';
import { fetchContacts } from '../../api/client';

interface RecipientListPageProps {
  onNavigate: (page: ActivePage) => void;
}

export const RecipientListPage: React.FC<RecipientListPageProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchContacts();
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.first_name && c.first_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span>Campaigns</span> &gt; <span>Q4 Product Launch</span> &gt; <span className="text-slate-900">Recipients</span>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">TOTAL RECIPIENTS</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-900">12,450</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">DELIVERED</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-900">98.2%</span>
            <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-[98%]"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">BOUNCED</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-900">1.8%</span>
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Below Limit</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">UNSUBSCRIBED</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-900">0.4%</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Optimal</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status: All Statuses</span>
            </div>
            <div className="bg-slate-100 px-3 py-1.5 rounded-lg font-semibold text-slate-700">
              Engagement: Any Score
            </div>
          </div>

          <button className="flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-[#002d1c] font-bold px-3.5 py-1.5 rounded-lg text-xs transition">
            <Download className="w-3.5 h-3.5" /> Export List
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="py-3 px-4">Recipient Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Engagement</th>
                <th className="py-3 px-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#002d1c] font-bold text-[10px] flex items-center justify-center">
                        {contact.first_name ? contact.first_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="font-bold text-slate-900">
                        {contact.first_name ? `${contact.first_name} ${contact.last_name || ''}` : 'Contact'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{contact.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {contact.status || 'Valid'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex gap-0.5 text-emerald-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < (contact.engagement_score || 5) ? 'fill-emerald-500' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">Recent</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>Showing 1 to 25 of 12,450 recipients</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded border border-slate-200">&lt;</button>
            <button className="px-3 py-1 rounded font-bold bg-[#002d1c] text-white">1</button>
            <button className="px-3 py-1 rounded hover:bg-slate-100">2</button>
            <button className="px-3 py-1 rounded hover:bg-slate-100">3</button>
            <span>...</span>
            <button className="px-3 py-1 rounded hover:bg-slate-100">498</button>
            <button className="p-1.5 rounded border border-slate-200">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};
