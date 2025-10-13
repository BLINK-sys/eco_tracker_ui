import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { createUser, updateUser, getRoles } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  role: string;
  role_obj?: {
    id: string;
    name: string;
  };
  parent_company_id: string;
  company?: {
    id: string;
    name: string;
  };
  access_rights?: Array<{
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
  }>;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface UserDialogProps {
  user?: User;
  onUserSaved: () => void;
  children: React.ReactNode;
}

const UserDialog: React.FC<UserDialogProps> = ({ user, onUserSaved, children }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(user?.role_obj?.id || "");
  const [roles, setRoles] = useState<Role[]>([]);
  const [accessRights, setAccessRights] = useState({
    can_view_monitoring: false,
    can_view_notifications: false,
    can_view_locations: false,
    can_view_reports: false,
    can_view_admin: false,
    can_manage_users: false,
    can_manage_companies: false,
    can_view_security: false,
    can_manage_notifications: false,
    can_create_locations: false,
    can_edit_locations: false,
    can_delete_locations: false,
    can_create_containers: false,
    can_edit_containers: false,
    can_delete_containers: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // Загрузка ролей при открытии диалога
  useEffect(() => {
    const loadRoles = async () => {
      if (open) {
        setIsLoadingRoles(true);
        try {
          const response = await getRoles();
          setRoles(response.roles);
        } catch (error) {
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить роли",
            variant: "destructive",
          });
        } finally {
          setIsLoadingRoles(false);
        }
      }
    };

    loadRoles();
  }, [open, toast]);

  // Сброс формы при открытии диалога
  useEffect(() => {
    if (open) {
      setEmail(user?.email || "");
      setPassword("");
      setRoleId(user?.role_obj?.id || "");
      
      // Инициализация прав доступа
      if (user?.access_rights?.[0]) {
        setAccessRights(user.access_rights[0]);
      } else {
        // По умолчанию для новых пользователей - полные права
        setAccessRights({
          can_view_monitoring: true,
          can_view_notifications: true,
          can_view_locations: true,
          can_view_reports: true,
          can_view_admin: true,
          can_manage_users: true,
          can_manage_companies: true,
          can_view_security: true,
          can_manage_notifications: true,
          can_create_locations: true,
          can_edit_locations: true,
          can_delete_locations: true,
          can_create_containers: true,
          can_edit_containers: true,
          can_delete_containers: true,
        });
      }
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || (!user && !password.trim()) || !roleId) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const userData = {
        email: email.trim(),
        ...(password && { password }),
        role: roleId,
        access_rights: accessRights,
        // parent_company_id будет установлен автоматически на сервере
      };

      if (user) {
        // Обновление существующего пользователя
        await updateUser(user.id, userData);
        toast({
          title: "Пользователь обновлен",
          description: `Пользователь "${email}" успешно обновлен.`,
        });
      } else {
        // Создание нового пользователя
        await createUser(userData);
        toast({
          title: "Пользователь создан",
          description: `Пользователь "${email}" успешно создан.`,
        });
      }

      onUserSaved();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сохранить пользователя",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() && (user || password.trim()) && roleId;

  const handleAccessRightChange = (right: keyof typeof accessRights, checked: boolean) => {
    setAccessRights(prev => {
      const newRights = { ...prev, [right]: checked };
      
      // Иерархическая логика: если отключаем родительскую категорию, отключаем все вложенные
      if (right === 'can_view_admin' && !checked) {
        newRights.can_manage_users = false;
        newRights.can_manage_companies = false;
        newRights.can_view_security = false;
        newRights.can_manage_notifications = false;
      }
      
      // Если отключаем управление пользователями, отключаем связанные права
      if (right === 'can_manage_users' && !checked) {
        newRights.can_view_security = false;
      }
      
      return newRights;
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? "Редактировать пользователя" : "Создать пользователя"}
          </DialogTitle>
          <DialogDescription>
            {user ? "Измените информацию о пользователе" : "Добавьте нового пользователя в систему"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка - основная информация */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Основная информация</h3>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Пароль {user ? "" : "*"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={user ? "Оставьте пустым, чтобы не менять" : "Введите пароль"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!user}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Роль *</Label>
                <Select value={roleId} onValueChange={setRoleId} disabled={isLoadingRoles}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingRoles ? "Загрузка ролей..." : "Выберите роль"} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Компания</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser?.company?.name || 'Компания не указана'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Пользователь будет создан в вашей компании
                  </p>
                </div>
              </div>
            </div>

            {/* Правая колонка - права доступа */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Права доступа</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Левая колонка прав доступа */}
                <div className="space-y-4">
                  {/* Основные разделы */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Основные разделы</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_view_monitoring"
                        checked={accessRights.can_view_monitoring}
                        onCheckedChange={(checked) => handleAccessRightChange('can_view_monitoring', checked as boolean)}
                      />
                      <Label htmlFor="can_view_monitoring" className="text-sm">Просмотр мониторинга</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_view_notifications"
                        checked={accessRights.can_view_notifications}
                        onCheckedChange={(checked) => handleAccessRightChange('can_view_notifications', checked as boolean)}
                      />
                      <Label htmlFor="can_view_notifications" className="text-sm">Просмотр уведомлений</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_view_locations"
                        checked={accessRights.can_view_locations}
                        onCheckedChange={(checked) => handleAccessRightChange('can_view_locations', checked as boolean)}
                      />
                      <Label htmlFor="can_view_locations" className="text-sm">Просмотр площадок</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_view_reports"
                        checked={accessRights.can_view_reports}
                        onCheckedChange={(checked) => handleAccessRightChange('can_view_reports', checked as boolean)}
                      />
                      <Label htmlFor="can_view_reports" className="text-sm">Просмотр отчетов</Label>
                    </div>
                  </div>

                  {/* Администрирование */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Администрирование</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_view_admin"
                        checked={accessRights.can_view_admin}
                        onCheckedChange={(checked) => handleAccessRightChange('can_view_admin', checked as boolean)}
                      />
                      <Label htmlFor="can_view_admin" className="text-sm font-medium">Доступ к администрированию</Label>
                    </div>
                    
                    <div className="ml-6 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="can_manage_users"
                          checked={accessRights.can_manage_users}
                          onCheckedChange={(checked) => handleAccessRightChange('can_manage_users', checked as boolean)}
                          disabled={!accessRights.can_view_admin}
                        />
                        <Label htmlFor="can_manage_users" className="text-sm text-gray-600">Управление пользователями</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="can_manage_companies"
                          checked={accessRights.can_manage_companies}
                          onCheckedChange={(checked) => handleAccessRightChange('can_manage_companies', checked as boolean)}
                          disabled={!accessRights.can_view_admin}
                        />
                        <Label htmlFor="can_manage_companies" className="text-sm text-gray-600">Управление компаниями</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="can_view_security"
                          checked={accessRights.can_view_security}
                          onCheckedChange={(checked) => handleAccessRightChange('can_view_security', checked as boolean)}
                          disabled={!accessRights.can_view_admin || !accessRights.can_manage_users}
                        />
                        <Label htmlFor="can_view_security" className="text-sm text-gray-600">Просмотр безопасности</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="can_manage_notifications"
                          checked={accessRights.can_manage_notifications}
                          onCheckedChange={(checked) => handleAccessRightChange('can_manage_notifications', checked as boolean)}
                          disabled={!accessRights.can_view_admin}
                        />
                        <Label htmlFor="can_manage_notifications" className="text-sm text-gray-600">Управление уведомлениями</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Правая колонка прав доступа */}
                <div className="space-y-4">
                  {/* Управление площадками */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Управление площадками</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_create_locations"
                        checked={accessRights.can_create_locations}
                        onCheckedChange={(checked) => handleAccessRightChange('can_create_locations', checked as boolean)}
                      />
                      <Label htmlFor="can_create_locations" className="text-sm">Создание площадок</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_edit_locations"
                        checked={accessRights.can_edit_locations}
                        onCheckedChange={(checked) => handleAccessRightChange('can_edit_locations', checked as boolean)}
                      />
                      <Label htmlFor="can_edit_locations" className="text-sm">Редактирование площадок</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_delete_locations"
                        checked={accessRights.can_delete_locations}
                        onCheckedChange={(checked) => handleAccessRightChange('can_delete_locations', checked as boolean)}
                      />
                      <Label htmlFor="can_delete_locations" className="text-sm">Удаление площадок</Label>
                    </div>
                  </div>

                  {/* Управление контейнерами */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Управление контейнерами</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_create_containers"
                        checked={accessRights.can_create_containers}
                        onCheckedChange={(checked) => handleAccessRightChange('can_create_containers', checked as boolean)}
                      />
                      <Label htmlFor="can_create_containers" className="text-sm">Создание контейнеров</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_edit_containers"
                        checked={accessRights.can_edit_containers}
                        onCheckedChange={(checked) => handleAccessRightChange('can_edit_containers', checked as boolean)}
                      />
                      <Label htmlFor="can_edit_containers" className="text-sm">Редактирование контейнеров</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_delete_containers"
                        checked={accessRights.can_delete_containers}
                        onCheckedChange={(checked) => handleAccessRightChange('can_delete_containers', checked as boolean)}
                      />
                      <Label htmlFor="can_delete_containers" className="text-sm">Удаление контейнеров</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                user ? 'Сохранить изменения' : 'Создать пользователя'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
