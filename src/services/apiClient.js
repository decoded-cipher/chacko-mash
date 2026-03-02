const axios = require('axios');
const logger = require('../utils/logger');

class ApiClient {
  constructor() {
    if (!process.env.API_BASE_URL || !process.env.INOVUS_AUTH_TOKEN) {
      logger.warn('API configuration missing. API functionality will be disabled.');
      return;
    }
    this.client = axios.create({
      baseURL: process.env.API_BASE_URL,
      headers: {
        Authorization: `Bearer ${process.env.INOVUS_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async getExtUserData(id) {
    if (!this.client) throw new Error('API client not configured');
    try {
      const { data } = await this.client.get('/user/ext', { params: { id } });
      return data;
    } catch (error) {
      logger.error('Failed to get user data:', { id, error });
      throw new Error(`Failed to fetch user data for ID: ${id}`);
    }
  }

  async getBdayUser(day, month) {
    if (!this.client) throw new Error('API client not configured');
    try {
      const { data } = await this.client.get('/bday', { params: { dd: day, mm: month } });
      return data;
    } catch (error) {
      logger.error('Failed to get birthday users:', { day, month, error });
      throw new Error(`Failed to fetch birthday users for ${day}/${month}`);
    }
  }

  async postHacktoberfestData(data) {
    if (!this.client) throw new Error('API client not configured');
    try {
      const { data: result } = await this.client.post('/hacktoberfest', data);
      return result;
    } catch (error) {
      logger.error('Failed to post hacktoberfest data:', { data, error });
      throw new Error('Failed to post hacktoberfest data');
    }
  }

  async getHacktoberfestData() {
    if (!this.client) throw new Error('API client not configured');
    try {
      const { data } = await this.client.get('/hacktoberfest');
      return data;
    } catch (error) {
      logger.error('Failed to get hacktoberfest data:', { error });
      throw new Error('Failed to fetch hacktoberfest data');
    }
  }
}

module.exports = new ApiClient();
