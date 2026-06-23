import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar as CalendarIcon, Info } from 'lucide-react';
import { api } from '../lib/api';
import { Project, Content, ContentStatus, PlatformType } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project;
  content?: Content;
}

const STATUSES: ContentStatus[] = [
  'Ideia', 
  'Roteiro', 
  'Em produção', 
  'Edição', 
  'Thumbnail pronta', 
  'Pronto para publicação', 
  'Programado', 
  'Publicado'
];

export function ContentModal({ isOpen, onClose, onSuccess, project, content }: ContentModalProps) {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('youtube');
  const [publicationDate, setPublicationDate] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ContentStatus>('Ideia');
  const [loading, setLoading] = useState(false);

  const activePlatforms = project.platformsActive || [];

  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setPlatform(content.platform);
      setPublicationDate(content.publicationDate || '');
      setDescription(content.description || '');
      setNotes(content.notes || '');
      setStatus(content.status);
    } else {
      setTitle('');
      setPlatform(activePlatforms[0] || 'youtube');
      setPublicationDate('');
      setDescription('');
      setNotes('');
      setStatus('Ideia');
    }
  }, [content, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { title, platform, publicationDate, description, notes, status };
      if (content) {
        await api.updateContent(content.id, data);
      } else {
        await api.createContent(project.id, data);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!content || !window.confirm('Excluir este conteúdo?')) return;
    setLoading(true);
    try {
      await api.deleteContent(content.id);
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
              <h2 className="text-xl font-bold">{content ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Título do Conteúdo</label>
                  <input 
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="Ex: Como gerenciar canais no Notion"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Plataforma</label>
                    <select 
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as PlatformType)}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all capitalize"
                    >
                      {activePlatforms.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Data de Publicação</label>
                    <input 
                      type="date"
                      value={publicationDate}
                      onChange={(e) => setPublicationDate(e.target.value)}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Status Atual</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STATUSES.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={cn(
                          "py-2 text-[10px] font-bold uppercase rounded-lg border transition-all",
                          status === s 
                            ? "bg-blue-600 border-blue-500 text-white" 
                            : "bg-[#09090b] border-[#27272a] text-gray-500 hover:border-gray-600"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Descrição / Roteiro Resumido</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                    placeholder="O que será abordado?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Observações Internas</label>
                  <input 
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="Links de referência, lembretes..."
                  />
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-[#27272a] bg-[#09090b]/50 flex items-center justify-between gap-4">
              {content ? (
                <button 
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              ) : <div />}
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-all font-medium"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading || !title}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  {loading ? 'Salvando...' : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Conteúdo
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
