import { createApiClient } from './apiClient';

const api = createApiClient();

export const badgerService = {
  // Get all user's honey badgers
  async getMyBadgers() {
    try {
      const response = await api.get('/badgers');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch honey badgers');
    }
  },

  // Get specific honey badger details
  async getBadgerDetail(badgerId) {
    try {
      const response = await api.get(`/badgers/${badgerId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch honey badger details');
    }
  },

  // Create new honey badger
  async createBadger(badgerData) {
    try {
      const response = await api.post('/badgers', badgerData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create honey badger');
    }
  },

  // Update honey badger
  async updateBadger(badgerId, updateData) {
    try {
      const response = await api.put(`/badgers/${badgerId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update honey badger');
    }
  },

  // Delete (retire) honey badger
  async deleteBadger(badgerId) {
    try {
      const response = await api.delete(`/badgers/${badgerId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to retire honey badger');
    }
  },

  // Get available personality types
  async getPersonalityTypes() {
    try {
      const response = await api.get('/badgers/personalities/types');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch personality types');
    }
  },

  // Get badger statistics
  async getBadgerStats(badgerId) {
    try {
      const response = await api.get(`/badgers/${badgerId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch badger statistics');
    }
  },

  // Level up badger (if applicable)
  async levelUpBadger(badgerId) {
    try {
      const response = await api.post(`/badgers/${badgerId}/level-up`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to level up honey badger');
    }
  },
};

export default badgerService;