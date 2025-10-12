import { apiClient } from './api';

export interface AccessRight {
  id: string;
  user_id: string;
  can_view_monitoring: boolean;
  can_view_notifications: boolean;
  can_view_locations: boolean;
  can_view_reports: boolean;
  can_view_admin: boolean;
  can_manage_users: boolean;
  can_manage_companies: boolean;
  can_view_security: boolean;
  can_manage_notifications: boolean;
  can_create_locations: boolean;
  can_edit_locations: boolean;
  can_delete_locations: boolean;
  can_create_containers: boolean;
  can_edit_containers: boolean;
  can_delete_containers: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  role_id?: string;
  parent_company_id?: string;
  company?: Company;
  role_obj?: Role;
  access_rights?: AccessRight[];
  created_at?: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  parent_company_id?: string;
  role?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface CompanyCreateRequest {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}

class AuthService {
  // Вход в систему
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // Сохраняем токены
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  // Регистрация пользователя
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    // Сохраняем токены
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  // Получение текущего пользователя с полной информацией
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me', true);
    return response;
  }

  // Выход из системы
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Проверка авторизации
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Получение сохраненного пользователя
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Создание компании
  async createCompany(data: CompanyCreateRequest): Promise<{ message: string; company: Company }> {
    return apiClient.post<{ message: string; company: Company }>('/companies', data, true);
  }

  // Получение списка компаний
  async getCompanies(): Promise<Company[]> {
    return apiClient.get<Company[]>('/companies');
  }

  // Получение компании по ID
  async getCompany(id: string): Promise<Company> {
    return apiClient.get<Company>(`/companies/${id}`);
  }

  // Регистрация компании и пользователя
  async registerCompanyAndUser(
    companyData: CompanyCreateRequest,
    userData: Omit<RegisterRequest, 'parent_company_id'>
  ): Promise<{ company: Company; user: User; tokens: { access_token: string; refresh_token: string } }> {
    // Сначала создаем компанию
    const companyResponse = await this.createCompany(companyData);
    
    // Затем регистрируем пользователя с привязкой к компании
    const userResponse = await this.register({
      ...userData,
      parent_company_id: companyResponse.company.id,
      role: 'admin', // Первый пользователь компании - администратор
    });

    return {
      company: companyResponse.company,
      user: userResponse.user,
      tokens: {
        access_token: userResponse.access_token,
        refresh_token: userResponse.refresh_token,
      },
    };
  }
}

export const authService = new AuthService();

