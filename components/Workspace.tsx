
import React, { useState } from 'react';
import { Layout, FileText, Settings2, Download, RefreshCw, Play, ChevronRight, Book, Plus } from 'lucide-react';
import { Project, FileCategory, ScriptSegment } from '../types';
import { generateStoryOutline, generateScriptSegment } from '../services/geminiService';
import { downloadDocx } from '../utils/fileUtils';

interface WorkspaceProps {
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => void;
  onBack: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ project, onUpdateProject, onBack }) => {
  const [activeTab, setActiveTab] = useState<'outline' | 'script'>('outline');
  const [loading, setLoading] = useState(false);

  const originalFiles = project.files.filter(f => f.category === FileCategory.ORIGINAL);
  const layoutFiles = project.files.filter(f => f.category === FileCategory.LAYOUT);
  const styleFiles = project.files.filter(f => f.category === FileCategory.STYLE);

  const handleGenerateOutline = async () => {
    if (!project.selectedOriginalId) return alert('请先选择原著指向');
    setLoading(true);
    try {
      const original = project.files.find(f => f.id === project.selectedOriginalId)?.content || '';
      const layout = project.files.find(f => f.id === project.selectedLayoutId)?.content || '';
      const style = project.files.find(f => f.id === project.selectedStyleId)?.content || '';
      
      const res = await generateStoryOutline(original, layout, style);
      if (res) onUpdateProject({ outline: res });
    } catch (e) {
      console.error(e);
      alert('生成大纲失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async (batchIndex: number) => {
    if (!project.outline) return alert('请先生成剧情大纲');
    if (!project.selectedOriginalId) return alert('请先选择原著指向');
    
    setLoading(true);
    try {
      const original = project.files.find(f => f.id === project.selectedOriginalId)?.content || '';
      const layout = project.files.find(f => f.id === project.selectedLayoutId)?.content || '';
      const style = project.files.find(f => f.id === project.selectedStyleId)?.content || '';
      
      // Get all previous completed scripts
      const previousScripts = project.scripts
        .filter(s => s.batchIndex < batchIndex && s.status === 'completed')
        .map(s => s.episodes)
        .join('\n\n');

      const res = await generateScriptSegment(
        batchIndex, 
        project.mode, 
        original, 
        project.outline, 
        previousScripts, 
        layout, 
        style
      );

      if (res) {
        const newSegment: ScriptSegment = {
          id: Math.random().toString(36).substr(2, 9),
          batchIndex,
          episodes: res,
          status: 'completed'
        };

        const existingIdx = project.scripts.findIndex(s => s.batchIndex === batchIndex);
        let newScripts = [...project.scripts];
        if (existingIdx >= 0) {
          newScripts[existingIdx] = newSegment;
        } else {
          newScripts.push(newSegment);
        }

        onUpdateProject({ 
          scripts: newScripts,
          currentBatch: Math.max(project.currentBatch, batchIndex)
        });
      }
    } catch (e) {
      console.error(e);
      alert('生成脚本失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
          <button 
            onClick={() => setActiveTab('outline')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
              activeTab === 'outline' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Layout className="w-5 h-5" />
            <span>剧本大纲</span>
          </button>
          <button 
            onClick={() => setActiveTab('script')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
              activeTab === 'script' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>剧情脚本</span>
          </button>
        </div>

        {activeTab === 'script' && (
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => onUpdateProject({ mode: 'male' })}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                project.mode === 'male' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              男频模式
            </button>
            <button 
              onClick={() => onUpdateProject({ mode: 'female' })}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                project.mode === 'female' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              女频模式
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        {/* Sidebar Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center">
              <Settings2 className="w-5 h-5 mr-2 text-blue-600" />
              参考指向设定
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">原著小说指向</label>
                <select 
                  value={project.selectedOriginalId || ''} 
                  onChange={(e) => onUpdateProject({ selectedOriginalId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">请选择...</option>
                  {originalFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">排版参考指向</label>
                <select 
                  value={project.selectedLayoutId || ''} 
                  onChange={(e) => onUpdateProject({ selectedLayoutId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">未选择 (使用默认)</option>
                  {layoutFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">文笔参考指向</label>
                <select 
                  value={project.selectedStyleId || ''} 
                  onChange={(e) => onUpdateProject({ selectedStyleId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">未选择 (使用默认)</option>
                  {styleFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  温馨提示：大纲生成可能耗时 1-2 分钟，请耐心等待。严禁魔改原著。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'outline' ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">剧本深度大纲 (2000-3000字)</h2>
                <div className="flex items-center space-x-3">
                  {project.outline && (
                    <>
                      <button 
                        onClick={() => downloadDocx(project.outline, `${project.name}_大纲.docx`)}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>导出 Word</span>
                      </button>
                      <button 
                        onClick={handleGenerateOutline}
                        disabled={loading}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="重新生成"
                      >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-8 flex-1 overflow-y-auto">
                {project.outline ? (
                  <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-700 font-medium">
                    {project.outline}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                      <Layout className="w-12 h-12 text-blue-300" />
                    </div>
                    <div className="max-w-xs">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">准备好生成大纲了吗？</h3>
                      <p className="text-slate-500 text-sm">选择原著小说指向后，点击下方按钮开始分析原著并生成深度剧本大纲。</p>
                    </div>
                    <button 
                      onClick={handleGenerateOutline}
                      disabled={loading || !project.selectedOriginalId}
                      className="flex items-center space-x-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
                      <span>{loading ? 'AI 正在深度分析中...' : '开始生成大纲'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {!project.outline ? (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-12 text-center">
                  <Book className="w-16 h-16 text-amber-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-amber-900 mb-2">需要先生成大纲</h3>
                  <p className="text-amber-700 mb-8 max-w-md mx-auto">脚本创作基于大纲进行，请先前往“剧本大纲”功能完成深度大纲的分析与生成。</p>
                  <button 
                    onClick={() => setActiveTab('outline')}
                    className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all"
                  >
                    前往生成大纲
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4">
                    <h2 className="text-xl font-bold text-slate-900">分集脚本创作 (3集/段)</h2>
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span>已开启上下文关联模式</span>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {project.scripts.sort((a, b) => a.batchIndex - b.batchIndex).map((seg) => (
                      <div key={seg.id} className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden animate-in slide-in-from-bottom-4">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                              第 {(seg.batchIndex - 1) * 3 + 1} - {seg.batchIndex * 3} 集
                            </span>
                            <span className="text-slate-400 text-sm font-medium">段落 #{seg.batchIndex}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button 
                              onClick={() => downloadDocx(seg.episodes, `${project.name}_脚本_${(seg.batchIndex - 1) * 3 + 1}-${seg.batchIndex * 3}集.docx`)}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              title="导出 Word"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleGenerateScript(seg.batchIndex)}
                              disabled={loading}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              title="重新生成此段"
                            >
                              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        </div>
                        <div className="p-8">
                          <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-slate-700 font-medium">
                            {seg.episodes}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-center py-10">
                      <button 
                        onClick={() => handleGenerateScript(project.currentBatch + 1)}
                        disabled={loading}
                        className="group flex items-center space-x-4 px-10 py-5 bg-white border-2 border-blue-600 text-blue-600 rounded-3xl font-black text-xl hover:bg-blue-600 hover:text-white transition-all shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                        <span>
                          {loading ? 'AI 正在极速扩展脚本...' : `继续生成第 ${project.currentBatch * 3 + 1} - ${project.currentBatch * 3 + 3} 集`}
                        </span>
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
