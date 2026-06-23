import React, { useEffect, useState } from 'react';
import { Project, Platform, Content } from '../types';
import { api } from '../lib/api';
import { 
  Users, 
  Video, 
  CheckCircle2, 
  Target, 
  BarChart3, 
  PieChart, 
  Calendar,
  Activity
} from 'lucide-react';
import { formatNumber, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export function ProjectDashboard({ project }: { project: Project }) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pData, cData] = await Promise.all([
          api.getPlatforms(project.id),
          api.getContents(project.id)
        ]);
        setPlatforms(pData);
        setContents(cData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [project.id]);

  const totalFollowers = platforms.reduce((acc, curr) => acc + curr.followers, 0);
  const totalGoal = platforms.reduce((acc, curr) => acc + curr.followersGoal, 0);
  const progress = totalGoal > 0 ? (totalFollowers / totalGoal) * 100 : 0;
  
  const scheduledCount = contents.filter(c => c.status === 'Programado').length;
  const publishedCount = contents.filter(c => c.status === 'Publicado').length;

  const chartData = platforms.map(p => ({
    name: p.type.charAt(0).toUpperCase() + p.type.slice(1),
    seguidores: p.followers,
    meta: p.followersGoal
  }));

  const statusData = [
    { name: 'Ideia', count: contents.filter(c => c.status === 'Ideia').length, color: '#94a3b8' },
    { name: 'Roteiro', count: contents.filter(c => c.status === 'Roteiro').length, color: '#f59e0b' },
    { name: 'Produção', count: contents.filter(c => c.status === 'Em produção').length, color: '#3b82f6' },
    { name: 'Edição', count: contents.filter(c => c.status === 'Edição').length, color: '#8b5cf6' },
    { name: 'Publicado', count: contents.filter(c => c.status === 'Publicado').length, color: '#10b981' },
  ].filter(s => s.count > 0);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6 pb-12">
      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users className="w-5 h-5 text-blue-400" />}
          label="Seguidores Totais"
          value={formatNumber(totalFollowers)}
          sublabel={`${platforms.length} plataformas ativas`}
        />
        <StatCard 
          icon={<Calendar className="w-5 h-5 text-purple-400" />}
          label="Programados"
          value={scheduledCount}
          sublabel="Prontos para postar"
        />
        <StatCard 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          label="Publicados"
          value={publishedCount}
          sublabel="Total histórico"
        />
        <StatCard 
          icon={<Target className="w-5 h-5 text-orange-400" />}
          label="Meta do Projeto"
          value={`${Math.round(progress)}%`}
          sublabel={`Faltam ${formatNumber(Math.max(0, totalGoal - totalFollowers))}`}
          progress={progress}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Followers by Platform */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Seguidores por Plataforma
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val}
                />
                <Tooltip 
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="seguidores" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Status Distribution */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Funil de Produção
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#a1a1aa" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Meta Principal</h3>
          <p className="text-lg font-medium text-white">{project.metaPrincipal || 'Nenhuma meta definida'}</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] p-6 rounded-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Observações</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{project.observacoes || 'Sem observações adicionais.'}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel, progress }: { icon: React.ReactNode, label: string, value: string | number, sublabel: string, progress?: number }) {
  return (
    <div className="bg-[#18181b] border border-[#27272a] p-5 rounded-2xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#09090b] rounded-lg border border-[#27272a]">
          {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      </div>
      <div>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-[10px] text-gray-500 mt-1 font-medium">{sublabel}</p>
      </div>
      {progress !== undefined && (
        <div className="w-full bg-[#09090b] h-1 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            className="bg-orange-500 h-full"
          />
        </div>
      )}
    </div>
  );
}
