
import React, { useRef } from 'react';
import { Upload, File as FileIcon, Trash2, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { Project, FileCategory, FileData } from '../types';
import { readAsText } from '../utils/fileUtils';

interface KnowledgeBaseProps {
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => void;
  onNext: () => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ project, onUpdateProject, onNext }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, category: FileCategory) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileData[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await readAsText(file);
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          category,
          content: text,
          type: file.type
        });
      } catch (err) {
        console.error("File upload error:", err);
      }
    }

    onUpdateProject({
      files: [...project.files, ...newFiles]
    });
  };

  const removeFile = (id: string) => {
    onUpdateProject({
      files: project.files.filter(f => f.id !== id)
    });
  };

  const categories = Object.values(FileCategory);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">知识库系统</h2>
          <p className="mt-2 text-slate-500">上传并管理用于 AI 作业的参考资料</p>
        </div>
        <button 
          onClick={onNext}
          disabled={!project.files.some(f => f.category === FileCategory.ORIGINAL)}
          className="flex items-center space-x-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <span>进入核心工作区</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {categories.map(cat => (
          <div key={cat} className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  cat === FileCategory.ORIGINAL ? 'bg-indigo-500' :
                  cat === FileCategory.LAYOUT ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
                {cat}
              </h3>
              <span className="text-xs font-medium px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-500">
                {project.files.filter(f => f.category === cat).length} 文件
              </span>
            </div>
            
            <div className="p-6 flex-1 flex flex-col space-y-4">
              <div 
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.dataset.category = cat;
                    fileInputRef.current.click();
                  }
                }}
                className="group border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
              >
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                <p className="text-sm font-semibold text-slate-900">点击或拖拽上传</p>
                <p className="text-xs text-slate-500 mt-1">支持 docx, txt, doc</p>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {project.files.filter(f => f.category === cat).map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group animate-in zoom-in-95 duration-200">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <FileIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-700 truncate font-medium">{file.name}</span>
                    </div>
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition-all shadow-sm opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {project.files.filter(f => f.category === cat).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400 space-y-2">
                    <AlertCircle className="w-8 h-8 opacity-20" />
                    <p className="text-xs">暂无{cat}文件</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <input 
        type="file" 
        multiple
        ref={fileInputRef}
        className="hidden" 
        onChange={(e) => {
          const cat = e.target.dataset.category as FileCategory;
          handleFileUpload(e, cat);
        }}
        accept=".docx,.doc,.txt"
      />

      {project.files.length > 0 && !project.files.some(f => f.category === FileCategory.ORIGINAL) && (
        <div className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">必须至少上传一个“原著小说”文件才能继续。</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
