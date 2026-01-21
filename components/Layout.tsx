
import React from 'react';
import { ArrowLeft, Plus, BookOpen, LayoutDashboard, Settings } from 'lucide-react';

interface LayoutProps {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, onBack, children, actions }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="返回"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <h1 className="text-xl font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
              {title}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
