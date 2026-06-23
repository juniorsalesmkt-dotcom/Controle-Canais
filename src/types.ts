export type PlatformType = 'youtube' | 'facebook' | 'instagram' | 'tiktok';

export interface Project {
  id: number;
  name: string;
  niche: string | null;
  description: string | null;
  metaPrincipal: string | null;
  observacoes: string | null;
  platformsActive: PlatformType[];
  createdAt: string;
}

export interface Platform {
  id: number;
  projectId: number;
  type: PlatformType;
  accountName: string | null;
  username: string | null;
  profileLink: string | null;
  followers: number;
  followersGoal: number;
}

export type ContentStatus = 
  | 'Ideia' 
  | 'Roteiro' 
  | 'Em produção' 
  | 'Edição' 
  | 'Thumbnail pronta' 
  | 'Pronto para publicação' 
  | 'Programado' 
  | 'Publicado';

export interface Content {
  id: number;
  projectId: number;
  title: string;
  platform: PlatformType;
  publicationDate: string | null;
  description: string | null;
  notes: string | null;
  status: ContentStatus;
  createdAt: string;
}

export interface DashboardStats {
  totalFollowers: number;
  totalScheduled: number;
  totalPublished: number;
  projects: (Project & {
    followers: number;
    followersGoal: number;
    scheduledCount: number;
    publishedCount: number;
  })[];
}
