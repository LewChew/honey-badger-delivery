import { createApiClient } from './apiClient';

const api = createApiClient();

export const challengeService = {
  // Get user's challenges with optional filters
  async getMyChallenges(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.role) params.append('role', filters.role);
      
      const response = await api.get(`/challenges?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch challenges');
    }
  },

  // Get specific challenge details
  async getChallengeDetail(challengeId) {
    try {
      const response = await api.get(`/challenges/${challengeId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch challenge details');
    }
  },

  // Create new challenge
  async createChallenge(challengeData) {
    try {
      const response = await api.post('/challenges', challengeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create challenge');
    }
  },

  // Accept challenge (for recipients)
  async acceptChallenge(challengeId) {
    try {
      const response = await api.post(`/challenges/${challengeId}/accept`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to accept challenge');
    }
  },

  // Submit progress update
  async submitProgress(challengeId, progressData) {
    try {
      const response = await api.post(`/challenges/${challengeId}/progress`, progressData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit progress');
    }
  },

  // Cancel challenge (for senders)
  async cancelChallenge(challengeId) {
    try {
      const response = await api.post(`/challenges/${challengeId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel challenge');
    }
  },

  // Upload media for progress verification
  async uploadProgressMedia(challengeId, mediaFile, type = 'photo') {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: mediaFile.uri,
        type: mediaFile.type,
        name: mediaFile.fileName || `${type}_${Date.now()}.jpg`,
      });
      formData.append('type', type);
      formData.append('challengeId', challengeId);

      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for file uploads
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload media');
    }
  },

  // Get challenge statistics
  async getChallengeStats() {
    try {
      const response = await api.get('/challenges/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch challenge statistics');
    }
  },

  // Search for users to send challenges to
  async searchUsers(query) {
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search users');
    }
  },

  // Get challenge templates
  async getChallengeTemplates(type = null) {
    try {
      const params = type ? `?type=${type}` : '';
      const response = await api.get(`/challenges/templates${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch challenge templates');
    }
  },

  // Report challenge
  async reportChallenge(challengeId, reason, description) {
    try {
      const response = await api.post(`/challenges/${challengeId}/report`, {
        reason,
        description,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to report challenge');
    }
  },

  // Share challenge achievement
  async shareAchievement(challengeId, platform = 'general') {
    try {
      const response = await api.post(`/challenges/${challengeId}/share`, {
        platform,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to share achievement');
    }
  },
};

export default challengeService;