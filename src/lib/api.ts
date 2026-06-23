import { auth } from './firebase';

async function getHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}: ${res.statusText}`);
  }
  return data;
}

export const api = {
  async getProjects() {
    const res = await fetch('/api/projects', { headers: await getHeaders() });
    return handleResponse(res);
  },
  async createProject(data: any) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async updateProject(id: number, data: any) {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async deleteProject(id: number) {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return handleResponse(res);
  },
  async getPlatforms(projectId: number) {
    const res = await fetch(`/api/projects/${projectId}/platforms`, { headers: await getHeaders() });
    return handleResponse(res);
  },
  async savePlatform(projectId: number, data: any) {
    const res = await fetch(`/api/projects/${projectId}/platforms`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async getContents(projectId: number) {
    const res = await fetch(`/api/projects/${projectId}/contents`, { headers: await getHeaders() });
    return handleResponse(res);
  },
  async createContent(projectId: number, data: any) {
    const res = await fetch(`/api/projects/${projectId}/contents`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async updateContent(id: number, data: any) {
    const res = await fetch(`/api/contents/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async deleteContent(id: number) {
    const res = await fetch(`/api/contents/${id}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return handleResponse(res);
  },
  async getDashboard() {
    const res = await fetch('/api/dashboard', { headers: await getHeaders() });
    return handleResponse(res);
  }
};
