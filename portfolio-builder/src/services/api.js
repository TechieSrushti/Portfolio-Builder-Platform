const BASE_URL = "http://localhost:5000/api";

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
};

export const api = {
  // Auth
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body }),
    login: (body) => request('/auth/login', { method: 'POST', body }),
    verifyEmail: (token) => request(`/auth/verify/${token}`, { method: 'GET' }),
    forgotPassword: (body) => request('/auth/forgotpassword', { method: 'POST', body }),
    resetPassword: (token, body) => request(`/auth/resetpassword/${token}`, { method: 'POST', body }),
    getProfile: () => request('/auth/profile', { method: 'GET' }),
    updateProfile: (body) => request('/auth/profile', { method: 'PUT', body }),
  },

  // Portfolios
  portfolios: {
    create: (body) => request('/portfolios', { method: 'POST', body }),
    getAll: () => request('/portfolios', { method: 'GET' }),
    getById: (id) => request(`/portfolios/${id}`, { method: 'GET' }),
    update: (id, body) => request(`/portfolios/${id}`, { method: 'PUT', body }),
    delete: (id) => request(`/portfolios/${id}`, { method: 'DELETE' }),
    publish: (id, isPublished) => request(`/portfolios/${id}/publish`, { method: 'PUT', body: { isPublished } }),
    getPublished: (username, password = '') => {
      const pwParam = password ? `?password=${encodeURIComponent(password)}` : '';
      return request(`/portfolios/p/${username}${pwParam}`, { method: 'GET' });
    },
    like: (id) => request(`/portfolios/${id}/like`, { method: 'POST' }),
    comment: (id, text) => request(`/portfolios/${id}/comment`, { method: 'POST', body: { text } }),
    restoreVersion: (id, versionNumber) => request(`/portfolios/${id}/restore/${versionNumber}`, { method: 'POST' }),
    getGallery: (search = '', category = 'all', sort = 'recent') => {
      const query = `?search=${search}&category=${category}&sort=${sort}`;
      return request(`/portfolios/gallery${query}`, { method: 'GET' });
    },
  },

  // Resumes
  resumes: {
    get: () => request('/resumes', { method: 'GET' }),
    update: (body) => request('/resumes', { method: 'PUT', body }),
    getPdfUrl: () => `${BASE_URL}/resumes/pdf?token=${localStorage.getItem('token')}`,
  },

  // Invoices
  invoices: {
    create: (body) => request('/invoices', { method: 'POST', body }),
    getAll: () => request('/invoices', { method: 'GET' }),
    getById: (id) => request(`/invoices/${id}`, { method: 'GET' }),
    update: (id, body) => request(`/invoices/${id}`, { method: 'PUT', body }),
    delete: (id) => request(`/invoices/${id}`, { method: 'DELETE' }),
    getPdfUrl: (id) => `${BASE_URL}/invoices/${id}/pdf?token=${localStorage.getItem('token')}`,
  },

  // Analytics
  analytics: {
    get: (portfolioId) => request(`/analytics/${portfolioId}`, { method: 'GET' }),
  },

  // AI Assistant
  ai: {
    bio: (body) => request('/ai/bio', { method: 'POST', body }),
    projectDesc: (body) => request('/ai/project-desc', { method: 'POST', body }),
    skills: (body) => request('/ai/skills-suggestion', { method: 'POST', body }),
    resumeSummary: (body) => request('/ai/resume-summary', { method: 'POST', body }),
    headline: (body) => request('/ai/headline', { method: 'POST', body }),
  },

  // Billing Payments
  payments: {
    checkout: (plan) => request('/payments/checkout', { method: 'POST', body: { plan } }),
    simulateUpgrade: (plan) => request('/payments/simulate-upgrade', { method: 'POST', body: { plan } }),
  },

  // Admin Dashboard
  admin: {
    getDashboard: () => request('/admin/dashboard', { method: 'GET' }),
    getUsers: () => request('/admin/users', { method: 'GET' }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    updateUserPlan: (id, plan) => request(`/admin/users/${id}/plan`, { method: 'PUT', body: { plan } }),
    getPortfolios: () => request('/admin/portfolios', { method: 'GET' }),
    featurePortfolio: (id) => request(`/admin/portfolios/${id}/feature`, { method: 'PUT' }),
  },
};
export default api;
