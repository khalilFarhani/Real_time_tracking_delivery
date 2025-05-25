// API Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface AxiosErrorResponse {
  response?: {
    data?: ApiError | string;
    status?: number;
  };
  message?: string;
}

// User Data types
export interface UserData {
  Id: number;
  Nom: string;
  Email: string;
  ImagePath?: string;
  EstAdmin: boolean;
  EstLivreur: boolean;
  Permissions?: PermissionInfo[];
}

export interface PermissionInfo {
  permissionName: string;
  description?: string;
}

// HTTP Request/Response types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, unknown>;
}

// Generic API Response wrapper
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// Form data types
export interface FormDataRequest {
  [key: string]: string | number | boolean | File | null | undefined;
}
