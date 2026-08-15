import React, { useState, useEffect } from 'react';
import { Leaf, Type, Image as ImageIcon, MousePointer, Space, Minus, Columns, CheckCircle2, Search, Send, Eye, Edit3, Globe, Share2, ExternalLink, Trash2, ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw, FolderOpen, KeyRound, Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { ContentBlock, EmailTemplate } from '../../types';
import { createTemplate, updateTemplate, fetchTemplates, fetchSettings } from '../../api/client';

interface SpamCheckResult {
  score: number; // 0 to 100
  riskLevel: 'Low' | 'Moderate' | 'High';
  findings: { rule: string; impact: number; passed: boolean; message: string }[];
}

export const TemplateDesignerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'styles'>('blocks');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('Template saved successfully');
  const [isSaving, setIsSaving] = useState(false);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [subjectLine, setSubjectLine] = useState('Welcome to the future of growth');
  const [templateName, setTemplateName] = useState('Custom Designed Template');
  const [showSpamModal, setShowSpamModal] = useState(false);
  const [spamModalTab, setSpamModalTab] = useState<'audit' | 'auth'>('audit');

  // Rich Text Link State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');


  // Backend Saved Templates
  const [savedTemplates, setSavedTemplates] = useState<EmailTemplate[]>([]);
  const [loadedTemplateId, setLoadedTemplateId] = useState<number | null>(null);

  const replacePreviewTags = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\{\{first_name\}\}/gi, 'Samuel')
      .replace(/\{\{name\}\}/gi, 'Samuel David')
      .replace(/\{\{last_name\}\}/gi, 'David')
      .replace(/\{\{email\}\}/gi, 'samuel@example.com')
      .replace(/\{\{company\}\}/gi, 'Acme Inc.')
      .replace(/\{\{unsubscribe_url\}\}/gi, '#');
  };

  useEffect(() => {
    fetchSettings().then(setSystemSettings).catch(console.error);
    loadSavedTemplates();
  }, []);

  const loadSavedTemplates = async () => {
    try {
      const list = await fetchTemplates();
      setSavedTemplates(list);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const [blocks, setBlocks] = useState<ContentBlock[]>([
    {
      id: 'b1',
      type: 'text',
      content: 'Welcome to the future of growth.',
      styles: { color: '#002d1c', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', padding: '16px' }
    },
    {
      id: 'b2',
      type: 'text',
      content: "We're thrilled to have you join our sustainable marketing revolution. Start building your success today.",
      styles: { color: '#475569', fontSize: '15px', textAlign: 'left', padding: '8px' }
    },
    {
      id: 'b3',
      type: 'image',
      content: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      styles: { borderRadius: '8px', padding: '16px', altText: 'Evergreen Growth Banner' }
    },
    {
      id: 'b4',
      type: 'button',
      content: 'Get Started Now',
      styles: { backgroundColor: '#002d1c', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textAlign: 'center', linkUrl: 'https://evergreenmail.io' }
    }
  ]);

  const [selectedBlockId, setSelectedBlockId] = useState<string>('b1');

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const handleSelectSavedTemplate = (idStr: string) => {
    if (!idStr) {
      setLoadedTemplateId(null);
      return;
    }
    const id = parseInt(idStr, 10);
    const found = savedTemplates.find(t => t.id === id);
    if (found) {
      setLoadedTemplateId(found.id);
      setTemplateName(found.name);
      setSubjectLine(found.subject_line);
      try {
        const parsedBlocks = JSON.parse(found.content_json);
        if (Array.isArray(parsedBlocks) && parsedBlocks.length > 0) {
          setBlocks(parsedBlocks);
          setSelectedBlockId(parsedBlocks[0].id);
        }
      } catch (err) {
        console.error('Failed to parse template content JSON:', err);
      }
    }
  };

  const handleUpdateSelectedContent = (val: string) => {
    setBlocks(prev => prev.map(b => b.id === selectedBlockId ? { ...b, content: val } : b));
  };

  const handleUpdateSelectedStyle = (key: keyof ContentBlock['styles'], val: string) => {
    setBlocks(prev => prev.map(b => b.id === selectedBlockId ? { ...b, styles: { ...b.styles, [key]: val } } : b));
  };

  const handleInsertLink = () => {
    if (!linkText || !linkUrl) return;
    const linkHtml = `<a href="${linkUrl}" target="_blank" style="color: #059669; font-weight: 600; text-decoration: underline;">${linkText}</a>`;
    if (selectedBlock) {
      handleUpdateSelectedContent(selectedBlock.content ? `${selectedBlock.content} ${linkHtml}` : linkHtml);
    }
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
  };

  const handleApplyFormatting = (tag: 'b' | 'i' | 'u') => {
    if (!selectedBlock) return;
    const openTag = `<${tag}>`;
    const closeTag = `</${tag}>`;
    handleUpdateSelectedContent(`${selectedBlock.content} ${openTag}formatted text${closeTag}`);
  };

  const handleDeleteBlock = (blockId: string) => {
    const updated = blocks.filter(b => b.id !== blockId);
    setBlocks(updated);
    if (selectedBlockId === blockId && updated.length > 0) {
      setSelectedBlockId(updated[0].id);
    }
  };

  const handleAddBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `b_${Date.now()}`,
      type,
      content: type === 'text' ? 'New text section with formatting and links...' : type === 'button' ? 'Click Here' : type === 'image' ? 'https://images.unsplash.com/photo-1511497584788-876761c11969?auto=format&fit=crop&w=800&q=80' : '',
      styles: { color: '#002d1c', textAlign: type === 'text' ? 'left' : 'center', padding: '12px', ...(type === 'image' ? { altText: 'Decorative image' } : {}), ...(type === 'button' ? { backgroundColor: '#002d1c', color: '#ffffff', borderRadius: '6px', linkUrl: 'https://example.com' } : {}) }
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (loadedTemplateId) {
        await updateTemplate(loadedTemplateId, {
          name: templateName || subjectLine || 'Saved Template',
          subject_line: subjectLine,
          content_json: JSON.stringify(blocks),
          category: 'Newsletter'
        });
        setToastMsg(`Template "${templateName}" updated in backend!`);
      } else {
        const created: any = await createTemplate({
          name: templateName || subjectLine || 'Custom Designed Template',
          subject_line: subjectLine,
          content_json: JSON.stringify(blocks),
          category: 'Newsletter'
        });
        setLoadedTemplateId(created.id);
        setToastMsg(`New template saved to backend database!`);
      }
      await loadSavedTemplates();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const analyzeSpamRisk = (): SpamCheckResult => {
    const findings: SpamCheckResult['findings'] = [];
    let penalty = 0;

    // 1. Spam Trigger Keywords
    const spamWords = ['free', 'guaranteed', '100%', 'click here', 'buy now', 'earn $', 'cash', 'no risk', 'urgent', 'winner', 'miracle', 'act now', 'limited time', 'money back'];
    const textContent = (subjectLine + ' ' + blocks.map(b => b.content).join(' ')).toLowerCase();
    const matchedWords = spamWords.filter(w => textContent.includes(w));
    if (matchedWords.length > 0) {
      const impact = Math.min(matchedWords.length * 15, 45);
      penalty += impact;
      findings.push({
        rule: 'Spam Trigger Keywords',
        impact,
        passed: false,
        message: `Found trigger keywords: "${matchedWords.join(', ')}". Try replacing with natural conversational wording.`
      });
    } else {
      findings.push({
        rule: 'Spam Trigger Keywords',
        impact: 0,
        passed: true,
        message: 'No aggressive promotional spam keywords detected.'
      });
    }

    // 2. Capitalization Ratio
    const fullRawText = subjectLine + ' ' + blocks.map(b => b.content).join(' ');
    const uppercaseChars = fullRawText.replace(/[^A-Z]/g, '').length;
    const letterChars = fullRawText.replace(/[^a-zA-Z]/g, '').length;
    const capsRatio = letterChars > 0 ? uppercaseChars / letterChars : 0;
    if (capsRatio > 0.35 && letterChars > 20) {
      penalty += 20;
      findings.push({
        rule: 'Excessive Capitalization',
        impact: 20,
        passed: false,
        message: `High ratio of ALL CAPS (${Math.round(capsRatio * 100)}%). High caps ratio can trigger ISP spam filters.`
      });
    } else {
      findings.push({
        rule: 'Capitalization Ratio',
        impact: 0,
        passed: true,
        message: 'Capitalization ratio is balanced and standard.'
      });
    }

    // 3. Unsubscribe Clause Notice
    const hasUnsubscribe = textContent.includes('unsubscribe');
    if (!hasUnsubscribe) {
      penalty += 15;
      findings.push({
        rule: 'Unsubscribe Notice',
        impact: 15,
        passed: false,
        message: 'No explicit unsubscribe mention in body copy (footer contains automated unsubscribe link).'
      });
    } else {
      findings.push({
        rule: 'Unsubscribe Notice',
        impact: 0,
        passed: true,
        message: 'Unsubscribe clause detected in body text.'
      });
    }

    // 4. Industry Standard Text-to-Image Ratio (60:40 Rule)
    const imageBlocks = blocks.filter(b => b.type === 'image');
    const textBlocks = blocks.filter(b => b.type === 'text');
    const textLength = textBlocks.reduce((acc, b) => acc + b.content.length, 0);

    if (imageBlocks.length > 0 && textLength < 100) {
      penalty += 25;
      findings.push({
        rule: 'Text-to-Image Ratio (60:40 Rule)',
        impact: 25,
        passed: false,
        message: `Low text volume relative to image elements (${textLength} chars). Email clients penalize image-heavy messages with minimal copy.`
      });
    } else {
      findings.push({
        rule: 'Text-to-Image Ratio (60:40 Rule)',
        impact: 0,
        passed: true,
        message: 'Optimal text-to-image copy ratio (favors readable HTML text).'
      });
    }

    // 5. Image Alt Text Completeness
    const missingAltImages = imageBlocks.filter(b => !b.styles.altText || b.styles.altText.trim() === '');
    if (missingAltImages.length > 0) {
      penalty += 15;
      findings.push({
        rule: 'Image Alt Text Accessibility',
        impact: 15,
        passed: false,
        message: `${missingAltImages.length} image(s) missing Alt Text. Mail clients with blocked images need alt text for accessibility and filter approval.`
      });
    } else if (imageBlocks.length > 0) {
      findings.push({
        rule: 'Image Alt Text Accessibility',
        impact: 0,
        passed: true,
        message: 'All image blocks include descriptive Alt Text.'
      });
    }

    // 6. Subject Line Punctuation
    if (subjectLine.includes('!!!') || subjectLine.includes('$$$')) {
      penalty += 15;
      findings.push({
        rule: 'Subject Line Punctuation',
        impact: 15,
        passed: false,
        message: 'Subject line contains repeated punctuation (!!! / $$$).'
      });
    }

    const score = Math.min(Math.max(penalty, 0), 100);
    const riskLevel = score < 25 ? 'Low' : score < 50 ? 'Moderate' : 'High';

    return { score, riskLevel, findings };
  };

  const spamAnalysis = analyzeSpamRisk();

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="bg-white p-3 px-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2 shrink-0">
            Template Designer
          </h1>

          {/* Backend Saved Templates Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 px-2 rounded-lg border border-slate-200 text-xs">
            <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={loadedTemplateId || ''}
              onChange={(e) => handleSelectSavedTemplate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">-- Load Saved Backend Template --</option>
              {savedTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[240px] max-w-md flex items-center gap-1.5">
            <input
              type="text"
              value={subjectLine}
              onChange={(e) => setSubjectLine(e.target.value)}
              placeholder="Subject line..."
              className="w-full text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
            />
            <select
              onChange={(e) => {
                if (e.target.value) {
                  setSubjectLine((prev) => (prev ? prev + ' ' + e.target.value : e.target.value));
                  e.target.value = '';
                }
              }}
              className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none hover:bg-emerald-100 transition"
              title="Insert Personalization Snippet"
            >
              <option value="">+ Snippet</option>
              <option value="{{first_name}}">&#123;&#123;first_name&#125;&#125;</option>
              <option value="{{name}}">&#123;&#123;name&#125;&#125;</option>
              <option value="{{email}}">&#123;&#123;email&#125;&#125;</option>
              <option value="{{company}}">&#123;&#123;company&#125;&#125;</option>
            </select>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${viewMode === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${viewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSpamModal(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
              spamAnalysis.riskLevel === 'Low'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : spamAnalysis.riskLevel === 'Moderate'
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            {spamAnalysis.riskLevel === 'Low' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            Spam Score: {spamAnalysis.score}% ({spamAnalysis.riskLevel} Risk)
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#002d1c] hover:bg-[#02472d] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-xs transition"
          >
            {isSaving ? 'Saving...' : loadedTemplateId ? 'Update Template' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* Main Designer Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Live Canvas View (Center) */}
        <div className="lg:col-span-8 bg-slate-100/80 rounded-2xl p-6 md:p-10 border border-slate-200/60 flex justify-center items-start overflow-y-auto min-h-[580px] relative">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden text-center">
            {/* Dynamic Header Banner from System Settings */}
            <div
              style={{ backgroundColor: systemSettings?.header_bg_color || '#002d1c' }}
              className="p-6 transition-colors"
            >
              {systemSettings?.header_logo_url && (
                <img
                  src={systemSettings.header_logo_url}
                  alt="Header Logo"
                  className="max-h-12 max-w-[180px] mx-auto mb-2 inline-block object-contain"
                />
              )}
              {systemSettings?.header_title && (
                <h2
                  style={{ color: systemSettings?.header_text_color || '#ffffff' }}
                  className="text-lg font-extrabold tracking-tight"
                >
                  {systemSettings.header_title}
                </h2>
              )}
            </div>

            {/* Blocks Stream */}
            <div className="p-6 space-y-4">
              {blocks.map((block) => {
                const isSelected = block.id === selectedBlockId;
                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`group cursor-pointer rounded-lg p-3 transition border relative ${
                      isSelected ? 'border-2 border-emerald-600 bg-emerald-50/20' : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    {/* Block Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlock(block.id);
                      }}
                      title="Delete block"
                      className="absolute top-2 right-2 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md opacity-0 group-hover:opacity-100 transition shadow-xs z-10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {block.type === 'text' && (
                      <div
                        style={{
                          color: block.styles.color || '#1e293b',
                          fontSize: block.styles.fontSize || '15px',
                          fontWeight: block.styles.fontWeight || 'normal',
                          textAlign: (block.styles.textAlign as any) || 'left',
                          padding: block.styles.padding || '12px',
                        }}
                        className="leading-relaxed text-slate-800"
                        dangerouslySetInnerHTML={{
                          __html: viewMode === 'preview' ? replacePreviewTags(block.content) : block.content
                        }}
                      />
                    )}

                    {block.type === 'image' && (
                      <div style={{ padding: block.styles.padding }}>
                        <img
                          src={block.content}
                          alt={block.styles.altText || 'Email graphic'}
                          style={{ borderRadius: block.styles.borderRadius || '8px' }}
                          className="w-full h-48 object-cover shadow-xs"
                        />
                        {block.styles.altText && (
                          <span className="text-[10px] text-slate-400 mt-1 block italic">
                            Alt: "{block.styles.altText}"
                          </span>
                        )}
                      </div>
                    )}

                    {block.type === 'button' && (
                      <div className="flex justify-center my-2" style={{ textAlign: block.styles.textAlign || 'center', padding: block.styles.padding }}>
                        <a
                          href={block.styles.linkUrl || '#'}
                          onClick={(e) => e.preventDefault()}
                          style={{
                            backgroundColor: block.styles.backgroundColor || '#002d1c',
                            color: block.styles.color || '#ffffff',
                            borderRadius: block.styles.borderRadius || '6px',
                          }}
                          className="px-6 py-2.5 font-bold text-xs shadow-xs inline-block"
                        >
                          {viewMode === 'preview' ? replacePreviewTags(block.content) : block.content}
                        </a>
                      </div>
                    )}

                    {block.type === 'spacer' && (
                      <div style={{ height: block.styles.padding || '24px' }} className="w-full flex items-center justify-center text-[10px] text-slate-300 border border-dashed border-slate-200 rounded">
                        Spacer ({block.styles.padding || '24px'})
                      </div>
                    )}

                    {block.type === 'divider' && (
                      <div className="py-2">
                        <hr className="border-t border-slate-200" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dynamic CTA Section */}
            {systemSettings?.website_url && (
              <div className="p-6 text-center border-t border-slate-100">
                {systemSettings.cta_as_button ? (
                  <a
                    href={systemSettings.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#002d1c] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    {systemSettings.cta_link_text || 'Visit Our Website'} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <a
                    href={systemSettings.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-emerald-600 underline inline-flex items-center gap-1"
                  >
                    {systemSettings.cta_link_text || 'Visit Our Website'} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* Template Footer with Physical Business Address */}
            <div className="p-6 pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1.5">
              <p>You received this email because you're subscribed to Evergreen Mail updates.</p>
              <p className="font-semibold text-slate-500">
                <strong>{systemSettings?.business_name || 'Evergreen Mail Inc.'}</strong> &bull;{' '}
                {[
                  systemSettings?.business_address,
                  systemSettings?.business_city,
                  `${systemSettings?.business_state || ''} ${systemSettings?.business_zip || ''}`.trim(),
                  systemSettings?.business_country
                ].filter(Boolean).join(', ')}
              </p>
              <p className="text-emerald-700 underline font-semibold cursor-pointer">Unsubscribe from these emails</p>
            </div>
          </div>
        </div>

        {/* Right Tooling Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('blocks')}
                className={`flex-1 py-1.5 rounded-lg transition ${activeTab === 'blocks' ? 'bg-emerald-100 text-[#002d1c] shadow-xs' : 'text-slate-500'}`}
              >
                Blocks
              </button>
              <button
                onClick={() => setActiveTab('styles')}
                className={`flex-1 py-1.5 rounded-lg transition ${activeTab === 'styles' ? 'bg-emerald-100 text-[#002d1c] shadow-xs' : 'text-slate-500'}`}
              >
                Styles
              </button>
            </div>

            {/* Content Blocks Picker */}
            {activeTab === 'blocks' && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-3">Content Blocks</span>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { type: 'text', label: 'Text', icon: Type },
                    { type: 'image', label: 'Image', icon: ImageIcon },
                    { type: 'button', label: 'Button', icon: MousePointer },
                    { type: 'spacer', label: 'Spacer', icon: Space },
                    { type: 'divider', label: 'Divider', icon: Minus },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.type}
                        onClick={() => handleAddBlock(item.type as ContentBlock['type'])}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition group"
                      >
                        <Icon className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 mb-1" />
                        <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Element Properties */}
            {selectedBlock && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Active Element: {selectedBlock.type}</span>
                  <button
                    onClick={() => handleDeleteBlock(selectedBlock.id)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Block
                  </button>
                </div>

                {/* Content Input (Text, Button Label, Image URL) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {selectedBlock.type === 'text' ? 'Text Content & Links' : selectedBlock.type === 'button' ? 'Button Text' : selectedBlock.type === 'image' ? 'Image Source URL' : 'Content'}
                  </label>

                  {selectedBlock.type === 'text' && (
                    <div className="space-y-2 mb-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formatting & Hyperlinks</span>
                      </div>

                      {/* Format Toolbar Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting('b')}
                          className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                          title="Add Bold <b>"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting('i')}
                          className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                          title="Add Italic <i>"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyFormatting('u')}
                          className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                          title="Add Underline <u>"
                        >
                          <Underline className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="h-4 w-px bg-slate-300 mx-0.5" />

                        {/* Insert Link Button */}
                        <button
                          type="button"
                          onClick={() => setShowLinkModal(true)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white font-bold text-[11px] rounded-md hover:bg-emerald-700 transition shadow-xs"
                          title="Insert Hyperlink"
                        >
                          <Link className="w-3.5 h-3.5" /> Add Link
                        </button>
                      </div>

                      {/* Personalization Tag Insert Pills */}
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Insert Dynamic Tag:</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {[
                            { tag: '{{first_name}}', label: 'First Name' },
                            { tag: '{{name}}', label: 'Full Name' },
                            { tag: '{{email}}', label: 'Email' },
                            { tag: '{{company}}', label: 'Company' },
                          ].map(({ tag, label }) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                if (selectedBlock) {
                                  handleUpdateSelectedContent(selectedBlock.content ? `${selectedBlock.content} ${tag}` : tag);
                                }
                              }}
                              className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-mono font-semibold rounded border border-emerald-200 transition"
                              title={`Insert ${label}`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Size Selector */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-[11px] font-semibold text-slate-600">Font Size:</span>
                        <select
                          value={selectedBlock.styles.fontSize || '15px'}
                          onChange={(e) => handleUpdateSelectedStyle('fontSize', e.target.value)}
                          className="p-1 text-xs bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-emerald-600"
                        >
                          <option value="28px">Header 1 (28px)</option>
                          <option value="22px">Header 2 (22px)</option>
                          <option value="18px">Subtitle (18px)</option>
                          <option value="15px">Body (15px)</option>
                          <option value="13px">Small (13px)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedBlock.type === 'text' ? (
                    <textarea
                      value={selectedBlock.content}
                      onChange={(e) => handleUpdateSelectedContent(e.target.value)}
                      rows={4}
                      placeholder="Type email body text or HTML... Use toolbar above to add bold, italics, or links."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  ) : (
                    <input
                      type="text"
                      value={selectedBlock.content}
                      onChange={(e) => handleUpdateSelectedContent(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  )}
                </div>

                {/* Specific Image Alt Text Property */}
                {selectedBlock.type === 'image' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Image Alt Text (Spam/Accessibility Best Practice)</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.altText || ''}
                      onChange={(e) => handleUpdateSelectedStyle('altText', e.target.value)}
                      placeholder="e.g. Promotional summer discount banner"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}

                {/* Specific Button Link URL Property */}
                {selectedBlock.type === 'button' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Link URL</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.linkUrl || ''}
                      onChange={(e) => handleUpdateSelectedStyle('linkUrl', e.target.value)}
                      placeholder="https://example.com/landing-page"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}

                {/* Colors */}
                {(selectedBlock.type === 'text' || selectedBlock.type === 'button') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedBlock.styles.color || '#002d1c'}
                          onChange={(e) => handleUpdateSelectedStyle('color', e.target.value)}
                          className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={selectedBlock.styles.color || '#002d1c'}
                          onChange={(e) => handleUpdateSelectedStyle('color', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    {selectedBlock.type === 'button' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Background</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={selectedBlock.styles.backgroundColor || '#002d1c'}
                            onChange={(e) => handleUpdateSelectedStyle('backgroundColor', e.target.value)}
                            className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={selectedBlock.styles.backgroundColor || '#002d1c'}
                            onChange={(e) => handleUpdateSelectedStyle('backgroundColor', e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Border Radius & Alignment */}
                {selectedBlock.type === 'button' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Corner Radius</label>
                    <div className="flex items-center gap-2">
                      {['2px', '6px', '12px', '9999px'].map((radius) => (
                        <button
                          key={radius}
                          onClick={() => handleUpdateSelectedStyle('borderRadius', radius)}
                          className={`flex-1 py-1 text-[11px] font-bold border rounded-md transition ${
                            selectedBlock.styles.borderRadius === radius ? 'bg-emerald-100 border-emerald-600 text-[#002d1c]' : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          {radius === '9999px' ? 'Pill' : radius}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alignment</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { align: 'left', icon: AlignLeft, label: 'Left' },
                      { align: 'center', icon: AlignCenter, label: 'Center' },
                      { align: 'right', icon: AlignRight, label: 'Right' },
                      { align: 'justify', icon: AlignJustify, label: 'Justify' },
                    ].map(({ align, icon: Icon, label }) => {
                      const isSelected = (selectedBlock.styles.textAlign || (selectedBlock.type === 'text' ? 'left' : 'center')) === align;
                      return (
                        <button
                          key={align}
                          onClick={() => handleUpdateSelectedStyle('textAlign', align as any)}
                          className={`py-1.5 px-2 border rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                            isSelected ? 'bg-emerald-100 border-emerald-500 text-[#002d1c]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                          title={`Align ${label}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px]">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Padding</label>
                  <input
                    type="text"
                    value={selectedBlock.styles.padding || '12px'}
                    onChange={(e) => handleUpdateSelectedStyle('padding', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spam Risk Checker & Technical Authentication Modal */}
      {showSpamModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Email Deliverability & Spam Analyzer</h3>
              </div>
              <button
                onClick={() => setShowSpamModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                &times;
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSpamModalTab('audit')}
                className={`flex-1 py-1.5 rounded-lg transition ${spamModalTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                Content Deliverability Audit
              </button>
              <button
                onClick={() => setSpamModalTab('auth')}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${spamModalTab === 'auth' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> SPF / DKIM / DMARC
              </button>
            </div>

            {spamModalTab === 'audit' ? (
              <>
                {/* Score Visual Meter */}
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="text-3xl font-extrabold text-slate-900">
                    {spamAnalysis.score}% Risk
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(spamAnalysis.score, 5)}%` }}
                      className={`h-full transition-all duration-500 ${
                        spamAnalysis.riskLevel === 'Low'
                          ? 'bg-emerald-500'
                          : spamAnalysis.riskLevel === 'Moderate'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">
                    Deliverability Grade:{' '}
                    <span
                      className={
                        spamAnalysis.riskLevel === 'Low'
                          ? 'text-emerald-600 font-bold'
                          : spamAnalysis.riskLevel === 'Moderate'
                          ? 'text-amber-600 font-bold'
                          : 'text-rose-600 font-bold'
                      }
                    >
                      {spamAnalysis.riskLevel} Risk
                    </span>
                  </p>
                </div>

                {/* Rules Breakdown */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deliverability Checklist</h4>
                  {spamAnalysis.findings.map((f, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                        f.passed ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-rose-50/50 border-rose-200/60'
                      }`}
                    >
                      {f.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold text-slate-800">{f.rule}</p>
                        <p className="text-slate-600 text-[11px] mt-0.5">{f.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Technical Authentication Guidance */
              <div className="space-y-3 text-xs text-slate-700 max-h-72 overflow-y-auto pr-1">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 space-y-1">
                  <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> DNS Domain Authentication Guidelines
                  </p>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    Major providers (Gmail, Yahoo, Outlook) enforce SPF, DKIM, and DMARC verification to prevent spoofing and ensure messages reach the primary inbox.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-900">1. SPF (Sender Policy Framework)</p>
                  <p className="text-[11px] text-slate-600">Add a TXT DNS record on your domain authorizing senders:</p>
                  <code className="block p-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded">
                    v=spf1 include:evergreenmail.io ~all
                  </code>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-900">2. DKIM (DomainKeys Identified Mail)</p>
                  <p className="text-[11px] text-slate-600">Cryptographically signs email headers to prevent tampering in transit.</p>
                  <code className="block p-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded">
                    k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...
                  </code>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <p className="font-bold text-slate-900">3. DMARC Policy</p>
                  <p className="text-[11px] text-slate-600">Defines handling policies for unauthenticated senders:</p>
                  <code className="block p-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded">
                    v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com
                  </code>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSpamModal(false)}
                className="px-5 py-2 bg-[#002d1c] text-white font-bold text-xs rounded-xl hover:bg-[#02472d] transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Hyperlink Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <Link className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Insert Hyperlink into Text</h3>
                  <p className="text-[11px] text-slate-500">Add a clickable link directly inside your body text</p>
                </div>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1">&times;</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Display Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Click here to read full update"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Link Destination URL</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://yourwebsite.com or mailto:info@company.com"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              {systemSettings?.website_url && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Quick Link Preset</span>
                  <button
                    type="button"
                    onClick={() => { setLinkUrl(systemSettings.website_url); if (!linkText) setLinkText('Visit our website'); }}
                    className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md hover:bg-emerald-100 transition flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" /> Website URL ({systemSettings.website_url})
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertLink}
                disabled={!linkText.trim() || !linkUrl.trim()}
                className="px-4 py-2 bg-[#002d1c] hover:bg-[#004028] text-white font-bold text-xs rounded-lg transition shadow-xs disabled:opacity-50"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Toast Overlay */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#002d1c] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-800 z-50 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-xs font-bold">{toastMsg}</p>
            <p className="text-[10px] text-emerald-200">Last saved just now</p>
          </div>
        </div>
      )}
    </div>
  );
};
