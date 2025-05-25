import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:5283/api';

export interface LoginRequest {
  Identifiant: string;
  MotDePasse: string;
}

export interface AuthResponse {
  message: string;
  userId: number;
  nom: string;
  email: string;
  imagePath?: string;
  estAdmin: boolean;
  estLivreur: boolean;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: string;
  permissions?: PermissionInfo[];
}

export interface PermissionInfo {
  permissionName: string;
  description?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    const expiry = localStorage.getItem('tokenExpiry');
    this.tokenExpiry = expiry ? new Date(expiry) : null;
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string, expiry: Date): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('tokenExpiry', expiry.toISOString());
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = expiry;
  }

  private clearTokensFromStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await axios.post(
      `${API_BASE_URL}/authentification/connexion`,
      credentials,
    );

    const authData = response.data;
    const expiry = new Date(authData.tokenExpiry);

    // Save tokens
    this.saveTokensToStorage(authData.accessToken, authData.refreshToken, expiry);

    // Save user data
    const userData = {
      Id: authData.userId,
      Nom: authData.nom,
      Email: authData.email,
      ImagePath: authData.imagePath,
      EstAdmin: authData.estAdmin,
      EstLivreur: authData.estLivreur,
      Permissions: authData.permissions,
    };
    localStorage.setItem('user', JSON.stringify(userData));

    return authData;
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await axios.post(
          `${API_BASE_URL}/authentification/deconnexion`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          },
        );
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.clearTokensFromStorage();
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      return null;
    }

    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${API_BASE_URL}/authentification/refresh-token`,
        { refreshToken: this.refreshToken },
      );

      const authData = response.data;
      const expiry = new Date(authData.tokenExpiry);

      this.saveTokensToStorage(authData.accessToken, authData.refreshToken, expiry);

      // Update user data
      const userData = {
        Id: authData.userId,
        Nom: authData.nom,
        Email: authData.email,
        ImagePath: authData.imagePath,
        EstAdmin: authData.estAdmin,
        EstLivreur: authData.estLivreur,
        Permissions: authData.permissions,
      };
      localStorage.setItem('user', JSON.stringify(userData));

      return authData.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokensFromStorage();
      return null;
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isTokenExpired(): boolean {
    if (!this.tokenExpiry) {
      return true;
    }
    return new Date() >= this.tokenExpiry;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null && !this.isTokenExpired();
  }

  async getValidToken(): Promise<string | null> {
    if (!this.accessToken) {
      return null;
    }

    if (this.isTokenExpired()) {
      return await this.refreshAccessToken();
    }

    return this.accessToken;
  }
}

export const authService = new AuthService();
