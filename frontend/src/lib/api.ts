import axios from 'axios';

// Base API instance configured for the FastAPI backend
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const mode = localStorage.getItem('data-mode') || 'simulator';
    config.headers['x-data-mode'] = mode;
  }
  return config;
});

export const dashboardApi = {
  getMorningBrief: async (period: string = '30d') => {
    const response = await api.get(`/dashboard/brief?period=${period}`);
    return response.data;
  },
  getBusinessHealth: async () => {
    const response = await api.get('/dashboard/health');
    return response.data;
  },
  getAnomalies: async () => {
    const response = await api.get('/anomalies');
    return response.data;
  },
  getRecommendations: async () => {
    const response = await api.get('/recommendations');
    return response.data;
  },
  getAnalyticsHistory: async (period: string = '30d') => {
    const response = await api.get(`/analytics/history?period=${period}`);
    return response.data;
  },
  updateRecommendationStatus: async (recId: number, status: string, assignedToId?: number) => {
    let url = `/recommendations/${recId}/action?status=${status}`;
    if (assignedToId) url += `&assigned_to_id=${assignedToId}`;
    const response = await api.post(url);
    return response.data;
  },
  generateActionPlan: async (recId: number) => {
    const response = await api.post(`/recommendations/${recId}/action-plan`);
    return response.data;
  },
  getEmployees: async () => {
    const response = await api.get('/employees');
    return response.data;
  },
  bulkImportData: async (formData: FormData) => {
    const response = await api.post('/data-import/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-data-mode': 'real'
      },
    });
    return response.data;
  },
  getImportHistory: async () => {
    const response = await api.get('/data-import/history');
    return response.data;
  },
  generateBoardReport: async (reportId: string) => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  }
};
