import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:5283/api';

export interface LoginRequest {
  Identifiant: string;
  MotDePasse: string;
}

export interface RegisterRequest {
  Nom: string;
  Email: string;
  Telephone: string;
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

class ClientAuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('clientAccessToken');
    this.refreshToken = localStorage.getItem('clientRefreshToken');
    const expiry = localStorage.getItem('clientTokenExpiry');
    this.tokenExpiry = expiry ? new Date(expiry) : null;
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string, expiry: Date): void {
    localStorage.setItem('clientAccessToken', accessToken);
    localStorage.setItem('clientRefreshToken', refreshToken);
    localStorage.setItem('clientTokenExpiry', expiry.toISOString());
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = expiry;
  }

  private clearTokensFromStorage(): void {
    localStorage.removeItem('clientAccessToken');
    localStorage.removeItem('clientRefreshToken');
    localStorage.removeItem('clientTokenExpiry');
    localStorage.removeItem('clientUser');
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${API_BASE_URL}/authentification/register-client`,
        userData
      );

      const authData = response.data;
      const expiry = new Date(authData.tokenExpiry);

      // Save tokens
      this.saveTokensToStorage(authData.accessToken, authData.refreshToken, expiry);

      // Save user data
      const clientUserData = {
        Id: authData.userId,
        Nom: authData.nom,
        Email: authData.email,
        ImagePath: authData.imagePath,
        EstAdmin: authData.estAdmin,
        EstLivreur: authData.estLivreur,
      };
      localStorage.setItem('clientUser', JSON.stringify(clientUserData));

      return authData;
    } catch (error) {
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${API_BASE_URL}/authentification/connexion-client`,
        credentials
      );

      const authData = response.data;
      const expiry = new Date(authData.tokenExpiry);

      // Save tokens
      this.saveTokensToStorage(authData.accessToken, authData.refreshToken, expiry);

      // Save user data
      const clientUserData = {
        Id: authData.userId,
        Nom: authData.nom,
        Email: authData.email,
        ImagePath: authData.imagePath,
        EstAdmin: authData.estAdmin,
        EstLivreur: authData.estLivreur,
      };
      localStorage.setItem('clientUser', JSON.stringify(clientUserData));

      return authData;
    } catch (error) {
      throw error;
    }
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
          }
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
        { refreshToken: this.refreshToken }
      );

      const authData = response.data;
      const expiry = new Date(authData.tokenExpiry);

      this.saveTokensToStorage(authData.accessToken, authData.refreshToken, expiry);

      // Update user data
      const clientUserData = {
        Id: authData.userId,
        Nom: authData.nom,
        Email: authData.email,
        ImagePath: authData.imagePath,
        EstAdmin: authData.estAdmin,
        EstLivreur: authData.estLivreur,
      };
      localStorage.setItem('clientUser', JSON.stringify(clientUserData));

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

  getCurrentUser() {
    const userData = localStorage.getItem('clientUser');
    return userData ? JSON.parse(userData) : null;
  }
}

export const clientAuthService = new ClientAuthService();
