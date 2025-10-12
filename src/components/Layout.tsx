import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MapPin, BarChart3, Settings, LogOut, Container, Recycle, Building2, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { SocketStatus } from "@/components/SocketStatus";
import AccessControl from "@/components/AccessControl";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "На карте",
    url: "/dashboard",
    icon: MapPin,
    permission: "can_view_monitoring",
  },
  {
    title: "Уведомления",
    url: "/dashboard/notifications",
    icon: Bell,
    hasBadge: true,
    permission: "can_view_notifications",
  },
  {
    title: "Управление точками", 
    url: "/dashboard/locations",
    icon: Container,
    permission: "can_view_locations",
  },
  {
    title: "Отчётность",
    url: "/dashboard/reports", 
    icon: BarChart3,
    permission: "can_view_reports",
  },
  {
    title: "Администрирование",
    url: "/dashboard/admin",
    icon: Settings,
    permission: "can_view_admin",
  },
];

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, locations, logout, notificationCount } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Подсчёт уведомлений автоматически берётся из AuthContext
  const hasNotifications = notificationCount > 0;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard" || currentPath === "/dashboard/monitoring";
    }
    return currentPath.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-center border-b px-4">
          {collapsed ? (
            <Recycle className="h-6 w-6 text-green-600" />
          ) : (
            <h2 className="text-xl font-semibold text-gray-800">EcoTracker</h2>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <AccessControl key={item.title} permission={item.permission}>
                  <SidebarMenuItem>
                    <NavLink
                    to={item.url}
                    end={item.url === "/dashboard"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center text-sm font-medium rounded-md transition-colors w-full relative",
                        // When collapsed, center icons and only change icon color
                        collapsed
                          ? isActive
                            ? "text-green-600 justify-center py-2"
                            : "text-gray-700 hover:text-green-600 justify-center py-2"
                          : // When expanded, use background highlighting with gap and padding
                          isActive
                            ? "bg-green-600 text-white gap-3 px-3 py-2"
                            : "text-gray-700 hover:bg-green-100 hover:text-green-700 gap-3 px-3 py-2"
                      )
                    }
                  >
                    <div className="relative">
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.hasBadge && hasNotifications && collapsed && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <span className="flex items-center gap-2 flex-1">
                        {item.title}
                        {item.hasBadge && hasNotifications && (
                          <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-[10px] font-semibold">
                            {notificationCount > 9 ? '9+' : notificationCount}
                          </Badge>
                        )}
                      </span>
                    )}
                    </NavLink>
                  </SidebarMenuItem>
                </AccessControl>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t bg-muted/30">
        {!collapsed && user && (
          <div className="p-3 space-y-2">
            {/* Информация о компании */}
            {user.company && (
              <div className="flex items-start gap-2 text-xs">
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{user.company.name}</p>
                  <p className="text-muted-foreground truncate">{locations.length} площадок</p>
                </div>
              </div>
            )}
            
            {/* Информация о пользователе */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user.email}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </Badge>
              </div>
            </div>
          </div>
        )}
        
        {/* Кнопка выхода */}
        <div className={cn("p-2", collapsed && "p-1")}>
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center rounded-md py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors",
              collapsed ? "justify-center px-0" : "gap-3 px-3"
            )}
            title="Выйти"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Выход</span>}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

const Layout = () => {
  const [pageTitle, setPageTitle] = useState("");
  const location = useLocation();

  useEffect(() => {
    // Set page title based on current route
    switch (location.pathname) {
      case "/dashboard":
      case "/dashboard/monitoring":
        setPageTitle("На карте");
        break;
      case "/dashboard/locations":
        setPageTitle("Управление точками");
        break;
      case "/dashboard/notifications":
        setPageTitle("Уведомления");
        break;
      case "/dashboard/reports":
        setPageTitle("Отчётность");
        break;
      case "/dashboard/admin":
        setPageTitle("Администрирование");
        break;
      default:
        if (location.pathname.startsWith('/dashboard/locations/')) {
          setPageTitle("Детали точки");
        } else {
          setPageTitle("");
        }
    }
  }, [location.pathname]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset>
          {/* Top Bar */}
          <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-8 w-8" />
              {pageTitle && (
                <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
              )}
            </div>
            <SocketStatus />
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto bg-white p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;