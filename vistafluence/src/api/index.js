import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://vistafluenceapp.onrender.com/api';

async function getToken() {
  const token = await AsyncStorage.getItem('vistafluence_token');
  return token;
}
async function get(path) {
  const token = await getToken();
  const res = await fetch(API_BASE + path, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  return res.json();
}

async function post(path, body) {
  const token = await getToken();
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(body),
  });
  return res.json();
}
async function postFormData(path, formData) {
  const token = await getToken();
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return res.json();
}

async function patch(path, body = {}) {
  const token = await getToken();
  const res = await fetch(API_BASE + path, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function put(path, body = {}) {
  const token = await getToken();
  const res = await fetch(API_BASE + path, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(body),
  });
  return res.json();
}
async function del(path) {
  const token = await getToken();
  const res = await fetch(API_BASE + path, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.json();
}
export const api = {
  // Auth
  login: (data) => post('/auth/login', data),
  signup: (data) => post('/auth/signup', data),
  getMe: () => get('/auth/me'), 
  // Campaigns & Feed
  getFeed: (page = 1) => get(`/campaigns/feed?page=${page}`),
  getCampaign: (id) => get(`/campaigns/${id}`),
  getMyCampaigns: () => get('/campaigns/brand/my'),
  createCampaign: (data) => post('/campaigns', data),

  // Real-time Engine
  likeCampaign: (campaignId) => post(`/campaigns/${campaignId}/like`, {}),
  commentCampaign: (campaignId, data) => post(`/campaigns/${campaignId}/comment`, data),

  // Apply & Manage
  applyToCampaign: (campaignId, data) => post(`/campaigns/${campaignId}/apply`, data),
  getMyApplications: () => get('/applications/me'),
  getCampaignApplicants: (campaignId) => get(`/campaigns/${campaignId}/applicants`),
  updateApplicationStatus: (appId, status) => put(`/campaigns/application/${appId}`, { status }),
  
  // Profiles & Social
  getBrandProfile: (id) => get(`/brand/${id}`),
  getBrandCampaigns: (id) => get(`/brands/${id}/campaigns`),
  getInfluencerProfile: (id) => get(`/influencers/${id}`),
  getPublicInfluencerProfile: (id) => get(`/influencer/public/${id}`),
  // Notifications & Chat
  getNotifications: () => get('/notifications'),
  markNotifRead: (id) => patch(`/notifications/${id}/read`),
  getChatList: () => get('/messages'),
  getChatMessages: (chatId) => get(`/messages/${chatId}`),
  getChatMessages: (chatId) => get(`/messages/${chatId}`),
  
  sendMessage: (chatId, text, messageType = 'text', fileUrl = '') =>
    post(`/messages/${chatId}`, { text, messageType, fileUrl }),
  uploadMediaAsset: (formData) => postFormData('/messages/upload', formData),
  // Academy                                        
  getAcademyCourses: () => get('/academy/courses'),
  getAdminCourses: () => get('/academy/admin/courses'),
  createCourse: (data) => post('/academy/admin/courses', data),
  togglePublish: (courseId) => patch(`/academy/admin/courses/${courseId}/publish`),
  deleteCourse: (courseId) => del(`/academy/admin/courses/${courseId}`),
  addVideoUrl: (courseId, data) => post(`/academy/admin/courses/${courseId}/video-url`, data),
  deleteVideo: (videoId) => del(`/academy/admin/videos/${videoId}`),
  get,
  post,
  patch,
  put,
  delete: del,
};
export default api;