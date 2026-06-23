import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { Project, PlatformType } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: Project;
}

const PLATFORMS: { type: PlatformType; label: string }[] = [
  { type: 'youtube', label: 'YouTube' },
  { type: 'facebook', label: 'Facebook' },
  { type: 'instagram', label: 'Instagram' },
  { type: 'tiktok', label: 'TikTok' },
];

export function ProjectModal({ isOpen, onClose, onSuccess, project }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('');
  const [description, setDescription] = useState('');
  const [metaPrincipal, setMetaPrincipal] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [platformsActive, setPlatformsActive] = useState<PlatformType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setNiche(project.niche || '');
      setDescription(project.description || '');
      setMetaPrincipal(project.metaPrincipal || '');
      setObservacoes(project.observacoes || '');
      setPlatformsActive(project.platformsActive || []);
    } else {
      setName('');
      setNiche('');
      setDescription('');
      setMetaPrincipal('');
      setObservacoes('');
      setPlatformsActive([]);
    }
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { name, niche, description, metaPrincipal, observacoes, platformsActive };
      let result;
      if (project) {
        result = await api.updateProject(project.id, data);
      } else {
        result = await api.createProject(data);
      }

      if (result.error) {
        toast.error(`Erro: ${result.error}`);
      } else {
        toast.success(project ? 'Projeto atualizado!' : 'Projeto criado!');
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro de conexão ao salvar projeto.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (type: PlatformType) => {
    setPlatformsActive(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleDelete = async () => {
    if (!project || !window.confirm('Tem certeza que deseja excluir este projeto? Esta ação é irreversível.')) return;
    setLoading(true);
    try {
      const result = await api.deleteProject(project.id);
      if (result.error) {
        toast.error(`Erro: ${result.error}`);
      } else {
        toast.success('Projeto excluído!');
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro de conexão ao excluir projeto.');
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
            className="relative w-full max-w-2xl bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
              <h2 className="text-xl font-bold">{project ? 'Editar Projeto' : 'Novo Projeto'}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Nome do Projeto</label>
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="Ex: Ruby Hart"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Nicho</label>
                    <input 
                      type="text"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="Ex: Entretenimento, Tech..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Descrição</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="Breve descrição do projeto..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Meta Principal</label>
                  <input 
                    type="text"
                    value={metaPrincipal}
                    onChange={(e) => setMetaPrincipal(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ex: 100k inscritos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Observações</label>
                  <input 
                    type="text"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-400">Plataformas Ativas</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PLATFORMS.map(({ type, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => togglePlatform(type)}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all",
                        platformsActive.includes(type) 
                          ? "bg-blue-600/10 border-blue-500 text-blue-400" 
                          : "bg-[#09090b] border-[#27272a] text-gray-500 hover:border-gray-600"
                      )}
                    >
                      {platformsActive.includes(type) && <CheckCircle2 className="w-4 h-4" />}
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-[#27272a] bg-[#09090b]/50 flex items-center justify-between gap-4">
              {project ? (
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
                  disabled={loading || !name}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  {loading ? 'Salvando...' : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Projeto
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
