
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLocation, getStatusInfo } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Location } from "@/types";
import LocationIdDialog from "@/components/LocationIdDialog";
import { Hash } from "lucide-react";

const LocationDetailPage = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("containers");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { locations } = useAuth();

  const fetchLocation = async () => {
    if (!id) return;
    
    try {
      const data = await getLocation(id);
      if (data) {
        setLocation(data);
      } else {
        console.error("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, [id]);

  // Автоматическое обновление при изменении данных в AuthContext
  useEffect(() => {
    // Когда locations обновляется через WebSocket, обновляем локальную площадку
    if (id) {
      const updatedLocation = locations.find(loc => loc.id === id);
      if (updatedLocation) {
        setLocation(updatedLocation);
      }
    }
  }, [locations, id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-lg">Загрузка данных...</span>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="mb-2 text-2xl font-bold">Площадка не найдена</h2>
        <p className="mb-4 text-gray-600">
          Запрашиваемая информация о площадке недоступна.
        </p>
        <button
          className="rounded-md bg-primary px-4 py-2 text-white"
          onClick={() => navigate(-1)}
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="mb-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Назад
        </button>
        <h1 className="text-2xl font-bold">{location.name}</h1>
      </div>

      <div className="mb-6 rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-medium">Информация о площадке</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">ID площадки:</p>
            <LocationIdDialog location={location}>
              <Button variant="outline" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                ID площадки
              </Button>
            </LocationIdDialog>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Адрес:</p>
            <p className="text-gray-900">{location.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Последний вывоз:</p>
            <p className="text-gray-900">{location.lastCollection || "Нет данных"}</p>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="containers"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="containers">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"></path>
              <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"></path>
              <path d="M4 12H2"></path>
              <path d="M10 12H8"></path>
              <path d="M16 12h-2"></path>
              <path d="M22 12h-2"></path>
            </svg>
            Контейнеры
          </TabsTrigger>
          <TabsTrigger value="history">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            История вывоза
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h7.5"></path>
              <path d="M16 2v4"></path>
              <path d="M8 2v4"></path>
              <path d="M3 10h18"></path>
              <path d="M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
              <path d="m21 21-1.5-1.5"></path>
            </svg>
            Статистика
          </TabsTrigger>
          <TabsTrigger value="settings">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Настройки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="containers" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {location.containers.map((container) => {
              const statusInfo = getStatusInfo(container.status);
              
              return (
                <div
                  key={container.id}
                  className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`mr-3 flex h-12 w-12 items-center justify-center rounded-full ${statusInfo.bgColor}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-6 w-6 ${statusInfo.textColor}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"></path>
                          <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"></path>
                          <path d="M4 12H2"></path>
                          <path d="M10 12H8"></path>
                          <path d="M16 12h-2"></path>
                          <path d="M22 12h-2"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Контейнер №{container.number}</h3>
                        <p className={`text-sm ${statusInfo.color}`}>
                          {statusInfo.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Информация об уровне заполнения */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Уровень заполнения:</span>
                      <Badge variant="outline">{container.fill_level || 0}%</Badge>
                    </div>
                    
                    {/* Прогресс-бар */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          (container.fill_level || 0) >= 70 ? 'bg-red-500' :
                          (container.fill_level || 0) >= 30 ? 'bg-amber-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${container.fill_level || 0}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Обновляется автоматически от датчиков
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="rounded-lg border bg-white p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4 h-16 w-16 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <p className="text-lg text-gray-500">
                История вывозов будет доступна в следующей версии
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <div className="rounded-lg border bg-white p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4 h-16 w-16 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18"></path>
                <path d="M18 9l-6-6-6 6"></path>
                <path d="M6 9v9"></path>
                <path d="m12 8 0 10"></path>
                <path d="M18 12v6"></path>
              </svg>
              <p className="text-lg text-gray-500">
                Статистика будет доступна в следующей версии
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="rounded-lg border bg-white p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4 h-16 w-16 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <p className="text-lg text-gray-500">
                Настройки будут доступны в следующей версии
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LocationDetailPage;
