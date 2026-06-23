import { auth } from './firebase';

async function getHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const api = {
  async getProjects() {
    const res = await fetch('/api/projects', { headers: await getHeaders() });
    return res.json();
  },
  async createProject(data: any) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateProject(id: number, data: any) {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteProject(id: number) {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return res.json();
  },
  async getPlatforms(projectId: number) {
    const res = await fetch(`/api/projects/${projectId}/platforms`, { headers: await getHeaders() });
    return res.json();
  },
  async savePlatform(projectId: number, data: any) {
    const res = await fetch(`/api/projects/${projectId}/platforms`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async getContents(projectId: number) {
    const res = await fetch(`/api/projects/${projectId}/contents`, { headers: await getHeaders() });
    return res.json();
  },
  async createContent(projectId: number, data: any) {
    const res = await fetch(`/api/projects/${projectId}/contents`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateContent(id: number, data: any) {
    const res = await fetch(`/api/contents/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteContent(id: number) {
    const res = await fetch(`/api/contents/${id}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return res.json();
  },
  async getDashboard() {
    const res = await fetch('/api/dashboard', { headers: await getHeaders() });
    return res.json();
  }
};
