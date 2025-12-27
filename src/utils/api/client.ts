// API Client for communicating with backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      console.log(`API Request: ${options.method || 'GET'} ${this.baseUrl}${endpoint}`);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      console.log(`API Response [${response.status}]:`, data);

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        console.error(`API Timeout [${endpoint}]: Request took longer than 10 seconds`);
        return {
          success: false,
          error: 'Request timeout - Backend server may not be running on port 3010',
        };
      }

      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  }

  // Profile endpoints
  async getProfile(userId: string) {
    return this.request<any>(`/api/profiles/${userId}`);
  }

  async createProfile(profileData: any) {
    return this.request<any>('/api/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateProfile(userId: string, updates: any) {
    return this.request<any>(`/api/profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async upsertProfile(profileData: any) {
    return this.request<any>('/api/profiles/upsert', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  // Stats endpoints
  async getStats(userId: string) {
    return this.request<any>(`/api/stats/${userId}`);
  }

  async updateStats(userId: string, stats: any) {
    return this.request<any>(`/api/stats/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(stats),
    });
  }

  // Purchase endpoints
  async getPurchases(userId: string) {
    return this.request<any[]>(`/api/purchases/${userId}`);
  }

  async checkPurchase(userId: string, yearNodeId: string) {
    return this.request<{ hasPurchased: boolean }>(
      `/api/purchases/${userId}/check/${yearNodeId}`
    );
  }

  async createPurchase(purchaseData: any) {
    return this.request<any>('/api/purchases', {
      method: 'POST',
      body: JSON.stringify(purchaseData),
    });
  }

  // Hierarchy endpoints
  async getHierarchy() {
    return this.request<any[]>('/api/hierarchy');
  }

  async getNode(nodeId: string) {
    return this.request<any>(`/api/hierarchy/${nodeId}`);
  }

  async findYearNode(degree: string, year: string) {
    return this.request<any>(
      `/api/hierarchy/find/year?degree=${encodeURIComponent(degree)}&year=${encodeURIComponent(year)}`
    );
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
