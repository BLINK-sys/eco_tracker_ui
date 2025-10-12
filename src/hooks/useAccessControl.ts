import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

interface AccessRights {
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

interface UseAccessControlReturn {
  hasAccess: (permission: keyof AccessRights) => boolean;
  hasAnyAccess: (permissions: (keyof AccessRights)[]) => boolean;
  hasAllAccess: (permissions: (keyof AccessRights)[]) => boolean;
  isLoading: boolean;
  accessRights: AccessRights | null;
}

export const useAccessControl = (): UseAccessControlReturn => {
  const { currentUser } = useAuth();
  const [accessRights, setAccessRights] = useState<AccessRights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAccessRights = async () => {
      if (!currentUser?.access_rights) {
        setAccessRights(null);
        setIsLoading(false);
        return;
      }

      try {
        // Если у пользователя есть права доступа, используем их
        const rights = currentUser.access_rights[0]; // Берем первый элемент массива
        setAccessRights(rights);
      } catch (error) {
        console.error('Ошибка загрузки прав доступа:', error);
        setAccessRights(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccessRights();
  }, [currentUser]);

  const hasAccess = (permission: keyof AccessRights): boolean => {
    // Администратор всегда имеет доступ ко всему
    if (currentUser?.role === 'Администратор') {
      return true;
    }

    // Если нет прав доступа, проверяем роль по умолчанию
    if (!accessRights) {
      return currentUser?.role === 'Владелец';
    }

    return accessRights[permission] === true;
  };

  const hasAnyAccess = (permissions: (keyof AccessRights)[]): boolean => {
    return permissions.some(permission => hasAccess(permission));
  };

  const hasAllAccess = (permissions: (keyof AccessRights)[]): boolean => {
    return permissions.every(permission => hasAccess(permission));
  };

  return {
    hasAccess,
    hasAnyAccess,
    hasAllAccess,
    isLoading,
    accessRights
  };
};
