import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:5283/api';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await authService.getValidToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor to handle token expiration
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await authService.refreshAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            await authService.logout();
            window.location.href = '/';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  // For file uploads
  async postFormData<T = unknown>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const apiClient = new ApiClient();
