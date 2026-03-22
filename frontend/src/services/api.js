import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
    const stored = localStorage.getItem('bp_user');
    if (stored) {
        const { token } = JSON.parse(stored);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle 401 responses (e.g., token expired or user not found)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('bp_user');
            // Check if not already on login page to avoid endless loops
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const googleAuth = (data) => API.post('/auth/google', data);
export const getMe = () => API.get('/auth/me');

// ─── Business Profile ────────────────────────────────────────────────────────
export const createOrUpdateProfile = (data) => API.post('/business/profile', data);
export const getMyProfile = () => API.get('/business/profile/me/data');
export const getProfileByUserId = (userId) => API.get(`/business/profile/${userId}`);
export const getAllProfiles = (params) => API.get('/business/profiles', { params });
export const addPortfolioProject = (data) => API.post('/business/profile/project', data);
export const deletePortfolioProject = (id) => API.delete(`/business/profile/project/${id}`);

// ─── Services ────────────────────────────────────────────────────────────────
export const createService = (data) => API.post('/services', data);
export const getServices = (params) => API.get('/services', { params });
export const getServicesByBusiness = (businessId) => API.get(`/services/business/${businessId}`);
export const getMyServices = () => API.get('/services/mine');
export const getService = (id) => API.get(`/services/${id}`);
export const updateService = (id, data) => API.put(`/services/${id}`, data);
export const deleteService = (id) => API.delete(`/services/${id}`);

// ─── Hire Requests ───────────────────────────────────────────────────────────
export const createHireRequest = (data) => API.post('/hire', data);
export const updateHireStatus = (id, data) => API.put(`/hire/${id}`, data);
export const getMyHireRequests = () => API.get('/hire');
export const getHireRequest = (id) => API.get(`/hire/${id}`);

// ─── Messages ────────────────────────────────────────────────────────────────
export const getMessages = (hireRequestId) => API.get(`/messages/${hireRequestId}`);

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const createReview = (data) => API.post('/reviews', data);
export const getBusinessReviews = (businessId) => API.get(`/reviews/${businessId}`);

export default API;
