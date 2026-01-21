
import React, { useState, useEffect } from 'react';
import { Project, AppState } from './types';
import Layout from './components/Layout';
import ProjectManager from './components/ProjectManager';
import KnowledgeBase from './components/KnowledgeBase';
import Workspace from './components/Workspace';

const STORAGE_KEY = 'anime_script_workshop_data';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return {
      projects: [],
      currentProjectId: null,
      currentView: 'management'
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentProject = state.projects.find(p => p.id === state.currentProjectId);

  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      createdAt: Date.now(),
      files: [],
      outline: '',
      scripts: [],
      currentBatch: 0,
      mode: 'male'
    };
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
      currentProjectId: newProject.id,
      currentView: 'knowledge_base'
    }));
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('确定要删除这个作品吗？此操作不可撤销。')) {
      setState(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== id),
        currentProjectId: prev.currentProjectId === id ? null : prev.currentProjectId,
        currentView: prev.currentProjectId === id ? 'management' : prev.currentView
      }));
    }
  };

  const handleSelectProject = (id: string) => {
    setState(prev => ({
      ...prev,
      currentProjectId: id,
      currentView: 'knowledge_base'
    }));
  };

  const handleUpdateProject = (updates: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === prev.currentProjectId ? { ...p, ...updates } : p
      )
    }));
  };

  const handleBack = () => {
    if (state.currentView === 'knowledge_base') {
      setState(prev => ({ ...prev, currentView: 'management', currentProjectId: null }));
    } else if (state.currentView === 'workspace') {
      setState(prev => ({ ...prev, currentView: 'knowledge_base' }));
    }
  };

  const renderContent = () => {
    switch (state.currentView) {
      case 'management':
        return (
          <ProjectManager 
            projects={state.projects}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onSelectProject={handleSelectProject}
          />
        );
      case 'knowledge_base':
        return currentProject ? (
          <KnowledgeBase 
            project={currentProject}
            onUpdateProject={handleUpdateProject}
            onNext={() => setState(prev => ({ ...prev, currentView: 'workspace' }))}
          />
        ) : null;
      case 'workspace':
        return currentProject ? (
          <Workspace 
            project={currentProject}
            onUpdateProject={handleUpdateProject}
            onBack={handleBack}
          />
        ) : null;
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (state.currentView === 'management') return "漫剧智能创作工坊";
    return currentProject?.name || "创作中...";
  };

  return (
    <Layout 
      title={getTitle()} 
      onBack={state.currentView !== 'management' ? handleBack : undefined}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
