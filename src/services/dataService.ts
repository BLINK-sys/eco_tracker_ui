import { Location, ReportFilters, ReportSummary } from "@/types";
import { apiClient } from "./api";

// Получение всех площадок (с опциональной фильтрацией по компании)
export const getLocations = async (companyId?: string): Promise<Location[]> => {
  const endpoint = companyId 
    ? `/locations?company_id=${companyId}` 
    : '/locations';
  return apiClient.get<Location[]>(endpoint);
};

// Получение конкретной площадки
export const getLocation = async (id: string): Promise<Location> => {
  return apiClient.get<Location>(`/locations/${id}`);
};

// Создание новой площадки
export const createLocation = async (data: Partial<Location>): Promise<{ message: string; location: Location }> => {
  return apiClient.post<{ message: string; location: Location }>('/locations', data, true);
};

// Обновление площадки
export const updateLocation = async (id: string, data: Partial<Location>): Promise<{ message: string; location: Location }> => {
  return apiClient.put<{ message: string; location: Location }>(`/locations/${id}`, data, true);
};

// Удаление площадки
export const deleteLocation = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/locations/${id}`, true);
};

// Регистрация сбора мусора
export const collectWaste = async (locationId: string, notes?: string): Promise<any> => {
  return apiClient.post(`/locations/${locationId}/collect`, { notes }, true);
};

// === Контейнеры ===

// Обновление статуса контейнера
export const updateContainer = async (
  containerId: string, 
  data: { status?: string; fill_level?: number }
): Promise<{ message: string; container: any; location_status: string }> => {
  return apiClient.put<{ message: string; container: any; location_status: string }>(
    `/containers/${containerId}`, 
    data, 
    true
  );
};

// Создание контейнера
export const createContainer = async (data: {
  location_id: string;
  number: number;
  status?: string;
  fill_level?: number;
}): Promise<{ message: string; container: any }> => {
  return apiClient.post<{ message: string; container: any }>('/containers', data, true);
};

// Удаление контейнера
export const deleteContainer = async (containerId: string): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/containers/${containerId}`, true);
};

export const getStatusInfo = (status: string) => {
  switch (status) {
    case "empty":
      return {
        label: "Пустой",
        color: "text-status-empty",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        dotColor: "bg-status-empty",
      };
    case "partial":
      return {
        label: "Частично заполнен",
        color: "text-status-partial",
        bgColor: "bg-amber-100",
        textColor: "text-amber-800",
        dotColor: "bg-status-partial",
      };
    case "full":
      return {
        label: "Заполнен",
        color: "text-status-full",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        dotColor: "bg-status-full",
      };
    default:
      return {
        label: "Неизвестно",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        dotColor: "bg-gray-500",
      };
  }
};

export const getStatusColorClass = (status: string): string => {
  switch (status) {
    case "empty":
      return "bg-status-empty";
    case "partial":
      return "bg-status-partial";
    case "full":
      return "bg-status-full";
    default:
      return "bg-gray-500";
  }
};

export const getReportSummary = (
  filters: ReportFilters
): Promise<ReportSummary> => {
  // Mock data for the report summary
  const summary: ReportSummary = {
    totalCollections: 42,
    averageFillRate: 68,
    fullContainers: 15,
    emptyContainers: 27,
  };

  return Promise.resolve(summary);
};

// === USER MANAGEMENT ===

// Получение списка пользователей
export const getUsers = async (): Promise<{ users: any[] }> => {
  return apiClient.get<{ users: any[] }>('/users', true);
};

// Получение пользователей компании
export const getCompanyUsers = async (): Promise<{ users: any[] }> => {
  return apiClient.get<{ users: any[] }>('/users/company', true);
};

// Получение пользователя по ID
export const getUser = async (id: string): Promise<any> => {
  return apiClient.get<any>(`/users/${id}`, true);
};

// Создание пользователя
export const createUser = async (data: {
  email: string;
  password: string;
  role?: string;
  parent_company_id?: string;
}): Promise<{ message: string; user: any }> => {
  return apiClient.post<{ message: string; user: any }>('/users', data, true);
};

// Обновление пользователя
export const updateUser = async (id: string, data: {
  email?: string;
  password?: string;
  role?: string;
  parent_company_id?: string;
}): Promise<{ message: string; user: any }> => {
  return apiClient.put<{ message: string; user: any }>(`/users/${id}`, data, true);
};

// Удаление пользователя
export const deleteUser = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/users/${id}`, true);
};

// Получение списка ролей
export const getRoles = async (): Promise<{ roles: any[] }> => {
  return apiClient.get<{ roles: any[] }>('/roles', true);
};

