import React, { useState, useEffect } from 'react';
import {
  MousePointerClick,
  FileText,
  TrendingUp,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  Eye,
  MessageSquare,
  Sparkles,
  X,
  Layers,
  ArrowRight,
  RefreshCw,
  Phone,
  Mail,
  User as UserIcon,
  HelpCircle,
} from 'lucide-react';
import {
  LandingPageItem,
  FormSubmissionItem,
  ResponseTrackingOverviewData,
  FormField,
  FieldType,
} from '../../types';
import {
  fetchResponseTrackingOverview,
  fetchLandingPages,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
  fetchLandingPageSubmissions,
} from '../../api/client';

interface ResponseTrackingPageProps {
  onPreviewPublicPage?: (slug: string) => void;
}

export const ResponseTrackingPage: React.FC<ResponseTrackingPageProps> = ({ onPreviewPublicPage }) => {
  const [overview, setOverview] = useState<ResponseTrackingOverviewData | null>(null);
  const [landingPages, setLandingPages] = useState<LandingPageItem[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<FormSubmissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pages' | 'submissions'>('pages');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Modal states
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmissionItem | null>(null);

  // Form Builder state
  const [builderTitle, setBuilderTitle] = useState('');
  const [builderSlug, setBuilderSlug] = useState('');
  const [builderHeadline, setBuilderHeadline] = useState('Welcome to Our Special Offer');
  const [builderSubheadline, setBuilderSubheadline] = useState('Please fill out the form below to get started.');
  const [builderBodyText, setBuilderBodyText] = useState('We value your input! Share your details with us and claim exclusive access.');
  const [builderBannerUrl, setBuilderBannerUrl] = useState('');
  const [builderCtaButtonText, setBuilderCtaButtonText] = useState('Submit & Claim Offer');
  const [builderCtaRedirectUrl, setBuilderCtaRedirectUrl] = useState('https://example.com/thank-you');
  const [builderFormFields, setBuilderFormFields] = useState<FormField[]>([
    { id: 'name', label: 'Full Name', field_type: 'text', required: true, placeholder: 'Jane Doe' },
    { id: 'email', label: 'Email Address', field_type: 'email', required: true, placeholder: 'jane@example.com' },
    { id: 'phone', label: 'Phone Number', field_type: 'phone', required: false, placeholder: '+1 (555) 123-4567' },
    { id: 'feedback', label: 'Comments / Request', field_type: 'textarea', required: false, placeholder: 'How can we help you?' },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [builderError, setBuilderError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, pagesRes] = await Promise.all([
        fetchResponseTrackingOverview().catch(() => null),
        fetchLandingPages().catch(() => []),
      ]);
      if (overviewRes) {
        setOverview(overviewRes);
        setAllSubmissions(overviewRes.recent_submissions || []);
      }
      setLandingPages(pagesRes || []);
    } catch (err) {
      console.error('Error loading response tracking data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/#p=${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleOpenCreateModal = () => {
    setEditingPageId(null);
    setBuilderTitle('Product Feedback Landing Page');
    setBuilderSlug(`feedback-${Math.floor(1000 + Math.random() * 9000)}`);
    setBuilderHeadline('Share Your Feedback With Us');
    setBuilderSubheadline('We want to build the best experience for you. Let us know your thoughts!');
    setBuilderBodyText('Complete the simple form below to help us tailor our emails to your preferences.');
    setBuilderBannerUrl('');
    setBuilderCtaButtonText('Submit Feedback');
    setBuilderCtaRedirectUrl('https://google.com');
    setBuilderFormFields([
      { id: 'name', label: 'Full Name', field_type: 'text', required: true, placeholder: 'Your Name' },
      { id: 'email', label: 'Email Address', field_type: 'email', required: true, placeholder: 'name@company.com' },
      { id: 'phone', label: 'Phone Number', field_type: 'phone', required: false, placeholder: '+1 (555) 000-0000' },
      { id: 'comments', label: 'Your Feedback / Questions', field_type: 'textarea', required: false, placeholder: 'What features would you like to see next?' },
    ]);
    setBuilderError(null);
    setIsBuilderOpen(true);
  };

  const handleOpenEditModal = (page: LandingPageItem) => {
    setEditingPageId(page.id);
    setBuilderTitle(page.title);
    setBuilderSlug(page.slug);
    setBuilderHeadline(page.headline);
    setBuilderSubheadline(page.subheadline || '');
    setBuilderBodyText(page.body_text || '');
    setBuilderBannerUrl(page.banner_url || '');
    setBuilderCtaButtonText(page.cta_button_text);
    setBuilderCtaRedirectUrl(page.cta_redirect_url || '');
    setBuilderFormFields(page.form_fields && page.form_fields.length > 0 ? page.form_fields : [
      { id: 'name', label: 'Full Name', field_type: 'text', required: true, placeholder: 'Your Name' },
      { id: 'email', label: 'Email Address', field_type: 'email', required: true, placeholder: 'name@company.com' },
    ]);
    setBuilderError(null);
    setIsBuilderOpen(true);
  };

  const handleAddField = (type: FieldType) => {
    const id = `field_${Date.now()}`;
    const labels: Record<FieldType, string> = {
      text: 'Custom Input',
      email: 'Email Address',
      phone: 'Phone Number',
      textarea: 'Comments / Notes',
      select: 'Select Choice',
      checkbox: 'I agree to terms',
    };
    const newField: FormField = {
      id,
      label: labels[type] || 'New Field',
      field_type: type,
      required: false,
      placeholder: type === 'select' ? '' : 'Enter value...',
      options: type === 'select' ? ['Option 1', 'Option 2', 'Option 3'] : [],
    };
    setBuilderFormFields([...builderFormFields, newField]);
  };

  const handleRemoveField = (id: string) => {
    setBuilderFormFields(builderFormFields.filter(f => f.id !== id));
  };

  const handleUpdateField = (id: string, updates: Partial<FormField>) => {
    setBuilderFormFields(builderFormFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSaveLandingPage = async () => {
    if (!builderTitle.trim()) {
      setBuilderError('Landing Page title is required.');
      return;
    }
    setIsSaving(true);
    setBuilderError(null);

    const payload = {
      title: builderTitle.trim(),
      slug: builderSlug.trim() || undefined,
      headline: builderHeadline.trim(),
      subheadline: builderSubheadline.trim() || undefined,
      body_text: builderBodyText.trim() || undefined,
      banner_url: builderBannerUrl.trim() || undefined,
      cta_button_text: builderCtaButtonText.trim() || 'Submit',
      cta_redirect_url: builderCtaRedirectUrl.trim() || undefined,
      form_fields: builderFormFields,
      status: 'Active',
    };

    try {
      if (editingPageId) {
        await updateLandingPage(editingPageId, payload);
      } else {
        await createLandingPage(payload);
      }
      setIsBuilderOpen(false);
      await loadData();
    } catch (err: any) {
      setBuilderError(err.message || 'Failed to save landing page.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePage = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this landing page? All associated submissions will be purged.')) {
      return;
    }
    try {
      await deleteLandingPage(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete landing page.');
    }
  };

  const filteredPages = landingPages.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubmissions = allSubmissions.filter(s =>
    (s.recipient_email && s.recipient_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.landing_page_title && s.landing_page_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    JSON.stringify(s.submitted_data).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Email Conversion & Response Tracking Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Response Tracking</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Create conversion-optimized landing pages with dynamic form fields (Name, Phone Number, Email, Custom Feedback) and track CTA button clicks originating from your email campaigns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="bg-[#002d1c] hover:bg-[#02472d] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Create Landing Page</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total CTA Clicks</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {overview?.total_clicks ?? landingPages.reduce((a, b) => a + b.cta_clicks_count, 0)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Tracked from Emails & Pages</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MousePointerClick className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Form Submissions</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {overview?.total_submissions ?? landingPages.reduce((a, b) => a + b.submissions_count, 0)}
            </h3>
            <p className="text-[11px] text-blue-600 font-bold mt-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>Feedback & Lead Submissions</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Conversion</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {overview?.overall_conversion_rate ?? 0}%
            </h3>
            <p className="text-[11px] text-purple-600 font-bold mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Submissions / Page Views</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Pages</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {overview?.total_pages ?? landingPages.length}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Landing page templates</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('pages')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'pages'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Landing Pages ({landingPages.length})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'submissions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Form Responses ({allSubmissions.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search landing pages or responses..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Tab 1: Landing Pages Grid */}
        {activeTab === 'pages' && (
          <div className="p-6">
            {filteredPages.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No landing pages found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Create your first landing page with dynamic form fields (Name, Phone Number, Email, Feedback) to track CTA clicks and receive responses.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="mt-4 bg-[#002d1c] hover:bg-[#02472d] text-white px-4 py-2 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Build First Landing Page</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPages.map(page => (
                  <div
                    key={page.id}
                    className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-md transition group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {page.status}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-2 tracking-tight group-hover:text-emerald-700 transition">
                            {page.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">/p/{page.slug}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 mb-4 font-medium">
                        {page.headline}
                      </p>

                      {/* Performance Stats Mini Pill */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-slate-100 mb-4">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Views</p>
                          <p className="text-sm font-extrabold text-slate-800">{page.views_count}</p>
                        </div>
                        <div className="text-center border-x border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">CTA Clicks</p>
                          <p className="text-sm font-extrabold text-emerald-600">{page.cta_clicks_count}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Submissions</p>
                          <p className="text-sm font-extrabold text-blue-600">{page.submissions_count}</p>
                        </div>
                      </div>

                      {/* Fields Summary */}
                      <div className="text-[11px] text-slate-500 mb-4 flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-700">Form Fields:</span>
                        {page.form_fields.map(f => (
                          <span key={f.id} className="bg-slate-200/60 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                            {f.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyLink(page.slug)}
                          className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Copy Link for Email CTA"
                        >
                          {copiedSlug === page.slug ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => onPreviewPublicPage && onPreviewPublicPage(page.slug)}
                          className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Preview Landing Page"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(page)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200/80 rounded-lg transition flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePage(page.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Form Responses Table */}
        {activeTab === 'submissions' && (
          <div className="overflow-x-auto">
            {filteredSubmissions.length === 0 ? (
              <div className="py-16 text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No form submissions received yet</p>
                <p className="text-xs text-slate-400 mt-1">When users fill out landing page forms, their details will appear here.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Landing Page</th>
                    <th className="py-3 px-4">Submitted Email / User</th>
                    <th className="py-3 px-4">Form Data Preview</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSubmissions.map(s => {
                    const keys = Object.keys(s.submitted_data || {});
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {s.landing_page_title || `Page #${s.landing_page_id}`}
                          <p className="text-[10px] text-slate-400 font-mono">/p/{s.landing_page_slug}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-800">{s.recipient_email || s.submitted_data?.email || 'Anonymous Visitor'}</span>
                          </div>
                          {s.submitted_data?.phone && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{s.submitted_data.phone}</span>
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate">
                          <div className="flex items-center gap-1 flex-wrap">
                            {keys.slice(0, 3).map(k => (
                              <span key={k} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                                <strong>{k}:</strong> {String(s.submitted_data[k])}
                              </span>
                            ))}
                            {keys.length > 3 && <span className="text-slate-400 font-bold">+{keys.length - 3} more</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(s.created_at).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedSubmission(s)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition"
                          >
                            View Full Response
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">Form Submission Details</h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <p className="text-xs font-bold text-emerald-900">{selectedSubmission.landing_page_title}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">Submitted on: {new Date(selectedSubmission.created_at).toLocaleString()}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Answers</h4>
                {Object.entries(selectedSubmission.submitted_data || {}).map(([key, val]) => (
                  <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{key.replace('_', ' ')}</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1 whitespace-pre-wrap">{String(val)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Close Response
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Landing Page & Custom Form Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {editingPageId ? 'Edit Landing Page & Form' : 'Create New Landing Page & Form'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure landing page copy, call-to-action button, and custom input fields.</p>
              </div>
              <button
                onClick={() => setIsBuilderOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {builderError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-100">
                {builderError}
              </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              {/* Form Controls Column */}
              <div className="lg:col-span-7 p-6 space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    1. Page Identity & Headlines
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Page Title (Internal)</label>
                    <input
                      type="text"
                      value={builderTitle}
                      onChange={e => setBuilderTitle(e.target.value)}
                      placeholder="e.g. VIP Member Feedback Form"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">URL Slug</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200">/p/</span>
                      <input
                        type="text"
                        value={builderSlug}
                        onChange={e => setBuilderSlug(e.target.value)}
                        placeholder="vip-feedback"
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Main Headline</label>
                    <input
                      type="text"
                      value={builderHeadline}
                      onChange={e => setBuilderHeadline(e.target.value)}
                      placeholder="Welcome to Our Exclusive Offer"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subheadline</label>
                    <input
                      type="text"
                      value={builderSubheadline}
                      onChange={e => setBuilderSubheadline(e.target.value)}
                      placeholder="Please fill out the form below to get started."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Body Text / Instructions</label>
                    <textarea
                      rows={2}
                      value={builderBodyText}
                      onChange={e => setBuilderBodyText(e.target.value)}
                      placeholder="Explain what the visitor will get when they submit..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                </div>

                {/* Form Fields Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      2. Customizable Form Fields
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleAddField('text')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded-md transition"
                      >
                        + Text Field
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddField('phone')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded-md transition"
                      >
                        + Phone Field
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddField('textarea')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded-md transition"
                      >
                        + Textarea Field
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {builderFormFields.map((field, idx) => (
                      <div key={field.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-500">Field #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveField(field.id)}
                            className="text-red-500 hover:text-red-700 text-[11px] font-bold"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Label</label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={e => handleUpdateField(field.id, { label: e.target.value })}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Type</label>
                            <select
                              value={field.field_type}
                              onChange={e => handleUpdateField(field.id, { field_type: e.target.value as FieldType })}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                            >
                              <option value="text">Text Input</option>
                              <option value="email">Email Address</option>
                              <option value="phone">Phone Number</option>
                              <option value="textarea">Textarea (Multi-line)</option>
                              <option value="select">Dropdown Select</option>
                              <option value="checkbox">Checkbox</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={e => handleUpdateField(field.id, { placeholder: e.target.value })}
                            placeholder="Placeholder text..."
                            className="p-1 bg-white border border-slate-200 rounded text-[11px] text-slate-700 w-2/3"
                          />
                          <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={e => handleUpdateField(field.id, { required: e.target.checked })}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Required</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button Config */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                    3. Call To Action (CTA) Settings
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Submit CTA Button Text</label>
                      <input
                        type="text"
                        value={builderCtaButtonText}
                        onChange={e => setBuilderCtaButtonText(e.target.value)}
                        placeholder="Submit & Claim"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">CTA Redirect URL (Optional)</label>
                      <input
                        type="text"
                        value={builderCtaRedirectUrl}
                        onChange={e => setBuilderCtaRedirectUrl(e.target.value)}
                        placeholder="https://yourwebsite.com/thank-you"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Pane */}
              <div className="lg:col-span-5 p-6 bg-slate-100/70 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      <span>Live Device Preview</span>
                    </span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full">Responsive</span>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-4 max-w-sm mx-auto">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-[#002d1c] text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                        {builderHeadline || 'Page Headline'}
                      </h3>
                      {builderSubheadline && (
                        <p className="text-xs text-slate-500 mt-1">{builderSubheadline}</p>
                      )}
                    </div>

                    {builderBodyText && (
                      <p className="text-xs text-slate-600 text-center leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {builderBodyText}
                      </p>
                    )}

                    <div className="space-y-3 pt-2">
                      {builderFormFields.map(f => (
                        <div key={f.id}>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            {f.label} {f.required && <span className="text-red-500">*</span>}
                          </label>
                          {f.field_type === 'textarea' ? (
                            <div className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-400 font-normal">
                              {f.placeholder || 'Enter response...'}
                            </div>
                          ) : (
                            <div className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-400 font-normal">
                              {f.placeholder || `Enter ${f.label.toLowerCase()}...`}
                            </div>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        className="w-full bg-[#002d1c] text-emerald-400 py-2.5 px-4 rounded-xl font-bold text-xs shadow-md"
                      >
                        {builderCtaButtonText || 'Submit'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBuilderOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveLandingPage}
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#002d1c] hover:bg-[#02472d] text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2"
                  >
                    {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
                    <span>{editingPageId ? 'Save Changes' : 'Publish Landing Page'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
