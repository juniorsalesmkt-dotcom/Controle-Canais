import React, { useState, useEffect } from 'react';
import { Project, Content } from '../types';
import { api } from '../lib/api';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ContentModal } from './ContentModal';
import { PlatformIcon } from './Home';

export function CalendarView({ project }: { project: Project }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <p className="text-gray-500 text-sm">Visualize sua programação de postagens.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#18181b] border border-[#27272a] rounded-lg p-1">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-[#27272a] rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 text-xs font-medium hover:bg-[#27272a] rounded-md transition-colors"
            >
              Hoje
            </button>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-[#27272a] rounded-md transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => {
              setSelectedContent(undefined);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day, index) => (
          <div key={index} className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    let daysInRow = [];
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const dayContents = contents.filter(c => c.publicationDate && isSameDay(new Date(c.publicationDate + 'T12:00:00'), day));
      
      daysInRow.push(
        <div
          key={day.toString()}
          className={cn(
            "min-h-[120px] bg-[#18181b]/30 border border-[#27272a]/50 p-2 transition-all",
            !isSameMonth(day, monthStart) ? "opacity-20" : "hover:bg-[#18181b]/50",
            isSameDay(day, new Date()) && "bg-blue-500/5 border-blue-500/20"
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={cn(
              "text-xs font-medium",
              isSameDay(day, new Date()) ? "text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded" : "text-gray-500"
            )}>
              {format(day, 'd')}
            </span>
          </div>
          <div className="space-y-1">
            {dayContents.map(content => (
              <button
                key={content.id}
                onClick={() => {
                  setSelectedContent(content);
                  setIsModalOpen(true);
                }}
                className={cn(
                  "w-full text-left p-1.5 rounded text-[10px] truncate flex items-center gap-1.5 border border-[#27272a]",
                  getStatusColor(content.status)
                )}
              >
                <PlatformIcon type={content.platform} size={10} />
                <span className="truncate">{content.title}</span>
              </button>
            ))}
          </div>
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div className="grid grid-cols-7" key={day.toString() + 'row'}>
            {daysInRow}
          </div>
        );
        daysInRow = [];
      }
    }

    return <div className="rounded-2xl overflow-hidden border border-[#27272a] shadow-2xl bg-[#09090b]">{rows}</div>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Programado': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Publicado': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Ideia': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="pb-20 h-full overflow-y-auto">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

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
