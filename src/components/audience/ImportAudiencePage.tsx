import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Trash2, ArrowRight, Info, Loader2 } from 'lucide-react';
import { Contact } from '../../types';
import { fetchContacts, importManualContacts } from '../../api/client';

export const ImportAudiencePage: React.FC = () => {
  const [manualText, setManualText] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportedSuccess, setIsImportedSuccess] = useState(false);

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

  const handleValidateManual = async () => {
    if (!manualText.trim()) return;
    setIsImporting(true);
    try {
      const newItems = await importManualContacts(manualText);
      setContacts(prev => [...newItems, ...prev]);
      setManualText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = (id: number) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleConfirmImport = () => {
    setIsImportedSuccess(true);
    setTimeout(() => setIsImportedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Import Contacts</h1>
      </div>

      {/* Top 2 Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload File Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900">Upload File</h2>
              <UploadCloud className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-500 mb-4">CSV, XLS, or XLSX files up to 50MB.</p>

            <div className="border-2 border-dashed border-emerald-200/80 rounded-xl p-8 text-center bg-emerald-50/20 hover:bg-emerald-50/40 transition cursor-pointer">
              <div className="w-10 h-10 bg-[#002d1c] text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800 mb-1">
                Drag and drop your contact list here
              </p>
              <p className="text-xs text-slate-400">
                or <span className="text-emerald-600 font-bold hover:underline">browse files</span>
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-start gap-2.5 border border-slate-100">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-normal">
              Ensure your file includes 'Email' as a header column for successful mapping.
            </p>
          </div>
        </div>

        {/* Paste Contacts Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900">Paste Contacts</h2>
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-500 mb-4">Enter emails separated by commas or new lines.</p>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Manual Entry</span>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="e.g. hello@company.com, marketing@team.org..."
                rows={5}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleValidateManual}
            disabled={isImporting}
            className="w-full mt-4 bg-emerald-100 hover:bg-emerald-200 text-[#002d1c] font-bold text-xs py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#002d1c]" />
                Validating & Syncing...
              </>
            ) : (
              'Validate Manual List'
            )}
          </button>
        </div>
      </div>

      {/* Import Preview Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
        {isImportedSuccess && (
          <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Contacts successfully synced to audience database!
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900">Import Preview</h2>
            <span className="bg-emerald-100 text-[#002d1c] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              {contacts.length} CONTACTS DETECTED
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setContacts([])}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
            >
              Clear All
            </button>
            <button
              onClick={handleConfirmImport}
              className="bg-[#002d1c] hover:bg-[#02472d] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-xs transition"
            >
              <span>Confirm Import</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">First Name</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4">
                    {contact.status === 'Valid' ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-bold text-red-600">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Duplicate
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{contact.email}</td>
                  <td className="py-3 px-4 text-slate-600">{contact.first_name || '—'}</td>
                  <td className="py-3 px-4 text-slate-600">{contact.company || '—'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-slate-400 hover:text-red-500 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center pt-2">
          <button className="bg-emerald-50/80 hover:bg-emerald-100 text-[#002d1c] px-4 py-2 rounded-lg font-bold text-xs transition">
            Load more contacts (38 remaining)
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-4 border-t border-slate-100">
        <span>© 2024 Evergreen Mail. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Contact Support</a>
        </div>
      </div>
    </div>
  );
};
