import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Project, Platform, Content } from '../types';
import { 
  BarChart3, 
  Share2, 
  Trello, 
  Calendar as CalendarIcon, 
  List,
  ChevronLeft,
  Settings,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectDashboard } from './ProjectDashboard';
import { PlatformsManager } from './PlatformsManager';
import { KanbanBoard } from './KanbanBoard';
import { CalendarView } from './CalendarView';
import { ContentManager } from './ContentManager';
import { ProjectModal } from './ProjectModal';
import { toast } from 'react-hot-toast';

interface ProjectViewProps {
  projectId: number;
}

type TabType = 'dashboard' | 'platforms' | 'kanban' | 'calendar' | 'list';

export function ProjectView({ projectId }: ProjectViewProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const projects = await api.getProjects();
      const p = projects.find((x: Project) => x.id === projectId);
      setProject(p || null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao carregar dados do projeto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  if (loading && !project) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) return <div className="p-8 text-center text-gray-500">Projeto não encontrado.</div>;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'platforms', label: 'Plataformas', icon: <Share2 className="w-4 h-4" /> },
    { id: 'kanban', label: 'Kanban', icon: <Trello className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendário', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'list', label: 'Conteúdos', icon: <List className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div className="p-4 lg:p-8 pb-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-500/20">
                {project.niche}
              </span>
            </div>
            <p className="text-gray-400 text-sm">{project.description}</p>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 hover:bg-[#18181b] rounded-lg transition-colors border border-[#27272a] text-gray-400 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-xl border border-[#27272a] w-fit overflow-x-auto max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-[#27272a] text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-300 hover:bg-[#27272a]/50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'dashboard' && <ProjectDashboard project={project} />}
            {activeTab === 'platforms' && <PlatformsManager project={project} />}
            {activeTab === 'kanban' && <KanbanBoard project={project} />}
            {activeTab === 'calendar' && <CalendarView project={project} />}
            {activeTab === 'list' && <ContentManager project={project} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <ProjectModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
          fetchProjectData();
        }}
        project={project}
      />
    </div>
  );
}
