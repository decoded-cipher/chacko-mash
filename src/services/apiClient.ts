import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { UserData, HacktoberfestData, ApiResponse } from '../types';

class ApiClient {
  private client?: AxiosInstance;

  constructor() {
    if (!process.env.API_BASE_URL || !process.env.INOVUS_AUTH_TOKEN) {
      console.warn('API configuration missing. API functionality will be disabled.');
      return;
    }

    this.client = axios.create({
      baseURL: process.env.API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${process.env.INOVUS_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async getExtUserData(id: string): Promise<UserData> {
    try {
      if (!this.client) {
        throw new Error('API client not configured');
      }
      const response: AxiosResponse<UserData> = await this.client.get('/user/ext', {
        params: { id }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get user data:', { id, error });
      throw new Error(`Failed to fetch user data for ID: ${id}`);
    }
  }

  async getBdayUser(day: number, month: number): Promise<UserData[]> {
    try {
      if (!this.client) {
        throw new Error('API client not configured');
      }
      const response: AxiosResponse<UserData[]> = await this.client.get('/bday', {
        params: { dd: day, mm: month }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get birthday users:', { day, month, error });
      throw new Error(`Failed to fetch birthday users for ${day}/${month}`);
    }
  }

  async postHacktoberfestData(data: HacktoberfestData): Promise<ApiResponse> {
    try {
      if (!this.client) {
        throw new Error('API client not configured');
      }
      const response: AxiosResponse<ApiResponse> = await this.client.post('/hacktoberfest', data);
      return response.data;
    } catch (error) {
      console.error('Failed to post hacktoberfest data:', { data, error });
      throw new Error('Failed to post hacktoberfest data');
    }
  }

  async getHacktoberfestData(): Promise<HacktoberfestData[]> {
    try {
      if (!this.client) {
        throw new Error('API client not configured');
      }
      const response: AxiosResponse<HacktoberfestData[]> = await this.client.get('/hacktoberfest');
      return response.data;
    } catch (error) {
      console.error('Failed to get hacktoberfest data:', { error });
      throw new Error('Failed to fetch hacktoberfest data');
    }
  }
}

export default new ApiClient(); 