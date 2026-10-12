const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Standard HTTP fetch wrapper with authorization header & centralized error handling
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If payload is not FormData, set Content-Type to application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (networkError) {
      console.error(`[Network Error] ${options.method || 'GET'} ${url}:`, networkError);
      throw new Error('Unable to connect to the backend server. Please verify the backend is running on http://localhost:5000.');
    }

    // Handle 401 Unauthorized (except for login / register attempts)
    const isAuthEndpoint = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');
    if (response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred while communicating with the server.');
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error.message);
    throw error;
  }
};

export const api = {
  // Auth
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // Candidate Portal
  getCandidateProfile: () => request('/candidate/profile'),
  updateCandidateProfile: (profileData) =>
    request('/candidate/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
  uploadCandidateResume: (formData) =>
    request('/candidate/resume', {
      method: 'POST',
      body: formData,
    }),
  getCandidateJobs: () => request('/candidate/jobs'),
  applyJob: (jobId) =>
    request(`/candidate/apply/${jobId}`, {
      method: 'POST',
    }),
  getMyApplications: () => request('/candidate/applications'),

  // Jobs
  getJobs: () => request('/jobs'),
  getJob: (id) => request(`/jobs/${id}`),
  createJob: (jobData) =>
    request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),
  updateJob: (id, jobData) =>
    request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    }),
  deleteJob: (id) =>
    request(`/jobs/${id}`, {
      method: 'DELETE',
    }),

  // Candidates
  getCandidates: (params = {}) => {
    const query = new URLSearchParams();
    if (params.jobId) query.append('jobId', params.jobId);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.minExperience) query.append('minExperience', params.minExperience);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/candidates${qs}`);
  },
  getCandidate: (id) => request(`/candidates/${id}`),
  createCandidate: (candidateData) =>
    request('/candidates', {
      method: 'POST',
      body: JSON.stringify(candidateData),
    }),
  updateCandidate: (id, data) =>
    request(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCandidate: (id) =>
    request(`/candidates/${id}`, {
      method: 'DELETE',
    }),

  // Resumes
  uploadResumes: (formData) =>
    request('/resumes/upload', {
      method: 'POST',
      body: formData,
    }),

  // Screening
  startScreening: (jobId) =>
    request(`/screening/${jobId}`, {
      method: 'POST',
    }),
  getScreeningResults: (jobId) => request(`/screening/${jobId}`),

  // Rankings
  getRankings: (jobId, params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.order) query.append('order', params.order);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/rankings/${jobId}${qs}`);
  },

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),
  getDashboardCharts: () => request('/dashboard/charts'),

  // Health
  getHealth: () => request('/health'),
};

export default api;
