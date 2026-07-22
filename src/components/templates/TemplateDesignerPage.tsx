import React, { useState } from 'react';
import { Leaf, Type, Image as ImageIcon, MousePointer, Space, Minus, Columns, CheckCircle2, Search, Send, Eye, Edit3, Globe, Share2 } from 'lucide-react';
import { ContentBlock } from '../../types';
import { createTemplate } from '../../api/client';

export const TemplateDesignerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'styles'>('blocks');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      styles: { color: '#475569', fontSize: '15px', textAlign: 'center', padding: '8px' }
    },
    {
      id: 'b3',
      type: 'image',
      content: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      styles: { borderRadius: '8px', padding: '16px' }
    },
    {
      id: 'b4',
      type: 'button',
      content: 'Get Started Now',
      styles: { backgroundColor: '#002d1c', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textAlign: 'center' }
    }
  ]);

  const [selectedBlockId, setSelectedBlockId] = useState<string>('b1');

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const handleUpdateSelectedContent = (val: string) => {
    setBlocks(prev => prev.map(b => b.id === selectedBlockId ? { ...b, content: val } : b));
  };

  const handleUpdateSelectedColor = (colorVal: string) => {
    setBlocks(prev => prev.map(b => b.id === selectedBlockId ? { ...b, styles: { ...b.styles, color: colorVal } } : b));
  };

  const handleUpdateSelectedAlign = (alignVal: 'left' | 'center' | 'right') => {
    setBlocks(prev => prev.map(b => b.id === selectedBlockId ? { ...b, styles: { ...b.styles, textAlign: alignVal } } : b));
  };

  const handleAddBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `b_${Date.now()}`,
      type,
      content: type === 'text' ? 'New text section...' : type === 'button' ? 'Click Here' : type === 'image' ? 'https://images.unsplash.com/photo-1511497584788-876761c11969?auto=format&fit=crop&w=800&q=80' : '',
      styles: { color: '#002d1c', textAlign: 'center', padding: '12px' }
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await createTemplate({
        name: 'Custom Designed Template',
        subject_line: blocks.find(b => b.type === 'text')?.content || 'Evergreen Newsletter',
        content_json: JSON.stringify(blocks),
        category: 'Newsletter'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="bg-white p-3 px-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Template Designer
          </h1>
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
          <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-emerald-600" /> Send Test
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search components..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100/80 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-[#002d1c] hover:bg-[#02472d] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-xs transition"
          >
            Save Template
          </button>
        </div>
      </div>

      {/* Main Designer Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Live Canvas View (Center) */}
        <div className="lg:col-span-8 bg-slate-100/80 rounded-2xl p-6 md:p-10 border border-slate-200/60 flex justify-center items-start overflow-y-auto min-h-[580px] relative">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden text-center">
            {/* Template Header Logo */}
            <div className="p-8 pb-4 flex justify-center border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#002d1c] text-emerald-400 rounded-lg flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="text-lg font-extrabold text-[#002d1c] tracking-tight uppercase">Evergreen</span>
              </div>
            </div>

            {/* Blocks Stream */}
            <div className="p-6 space-y-4">
              {blocks.map((block) => {
                const isSelected = block.id === selectedBlockId;
                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`cursor-pointer rounded-lg p-3 transition border relative ${
                      isSelected ? 'border-2 border-emerald-600 bg-emerald-50/20' : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    {block.type === 'text' && (
                      <div
                        style={{
                          color: block.styles.color,
                          fontSize: block.styles.fontSize,
                          fontWeight: block.styles.fontWeight,
                          textAlign: block.styles.textAlign,
                        }}
                        className="leading-snug"
                      >
                        {block.content}
                      </div>
                    )}

                    {block.type === 'image' && (
                      <img
                        src={block.content}
                        alt="Block graphic"
                        className="w-full h-48 object-cover rounded-lg shadow-xs"
                      />
                    )}

                    {block.type === 'button' && (
                      <div className="flex justify-center my-2">
                        <button
                          style={{
                            backgroundColor: block.styles.backgroundColor,
                            color: block.styles.color,
                          }}
                          className="px-6 py-2.5 rounded-lg font-bold text-xs shadow-xs"
                        >
                          {block.content}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Template Footer */}
            <div className="p-6 pt-2 border-t border-slate-100 text-[11px] text-slate-400 space-y-2">
              <div className="flex justify-center gap-4 text-slate-500">
                <Globe className="w-4 h-4" />
                <Share2 className="w-4 h-4" />
              </div>
              <p>© 2024 Evergreen Mail. 123 Growth Lane, Green City.</p>
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
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-3">Content Blocks</span>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { type: 'text', label: 'Text', icon: Type },
                  { type: 'image', label: 'Image', icon: ImageIcon },
                  { type: 'button', label: 'Button', icon: MousePointer },
                  { type: 'spacer', label: 'Spacer', icon: Space },
                  { type: 'divider', label: 'Divider', icon: Minus },
                  { type: 'columns', label: 'Columns', icon: Columns },
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

            {/* Active Element Properties */}
            {selectedBlock && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Active Element</span>

                {selectedBlock.type === 'text' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Text Content</label>
                    <textarea
                      value={selectedBlock.content}
                      onChange={(e) => handleUpdateSelectedContent(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedBlock.styles.color || '#002d1c'}
                      onChange={(e) => handleUpdateSelectedColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={selectedBlock.styles.color || '#002d1c'}
                      onChange={(e) => handleUpdateSelectedColor(e.target.value)}
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alignment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => handleUpdateSelectedAlign(align)}
                        className={`py-1.5 border rounded-lg text-xs font-semibold capitalize transition ${
                          selectedBlock.styles.textAlign === align ? 'bg-emerald-100 border-emerald-500 text-[#002d1c]' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Padding</label>
                  <input
                    type="text"
                    defaultValue="32 px"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Toast Overlay */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#002d1c] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-800 z-50 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-xs font-bold">Template saved successfully</p>
            <p className="text-[10px] text-emerald-200">Last saved just now</p>
          </div>
        </div>
      )}
    </div>
  );
};
