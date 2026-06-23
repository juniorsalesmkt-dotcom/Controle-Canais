import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { DashboardStats, Project } from '../types';
import { 
  Users, 
  Video, 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  Plus, 
  Search,
  ExternalLink,
  MoreVertical,
  Youtube,
  Facebook,
  Instagram,
  Music2, // For TikTok
  ArrowRight,
  Folder
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatNumber } from '../lib/utils';
import { ProjectModal } from './ProjectModal';
import { toast } from 'react-hot-toast';

interface HomeProps {
  onSelectProject: (id: number) => void;
}

export function Home({ onSelectProject }: HomeProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      if (data.error) {
        toast.error(`Erro ao carregar dashboard: ${data.error}`);
      } else {
        setStats(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro de conexão ao carregar dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const filteredProjects = stats?.projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.niche?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading && !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Geral</h1>
          <p className="text-gray-400 mt-1">Visão unificada de todos os seus ecossistemas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          Novo Projeto
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users className="w-5 h-5 text-blue-400" />}
          label="Total de Seguidores"
          value={formatNumber(stats?.totalFollowers || 0)}
          trend="+12% este mês"
        />
        <StatCard 
          icon={<Video className="w-5 h-5 text-purple-400" />}
          label="Conteúdos Programados"
          value={stats?.totalScheduled || 0}
          trend="Ativo em 4 canais"
        />
        <StatCard 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          label="Conteúdos Publicados"
          value={stats?.totalPublished || 0}
          trend="Total histórico"
        />
        <StatCard 
          icon={<Target className="w-5 h-5 text-orange-400" />}
          label="Meta Média"
          value="78%"
          trend="Meta de Crescimento"
          progress={78}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Meus Projetos</h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Buscar projetos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id}
              project={project}
              onClick={() => onSelectProject(project.id)}
            />
          ))}
          
          {filteredProjects.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center bg-[#18181b] border border-dashed border-[#27272a] rounded-2xl">
              <Folder className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white">Nenhum projeto encontrado</h3>
              <p className="text-gray-500 mt-1 mb-6">Comece criando seu primeiro ecossistema de conteúdo.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 mx-auto"
              >
                Criar novo projeto <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          fetchDashboard();
        }}
      />
    </div>
  );
}

function StatCard({ icon, label, value, trend, progress }: { icon: React.ReactNode, label: string, value: string | number, trend: string, progress?: number }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-[#18181b] border border-[#27272a] p-5 rounded-2xl space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="p-2 bg-[#09090b] rounded-lg border border-[#27272a]">
          {icon}
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      {progress !== undefined ? (
        <div className="space-y-2">
          <div className="w-full bg-[#09090b] h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-orange-500 h-full"
            />
          </div>
          <p className="text-[10px] text-gray-500">{trend}</p>
        </div>
      ) : (
        <p className="text-[10px] text-gray-500 font-medium">{trend}</p>
      )}
    </motion.div>
  );
}

interface ProjectCardProps {
  project: any;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const platforms = project.platformsActive || [];
  const progress = project.followersGoal > 0 ? (project.followers / project.followersGoal) * 100 : 0;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group bg-[#18181b] border border-[#27272a] rounded-2xl p-6 cursor-pointer transition-all hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{project.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{project.niche}</p>
        </div>
        <div className="flex -space-x-2">
          {platforms.map((p: any) => (
            <div key={p} className="p-1.5 bg-[#09090b] rounded-full border border-[#27272a]">
              <PlatformIcon type={p} size={14} />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#09090b] p-3 rounded-xl border border-[#27272a]">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Seguidores</p>
            <p className="text-lg font-bold mt-0.5">{formatNumber(project.followers)}</p>
          </div>
          <div className="bg-[#09090b] p-3 rounded-xl border border-[#27272a]">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Publicados</p>
            <p className="text-lg font-bold mt-0.5">{project.publishedCount}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-gray-400">Progresso da Meta</span>
            <span className="text-blue-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[#09090b] h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              className="bg-blue-500 h-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />
          </div>
          <p className="text-[10px] text-gray-500">
            {project.scheduledCount} conteúdos programados
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">Criado em {new Date(project.createdAt).toLocaleDateString()}</span>
          <button className="text-gray-400 group-hover:text-white transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function PlatformIcon({ type, size = 16, className = "" }: { type: string, size?: number, className?: string }) {
  switch (type.toLowerCase()) {
    case 'youtube': return <Youtube size={size} className={cn("text-red-500", className)} />;
    case 'facebook': return <Facebook size={size} className={cn("text-blue-600", className)} />;
    case 'instagram': return <Instagram size={size} className={cn("text-pink-500", className)} />;
    case 'tiktok': return <Music2 size={size} className={cn("text-white", className)} />;
    default: return null;
  }
}
