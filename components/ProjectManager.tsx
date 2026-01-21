
import React, { useState } from 'react';
import { Plus, Trash2, BookText, Calendar } from 'lucide-react';
import { Project } from '../types';

interface ProjectManagerProps {
  projects: Project[];
  onCreateProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
  onSelectProject: (id: string) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ 
  projects, 
  onCreateProject, 
  onDeleteProject, 
  onSelectProject 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreate = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName);
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">作品管理中心</h2>
          <p className="mt-2 text-slate-500 text-lg">在此管理您的漫剧创作项目</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>创建新作品</span>
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-slate-900">新作品名称</h3>
            <input 
              type="text" 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="请输入作品名称..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-6"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsCreating(false)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                取消
              </button>
              <button 
                onClick={handleCreate}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
              >
                确认创建
              </button>
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
            <BookText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">暂无作品</h3>
          <p className="text-slate-500">点击上方按钮开始您的第一个创作之旅</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div 
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <BookText className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="删除作品"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center text-slate-400 text-sm">
                <Calendar className="w-4 h-4 mr-1.5" />
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500">资料库: {project.files.length} 个文件</span>
                <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  继续创作 →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
