import React, { useEffect, useState } from 'react';
import { Project, Platform, PlatformType } from '../types';
import { api } from '../lib/api';
import { 
  Save, 
  ExternalLink, 
  Users, 
  Target, 
  AtSign, 
  Link as LinkIcon,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { PlatformIcon } from './Home';
import { cn, formatNumber } from '../lib/utils';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

export function PlatformsManager({ project }: { project: Project }) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const activeTypes = project.platformsActive || [];

  useEffect(() => {
    fetchPlatforms();
  }, [project.id]);

  const fetchPlatforms = async () => {
    try {
      const data = await api.getPlatforms(project.id);
      setPlatforms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (type: PlatformType, data: Partial<Platform>) => {
    setSaving(type);
    try {
      const existing = platforms.find(p => p.type === type);
      const payload = {
        type,
        accountName: data.accountName ?? existing?.accountName ?? '',
        username: data.username ?? existing?.username ?? '',
        profileLink: data.profileLink ?? existing?.profileLink ?? '',
        followers: data.followers ?? existing?.followers ?? 0,
        followersGoal: data.followersGoal ?? existing?.followersGoal ?? 0,
      };
      const result = await api.savePlatform(project.id, payload);
      if (result.error) {
        toast.error(`Erro ao salvar plataforma: ${result.error}`);
      } else {
        toast.success(`Plataforma ${type} salva!`);
        await fetchPlatforms();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erro de conexão ao salvar plataforma.');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div>Carregando plataformas...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
      {activeTypes.length === 0 ? (
        <div className="col-span-full py-20 text-center bg-[#18181b] border border-[#27272a] rounded-2xl">
          <Share2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Nenhuma plataforma ativa</h3>
          <p className="text-gray-500 mt-1">Edite o projeto para ativar as plataformas que deseja gerenciar.</p>
        </div>
      ) : (
        activeTypes.map(type => (
          <PlatformCard 
            key={type}
            type={type}
            platform={platforms.find(p => p.type === type)}
            onSave={(data) => handleUpdate(type, data)}
            isSaving={saving === type}
          />
        ))
      )}
    </div>
  );
}

interface PlatformCardProps {
  type: PlatformType;
  platform?: Platform;
  onSave: (data: Partial<Platform>) => Promise<void> | void;
  isSaving: boolean;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ type, platform, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    accountName: platform?.accountName || '',
    username: platform?.username || '',
    profileLink: platform?.profileLink || '',
    followers: platform?.followers?.toString() || '0',
    followersGoal: platform?.followersGoal?.toString() || '0',
  });

  useEffect(() => {
    if (platform) {
      setFormData({
        accountName: platform.accountName || '',
        username: platform.username || '',
        profileLink: platform.profileLink || '',
        followers: platform.followers.toString(),
        followersGoal: platform.followersGoal.toString(),
      });
    }
  }, [platform]);

  const hasChanges = platform ? (
    formData.accountName !== (platform.accountName || '') ||
    formData.username !== (platform.username || '') ||
    formData.profileLink !== (platform.profileLink || '') ||
    formData.followers !== platform.followers.toString() ||
    formData.followersGoal !== platform.followersGoal.toString()
  ) : true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      accountName: formData.accountName,
      username: formData.username,
      profileLink: formData.profileLink,
      followers: parseInt(formData.followers) || 0,
      followersGoal: parseInt(formData.followersGoal) || 0,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden shadow-xl"
    >
      <div className="p-6 border-b border-[#27272a] flex items-center justify-between bg-[#1c1c1f]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#09090b] rounded-lg border border-[#27272a]">
            <PlatformIcon type={type} size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white capitalize">{type}</h3>
            {platform && (
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ativo
              </p>
            )}
          </div>
        </div>
        {formData.profileLink && (
          <a 
            href={formData.profileLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-[#27272a] rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Users className="w-3 h-3" /> Nome da Conta
            </label>
            <input 
              type="text"
              value={formData.accountName}
              onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Ex: Canal da Ruby"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <AtSign className="w-3 h-3" /> @Usuário
            </label>
            <input 
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="@rubyhart"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <LinkIcon className="w-3 h-3" /> Link do Perfil
          </label>
          <input 
            type="text"
            value={formData.profileLink}
            onChange={(e) => setFormData(prev => ({ ...prev, profileLink: e.target.value }))}
            className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            placeholder="https://..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Users className="w-3 h-3" /> Seguidores
            </label>
            <input 
              type="number"
              value={formData.followers}
              onChange={(e) => setFormData(prev => ({ ...prev, followers: e.target.value }))}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2 px-3 text-sm font-bold text-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Target className="w-3 h-3" /> Meta
            </label>
            <input 
              type="number"
              value={formData.followersGoal}
              onChange={(e) => setFormData(prev => ({ ...prev, followersGoal: e.target.value }))}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2 px-3 text-sm font-bold text-orange-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <button 
          disabled={isSaving || !hasChanges}
          className={cn(
            "w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
            hasChanges 
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10" 
              : "bg-[#27272a] text-gray-500 cursor-not-allowed"
          )}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </motion.div>
  );
}

function Share2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
