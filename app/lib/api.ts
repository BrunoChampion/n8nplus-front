import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001'; // Update with your actual backend URL

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const n8nApi = {
    getWorkflows: () => api.get('/n8n/workflows').then(res => res.data),
    getWorkflow: (id: string) => api.get(`/n8n/workflows/${id}`).then(res => res.data),
};

export const agentApi = {
    chat: (message: string, history: any[] = []) =>
        api.post('/ai/chat', { message, history }).then(res => res.data),
};

export const settingsApi = {
    getAll: () => api.get('/settings').then(res => res.data),
    update: (settings: Record<string, string>) => api.post('/settings', settings).then(res => res.data),
};

export default api;
