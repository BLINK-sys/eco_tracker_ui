
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Users } from "lucide-react";
import { getCompanyUsers, deleteUser } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import UserDialog from "@/components/UserDialog";
import DeleteUserDialog from "@/components/DeleteUserDialog";
import AccessControl from "@/components/AccessControl";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    user: any | null;
  }>({ isOpen: false, user: null });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // Загрузка пользователей
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getCompanyUsers();
      setUsers(response.users);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список пользователей",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем пользователей при переходе на вкладку
  useEffect(() => {
    if (activeTab === "users") {
      loadUsers();
    }
  }, [activeTab]);

  // Фильтрация пользователей
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.company?.name && user.company.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Обработчики для удаления пользователя
  const handleDeleteUser = (user: any) => {
    setDeleteDialog({ isOpen: true, user });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.user) return;

    setIsDeleting(true);
    try {
      await deleteUser(deleteDialog.user.id);
      await loadUsers();
      toast({
        title: "Пользователь удален",
        description: `Пользователь "${deleteDialog.user.email}" успешно удален.`,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить пользователя",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ isOpen: false, user: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ isOpen: false, user: null });
  };

  return (
    <div className="h-full">
      <h1 className="mb-4 text-2xl font-bold">Панель администрирования</h1>
      
      <Tabs
        defaultValue="general"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <AccessControl permission="can_view_admin">
            <TabsTrigger value="general">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10h10V2z"></path><path d="M22 2h-8v4h8V2z"></path><path d="M22 10h-8v4h8v-4z"></path><path d="M22 18h-8v4h8v-4z"></path><path d="M2 16h10v6H2v-6z"></path></svg>
              Основные
            </TabsTrigger>
          </AccessControl>
          <AccessControl permission="can_manage_users">
            <TabsTrigger value="users">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Пользователи
            </TabsTrigger>
          </AccessControl>
          <AccessControl permission="can_view_security">
            <TabsTrigger value="security">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
              Безопасность
            </TabsTrigger>
          </AccessControl>
          <AccessControl permission="can_manage_notifications">
            <TabsTrigger value="notifications">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              Уведомления
            </TabsTrigger>
          </AccessControl>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Основные настройки</h2>
            <p className="mb-8 text-gray-600">
              Управление основными параметрами системы и настройками интерфейса
            </p>

            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                <p className="text-lg">Раздел находится в разработке</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <AccessControl permission="can_manage_users">
          <TabsContent value="users" className="mt-6">
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Управление пользователями</h2>
                <p className="text-gray-600 mt-1">
                  Управление учетными записями пользователей, правами доступа и ролями
                </p>
              </div>
              <UserDialog onUserSaved={loadUsers}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить пользователя
                </Button>
              </UserDialog>
            </div>

            {/* Поиск */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Поиск по email, роли или компании..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Список пользователей */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Загрузка пользователей...</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <div className="text-center">
                  <Users className="mx-auto mb-4 h-16 w-16" />
                  <p className="text-lg">
                    {searchQuery ? "Пользователи не найдены" : "Пользователи не найдены"}
                  </p>
                  <p className="text-sm mt-2">
                    {searchQuery ? "Попробуйте изменить поисковый запрос" : "Добавьте первого пользователя"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{user.email}</CardTitle>
                        <Badge 
                          variant={user.role === 'owner' ? 'default' : 'secondary'}
                          className={user.role === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                        >
                          {user.role === 'owner' ? 'Владелец' : user.role === 'operator' ? 'Оператор' : user.role}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {user.company && (
                          <div>
                            <p className="text-sm text-gray-600">Компания:</p>
                            <p className="font-medium">{user.company.name}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600">Создан:</p>
                          <p className="text-sm">
                            {new Date(user.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-4">
                        <UserDialog user={user} onUserSaved={loadUsers}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </UserDialog>
                        {user.id !== currentUser?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          </TabsContent>
        </AccessControl>
        
        <AccessControl permission="can_view_security">
          <TabsContent value="security" className="mt-6">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Настройки безопасности</h2>
            <p className="mb-8 text-gray-600">
              Управление параметрами безопасности, двухфакторной аутентификацией и журналом доступа
            </p>

            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                <p className="text-lg">Раздел находится в разработке</p>
              </div>
            </div>
          </div>
          </TabsContent>
        </AccessControl>

        <AccessControl permission="can_manage_notifications">
          <TabsContent value="notifications" className="mt-6">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Настройки уведомлений</h2>
            <p className="mb-8 text-gray-600">
              Настройка системных уведомлений, оповещений и интеграций
            </p>

            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                <p className="text-lg">Раздел находится в разработке</p>
              </div>
            </div>
          </div>
          </TabsContent>
        </AccessControl>
      </Tabs>

      {/* Диалог подтверждения удаления пользователя */}
      <DeleteUserDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        userEmail={deleteDialog.user?.email || ''}
        userRole={deleteDialog.user?.role || ''}
      />
    </div>
  );
};

export default AdminPage;
