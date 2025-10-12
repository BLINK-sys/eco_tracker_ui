import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/authService';
import { getLocations } from '@/services/dataService';
import { socketService } from '@/services/socketService';
import { Location } from '@/types';

interface AuthContextType {
  user: User | null;
  currentUser: User | null; // Дополнительное поле для совместимости с useAccessControl
  locations: Location[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshLocations: () => Promise<void>;
  notificationCount: number;
}

/**
 * АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ СТАТУСОВ - КАК ЭТО РАБОТАЕТ:
 * 
 * 1. Backend автоматически пересчитывает статус площадки:
 *    - При изменении контейнера: PUT /api/containers/:id
 *    - Backend вызывает location.update_status()
 *    - Статус площадки обновляется в БД
 * 
 * 2. Frontend обновляет данные:
 *    - После изменения вызываем refreshLocations()
 *    - Загружаются свежие данные из БД
 *    - AuthContext обновляет locations[]
 * 
 * 3. Автоматическое обновление UI:
 *    - Все компоненты используют useAuth()
 *    - При изменении locations[] → React перерисовывает
 *    - Badge уведомлений пересчитывается автоматически
 *    - Карточки на странице NotificationsPage обновляются
 * 
 * ПРИМЕР ПОТОКА:
 * updateContainer(id, {fill_level: 100}) 
 *   → Backend: container.status = 'full'
 *   → Backend: location.update_status() → location.status = 'full'
 *   → Frontend: refreshLocations()
 *   → AuthContext: setLocations(новые данные)
 *   → React: перерисовка всех компонентов
 *   → Badge: notificationCount обновляется автоматически
 */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Обработчик обновления контейнера через WebSocket
  const handleContainerUpdate = React.useCallback((data: any) => {
    console.log('🔄 [CONTEXT] Получено обновление контейнера:', data);
    console.log('   Container ID:', data.container?.id);
    console.log('   Location ID:', data.location?.id);
    console.log('   New fill_level:', data.container?.fill_level);
    console.log('   New status:', data.container?.status);
    
    setLocations(prevLocations => {
      console.log('   Current locations count:', prevLocations.length);
      
      const updated = prevLocations.map(location => {
        if (location.id === data.location.id) {
          console.log('   ✅ Found matching location:', location.name);
          
          // Обновляем контейнер в списке
          const updatedContainers = location.containers.map(container => 
            container.id === data.container.id 
              ? { ...container, ...data.container }
              : container
          );
          
          console.log('   Updated containers count:', updatedContainers.length);
          
          // Обновляем статус площадки
          return {
            ...location,
            containers: updatedContainers,
            status: data.location.status
          };
        }
        return location;
      });
      
      return updated;
    });
  }, []);

  // Обработчик обновления площадки через WebSocket
  const handleLocationUpdate = React.useCallback((data: Location) => {
    console.log('🔄 [CONTEXT] Получено обновление площадки:', data);
    
    setLocations(prevLocations => 
      prevLocations.map(location => 
        location.id === data.id ? { ...location, ...data } : location
      )
    );
  }, []);

  // Загрузка площадок компании
  const loadLocations = async (companyId?: string) => {
    try {
      if (companyId) {
        const data = await getLocations(companyId);
        setLocations(data);
        
        // Подключаемся к WebSocket для real-time обновлений
        socketService.connect(companyId);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки площадок:', error);
      setLocations([]);
    }
  };

  // Инициализация: проверка сохраненного пользователя
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const isAuth = authService.isAuthenticated();
        if (isAuth) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            // Загружаем площадки компании
            await loadLocations(storedUser.parent_company_id);
          }
        }
      } catch (error) {
        console.error('Ошибка инициализации:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Подписка на WebSocket события
    socketService.on('container_updated', handleContainerUpdate);
    socketService.on('location_updated', handleLocationUpdate);

    // Cleanup при размонтировании
    return () => {
      socketService.off('container_updated', handleContainerUpdate);
      socketService.off('location_updated', handleLocationUpdate);
      socketService.disconnect();
    };
  }, []);

  // Вход
  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    
    // Загружаем полную информацию о пользователе с правами доступа
    try {
      const fullUserInfo = await authService.getCurrentUser();
      setUser(fullUserInfo);
    } catch (error) {
      console.error('Ошибка загрузки полной информации о пользователе:', error);
      setUser(response.user);
    }
    
    // Загружаем площадки компании после входа
    if (response.user.parent_company_id) {
      await loadLocations(response.user.parent_company_id);
    }
  };

  // Выход
  const logout = () => {
    authService.logout();
    setUser(null);
    setLocations([]);
  };

  // Обновление площадок
  const refreshLocations = async () => {
    if (user?.parent_company_id) {
      await loadLocations(user.parent_company_id);
    }
  };

  // Подсчёт уведомлений (площадки со статусом full)
  const notificationCount = locations.filter(loc => loc.status === 'full').length;

  const value: AuthContextType = {
    user,
    currentUser: user, // Дублируем для совместимости
    locations,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshLocations,
    notificationCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

