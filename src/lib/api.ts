import { auth } from './firebase';

async function getHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type');
  let data;
  
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    throw new Error(`Erro ${res.status}: Servidor não retornou JSON. Resposta: ${text.substring(0, 100)}...`);
  }

  if (!res.ok) {
    throw new Error(data?.error || `Erro ${res.status}: ${res.statusText}`);
  }
  return data;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> {
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
}

export const api = {
  async getProjects() {
    const res = await fetchWithRetry('/api/projects', { headers: await getHeaders() });
    return handleResponse(res);
  },
  async createProject(data: any) {
    const res = await fetchWithRetry('/api/projects', {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async updateProject(id: number, data: any) {
    const res = await fetchWithRetry(`/api/projects/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async deleteProject(id: number) {
    const res = await fetchWithRetry(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return handleResponse(res);
  },
  async getPlatforms(projectId: number) {
    const res = await fetchWithRetry(`/api/projects/${projectId}/platforms`, { headers: await getHeaders() });
    return handleResponse(res);
  },
  async savePlatform(projectId: number, data: any) {
    const res = await fetchWithRetry(`/api/projects/${projectId}/platforms`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async getContents(projectId: number) {
    const res = await fetchWithRetry(`/api/projects/${projectId}/contents`, { headers: await getHeaders() });
    return handleResponse(res);
  },
  async createContent(projectId: number, data: any) {
    const res = await fetchWithRetry(`/api/projects/${projectId}/contents`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async updateContent(id: number, data: any) {
    const res = await fetchWithRetry(`/api/contents/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async deleteContent(id: number) {
    const res = await fetchWithRetry(`/api/contents/${id}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return handleResponse(res);
  },
  async getDashboard() {
    const res = await fetchWithRetry('/api/dashboard', { headers: await getHeaders() });
    return handleResponse(res);
  }
};
