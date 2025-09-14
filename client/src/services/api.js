import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  createAdmin: (adminData) => api.post('/auth/create-admin', adminData),
};

// Campaigns API
export const campaignsAPI = {
  getAll: (params) => api.get('/campaigns', { params }),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (campaignData) => api.post('/campaigns', campaignData),
  update: (id, campaignData) => api.put(`/campaigns/${id}`, campaignData),
  updateStatus: (id, status) => api.patch(`/campaigns/${id}/status`, { status }),
  delete: (id) => api.delete(`/campaigns/${id}`),
};

// Influencers API
export const influencersAPI = {
  getAll: (params) => api.get('/influencers', { params }),
  getById: (id) => api.get(`/influencers/${id}`),
  updateProfile: (profileData) => api.post('/influencers/profile', profileData),
  getCampaigns: (id, params) => api.get(`/influencers/${id}/campaigns`, { params }),
  updateAssignmentStatus: (assignmentId, status) => 
    api.patch(`/influencers/assignments/${assignmentId}/status`, { status }),
};

// Assignments API
export const assignmentsAPI = {
  create: (assignmentData) => api.post('/assignments', assignmentData),
  delete: (assignmentId) => api.delete(`/assignments/${assignmentId}`),
  getByCampaign: (campaignId) => api.get(`/assignments/campaign/${campaignId}`),
  getByInfluencer: (influencerId) => api.get(`/assignments/influencer/${influencerId}`),
  updatePayment: (assignmentId, paymentAmount) => 
    api.patch(`/assignments/${assignmentId}/payment`, { paymentAmount }),
};

// Content API
export const contentAPI = {
  submit: (formData) => api.post('/content/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByCampaign: (campaignId, params) => api.get(`/content/campaign/${campaignId}`, { params }),
  getByInfluencer: (influencerId) => api.get(`/content/influencer/${influencerId}`),
  review: (submissionId, reviewData) => api.patch(`/content/${submissionId}/review`, reviewData),
  getById: (submissionId) => api.get(`/content/${submissionId}`),
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data),
  confirmPayment: (data) => api.post('/payments/confirm-payment', data),
  getHistory: () => api.get('/payments/history'),
  getStats: () => api.get('/payments/stats'),
};

export default api;
