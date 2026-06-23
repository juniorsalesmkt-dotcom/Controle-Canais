import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  Settings, 
  LogOut, 
  Folder, 
  ChevronRight,
  Menu,
  X,
  PlusCircle
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { api } from '../lib/api';
import { Project } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
  onNavigateHome: () => void;
  onNavigateProject: (id: number) => void;
  activeProjectId: number | null;
}

export function Layout({ children, onNavigateHome, onNavigateProject, activeProjectId }: LayoutProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro ao carregar lista de projetos.');
    }
  };

  const handleSignOut = () => signOut(auth);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#18181b] border-r border-[#27272a]">
      <div className="p-6 flex items-center justify-between">
        <h2 
          onClick={onNavigateHome}
          className="text-xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
        >
          Content Eco
        </h2>
        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-8 py-4">
        <div>
          <button 
            onClick={onNavigateHome}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeProjectId === null ? "bg-[#27272a] text-white" : "text-gray-400 hover:text-white hover:bg-[#27272a]/50"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Home
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Projetos</span>
            <button 
              onClick={() => {
                // Should open a project creation modal
                // For now, I'll just trigger home which might have a "New Project" button
                onNavigateHome();
              }}
              className="p-1 hover:bg-[#27272a] rounded transition-colors text-gray-500 hover:text-white"
            >
              <PlusCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  onNavigateProject(project.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                  activeProjectId === project.id ? "bg-[#27272a] text-white" : "text-gray-400 hover:text-white hover:bg-[#27272a]/50"
                )}
              >
                <Folder className={cn(
                  "w-4 h-4 transition-colors",
                  activeProjectId === project.id ? "text-blue-400" : "text-gray-500 group-hover:text-gray-400"
                )} />
                <span className="truncate flex-1 text-left">{project.name}</span>
                <ChevronRight className={cn(
                  "w-3 h-3 transition-transform opacity-0 group-hover:opacity-100",
                  activeProjectId === project.id ? "translate-x-0 opacity-100" : "-translate-x-2"
                )} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#27272a]">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-xs font-bold">
            {auth.currentUser?.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate text-white">{auth.currentUser?.email}</p>
            <p className="text-[10px] text-gray-500 truncate">Usuário Premium</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Top Nav */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#18181b] border-b border-[#27272a] h-16 shrink-0">
        <h2 className="text-lg font-bold">Content Eco</h2>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 overflow-hidden">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw]">
              {sidebarContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-0 bg-[#09090b]">
        <div className="max-w-[1600px] mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
