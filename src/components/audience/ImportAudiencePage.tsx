import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Trash2, Users, Info, Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { Contact, PaginatedContacts } from '../../types';
import { fetchContacts, importManualContacts, uploadContactsFile } from '../../api/client';

export const ImportAudiencePage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manualText, setManualText] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [page, setPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ valid: number; duplicate: number; invalid: number } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadContacts(1);
  }, []);

  const loadContacts = async (pageNum: number, append: boolean = false) => {
    if (!append) setIsLoading(true);
    else setIsLoadingMore(true);
    try {
      const data: PaginatedContacts = await fetchContacts(pageNum);
      if (append) {
        setContacts(prev => [...prev, ...data.items]);
      } else {
        setContacts(data.items);
      }
      setTotalContacts(data.total);
      setHasMore(data.has_next);
      setPage(pageNum);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load contacts');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) loadContacts(page + 1, true);
  };

  const importEmails = async (emails: string, source: string) => {
    if (!emails.trim()) return;
    setIsImporting(true);
    setImportResult(null);
    try {
      const result: any = await importManualContacts(emails);
      setContacts(prev => [...result.contacts, ...prev]);
      setTotalContacts(prev => prev + result.valid_count);
      setImportResult({
        valid: result.valid_count,
        duplicate: result.duplicate_count,
        invalid: result.invalid_count,
      });
      showToast('success', `${result.valid_count} contacts imported from ${source}`);
    } catch (err: any) {
      showToast('error', err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportManual = () => {
    importEmails(manualText, 'text entry').then(() => setManualText(''));
  };

  const handleFileProcess = async (file: File) => {
    const validExts = /\.(csv|xls|xlsx|eml|msg)$/i;
    if (!file.name.match(validExts)) {
      showToast('error', 'Unsupported format. Use CSV, Excel (.xls/.xlsx), .eml, or .msg files.');
      return;
    }
    setIsImporting(true);
    setImportResult(null);
    setSelectedFile(file);
    try {
      const result: any = await uploadContactsFile(file);
      setContacts(prev => [...result.contacts, ...prev]);
      setTotalContacts(prev => prev + result.valid_count);
      setImportResult({
        valid: result.valid_count,
        duplicate: result.duplicate_count,
        invalid: result.invalid_count,
      });
      showToast('success', `${result.valid_count} contacts imported from ${file.name}`);
    } catch (err: any) {
      showToast('error', err.message || 'File upload failed');
    } finally {
      setIsImporting(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDelete = (id: number) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setTotalContacts(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 p-3.5 rounded-xl border text-xs font-semibold ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          }
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Import Contacts</h1>
        <button
          onClick={() => loadContacts(1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Import Result Banner */}
      {importResult && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> {importResult.valid} Valid
            </span>
            {importResult.duplicate > 0 && (
              <span className="flex items-center gap-1.5 font-bold text-amber-600">
                <AlertCircle className="w-4 h-4" /> {importResult.duplicate} Duplicates
              </span>
            )}
            {importResult.invalid > 0 && (
              <span className="flex items-center gap-1.5 font-bold text-red-600">
                <AlertCircle className="w-4 h-4" /> {importResult.invalid} Invalid
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">Imported contacts listed below</span>
        </div>
      )}

      {/* Top 2 Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload File Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900">Upload File</h2>
              <UploadCloud className="w-5 h-5 text-emerald-600" />
            </div>
              <p className="text-xs text-slate-500 mb-4">CSV, Excel, .eml, or .msg files — emails extracted automatically.</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx,.eml,.msg"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
                dragOver
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-emerald-200/80 bg-emerald-50/20 hover:bg-emerald-50/40'
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-800">{selectedFile.name}</span>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 bg-[#002d1c] text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mb-1">
                    Drag & drop your file here
                  </p>
                  <p className="text-xs text-slate-400">
                    or <span className="text-emerald-600 font-bold hover:underline">browse files</span>
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-start gap-2.5 border border-slate-100">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-normal">
              Supports CSV, Excel, .eml, and .msg files. Emails are extracted and duplicates auto-detected.
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
            onClick={handleImportManual}
            disabled={isImporting || !manualText.trim()}
            className="w-full mt-4 bg-emerald-100 hover:bg-emerald-200 text-[#002d1c] font-bold text-xs py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#002d1c]" />
                Importing...
              </>
            ) : (
              'Import Contacts'
            )}
          </button>
        </div>
      </div>

      {/* Contact List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900">Contact List</h2>
            <span className="bg-emerald-100 text-[#002d1c] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              {totalContacts} CONTACTS
            </span>
          </div>

          {contacts.length > 0 && (
            <button
              onClick={() => { setContacts([]); setTotalContacts(0); setHasMore(false); setPage(1); }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
            >
              Clear List
            </button>
          )}
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading contacts...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No contacts yet. Paste emails above or upload a file.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      {contact.status === 'Valid' || contact.status === 'valid' ? (
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-bold text-amber-600">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> {contact.status}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        {hasMore && !isLoading && (
          <div className="text-center pt-2">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 transition disabled:opacity-50"
            >
              {isLoadingMore ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              {isLoadingMore ? 'Loading...' : `Load More (${totalContacts - contacts.length} remaining)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
