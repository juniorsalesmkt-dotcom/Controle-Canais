import React, { useState, useEffect } from 'react';
import { Project, Content, ContentStatus, PlatformType } from '../types';
import { api } from '../lib/api';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Youtube,
  Facebook,
  Instagram,
  Music2,
  AlertCircle
} from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { cn } from '../lib/utils';
import { ContentModal } from './ContentModal';
import { PlatformIcon } from './Home';

interface KanbanBoardProps {
  project: Project;
}

const COLUMNS: { status: ContentStatus; color: string }[] = [
  { status: 'Ideia', color: 'bg-gray-500' },
  { status: 'Roteiro', color: 'bg-amber-500' },
  { status: 'Em produção', color: 'bg-blue-500' },
  { status: 'Edição', color: 'bg-purple-500' },
  { status: 'Thumbnail pronta', color: 'bg-pink-500' },
  { status: 'Pronto para publicação', color: 'bg-indigo-500' },
  { status: 'Programado', color: 'bg-orange-500' },
  { status: 'Publicado', color: 'bg-emerald-500' },
];

export function KanbanBoard({ project }: KanbanBoardProps) {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | undefined>();

  const fetchContents = async () => {
    try {
      const data = await api.getContents(project.id);
      setContents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [project.id]);

  const moveContent = async (content: Content, newStatus: ContentStatus) => {
    try {
      // Optimistic update
      setContents(prev => prev.map(c => c.id === content.id ? { ...c, status: newStatus } : c));
      await api.updateContent(content.id, { ...content, status: newStatus });
    } catch (err) {
      console.error(err);
      fetchContents(); // Revert on error
    }
  };

  if (loading) return <div>Carregando Kanban...</div>;

  return (
    <div className="flex gap-4 overflow-x-auto pb-10 h-[calc(100vh-280px)] min-h-[500px]">
      {COLUMNS.map((col) => (
        <div key={col.status} className="flex-shrink-0 w-80 flex flex-col h-full bg-[#111114]/50 rounded-2xl border border-[#27272a]/50">
          <div className="p-4 flex items-center justify-between border-b border-[#27272a]/50">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", col.color)} />
              <h3 className="text-sm font-bold text-gray-200">{col.status}</h3>
              <span className="text-[10px] bg-[#27272a] text-gray-400 px-1.5 py-0.5 rounded-full">
                {contents.filter(c => c.status === col.status).length}
              </span>
            </div>
            <button 
              onClick={() => {
                setSelectedContent(undefined);
                setIsModalOpen(true);
              }}
              className="p-1 hover:bg-[#27272a] rounded transition-colors text-gray-500 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div 
            className="flex-1 overflow-y-auto p-3 space-y-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const contentId = parseInt(e.dataTransfer.getData('contentId'));
              const content = contents.find(c => c.id === contentId);
              if (content && content.status !== col.status) {
                moveContent(content, col.status);
              }
            }}
          >
            {contents
              .filter(c => c.status === col.status)
              .map((content) => (
                <KanbanCard 
                  key={content.id} 
                  content={content} 
                  onClick={() => {
                    setSelectedContent(content);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            
            {contents.filter(c => c.status === col.status).length === 0 && (
              <div className="h-20 border-2 border-dashed border-[#27272a] rounded-xl flex items-center justify-center text-gray-600 text-xs italic">
                Nenhum conteúdo
              </div>
            )}
          </div>
        </div>
      ))}

      <ContentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchContents();
        }}
        project={project}
        content={selectedContent}
      />
    </div>
  );
}

interface KanbanCardProps {
  content: Content;
  onClick: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ content, onClick }) => {
  return (
    <motion.div 
      draggable
      onDragStart={(e) => e.dataTransfer.setData('contentId', content.id.toString())}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-blue-500/30 transition-all shadow-lg"
    >
      <div className="flex items-center justify-between mb-2">
        <PlatformIcon type={content.platform} size={12} />
        <span className="text-[9px] font-bold text-gray-500 flex items-center gap-1 uppercase">
          <Clock className="w-2.5 h-2.5" />
          {content.publicationDate ? new Date(content.publicationDate).toLocaleDateString() : 'Sem data'}
        </span>
      </div>
      <h4 className="text-sm font-medium text-gray-100 line-clamp-2 leading-relaxed">{content.title}</h4>
      
      {content.description && (
        <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 italic">
          {content.description}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between">
        <div className="flex -space-x-1">
          <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-[#27272a] flex items-center justify-center">
             <span className="text-[8px] font-bold text-blue-400">RH</span>
          </div>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
