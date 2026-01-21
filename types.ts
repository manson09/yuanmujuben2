
export enum FileCategory {
  ORIGINAL = '原著小说',
  LAYOUT = '排版参考',
  STYLE = '文笔参考'
}

export interface FileData {
  id: string;
  name: string;
  category: FileCategory;
  content: string;
  type: string;
}

export interface ScriptSegment {
  id: string;
  batchIndex: number; // 1 means episodes 1-3, 2 means 4-6, etc.
  episodes: string;
  status: 'pending' | 'completed' | 'error';
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  files: FileData[];
  outline: string;
  scripts: ScriptSegment[];
  currentBatch: number;
  mode: 'male' | 'female';
  selectedOriginalId?: string;
  selectedLayoutId?: string;
  selectedStyleId?: string;
}

export interface AppState {
  projects: Project[];
  currentProjectId: string | null;
  currentView: 'management' | 'knowledge_base' | 'workspace';
}
