import React, { useState, useEffect } from 'react';
import { Project, Content, ContentStatus } from '../types';
import { api } from '../lib/api';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  FileText,
  Trash2,
  Edit2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ContentModal } from './ContentModal';
import { PlatformIcon } from './Home';

export function ContentManager({ project }: { project: Project }) {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir este conteúdo?')) return;
    try {
      await api.deleteContent(id);
      fetchContents();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = contents.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Buscar conteúdos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#18181b] border border-[#27272a] rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Todos Status</option>
            <option value="Ideia">Ideia</option>
            <option value="Programado">Programado</option>
            <option value="Publicado">Publicado</option>
          </select>
        </div>
        <button 
          onClick={() => {
            setSelectedContent(undefined);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Conteúdo
        </button>
      </div>

      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#1c1c1f] border-b border-[#27272a]">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Título</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Plataforma</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Data</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {filtered.map((content) => (
              <tr key={content.id} className="hover:bg-[#111114]/50 transition-colors group">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-white">{content.title}</p>
                    {content.description && <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 italic">{content.description}</p>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 capitalize text-xs text-gray-300">
                    <PlatformIcon type={content.platform} size={14} />
                    {content.platform}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                    getStatusStyles(content.status)
                  )}>
                    {content.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {content.publicationDate ? new Date(content.publicationDate).toLocaleDateString() : 'Não definido'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setSelectedContent(content);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-[#27272a] rounded transition-colors text-gray-400 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(content.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded transition-colors text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum conteúdo encontrado.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

function getStatusStyles(status: string) {
  switch (status) {
    case 'Publicado': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'Programado': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    case 'Ideia': return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    case 'Roteiro': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'Em produção': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case 'Edição': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  }
}
