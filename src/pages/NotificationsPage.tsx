import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusInfo } from "@/services/dataService";
import { MapPin, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";

const NotificationsPage = () => {
  const { locations } = useAuth();
  const navigate = useNavigate();
  const [previousStatuses, setPreviousStatuses] = useState<Map<string, string>>(new Map());

  // Группируем площадки по статусам
  const fullLocations = locations.filter(loc => loc.status === 'full');
  const partialLocations = locations.filter(loc => loc.status === 'partial');
  const emptyLocations = locations.filter(loc => loc.status === 'empty');

  // Отслеживаем изменения статусов для анимации
  useEffect(() => {
    const newStatuses = new Map<string, string>();
    locations.forEach(loc => {
      newStatuses.set(loc.id, loc.status);
    });
    setPreviousStatuses(newStatuses);
  }, [locations]);

  const handleLocationClick = (id: string) => {
    navigate(`/dashboard/locations/${id}`);
  };

  // Компонент карточки площадки с анимацией
  const LocationCard = ({ location, showPulse = false }: { location: any; showPulse?: boolean }) => {
    const statusInfo = getStatusInfo(location.status);
    const previousStatus = previousStatuses.get(location.id);
    const hasStatusChanged = previousStatus && previousStatus !== location.status;
    
    return (
      <motion.div
        layoutId={`location-${location.id}`}
        layout
        initial={false}
        whileHover={{ scale: 1.02 }}
        animate={{ 
          scale: hasStatusChanged ? 1.03 : 1
        }}
        transition={{
          layout: { 
            duration: 0.7,
            ease: [0.4, 0.0, 0.2, 1],
            type: "spring",
            stiffness: 300,
            damping: 30
          },
          scale: { duration: 0.3 }
        }}
        style={{
          position: 'relative',
          zIndex: hasStatusChanged ? 10 : 'auto'
        }}
      >
        <motion.div
          animate={{
            boxShadow: hasStatusChanged 
              ? "0 8px 25px -5px rgba(0, 0, 0, 0.3)" 
              : "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
          }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Card 
            className={`hover:shadow-xl cursor-pointer relative h-full border-2 transition-colors ${
              hasStatusChanged ? 'border-blue-500 bg-blue-50/50' : ''
            }`}
            onClick={() => handleLocationClick(location.id)}
          >
          {showPulse && (
            <div className="absolute top-3 right-3 z-10">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
          )}
          
          {hasStatusChanged && (
            <motion.div 
              className="absolute top-3 left-3 z-10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <Badge variant="secondary" className="bg-blue-500 text-white text-xs animate-pulse shadow-lg">
                Обновлено
              </Badge>
            </motion.div>
          )}
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{location.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{location.address}</span>
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Статус:</span>
                <Badge 
                  variant="secondary"
                  className={`${statusInfo.bgColor} ${statusInfo.textColor} text-xs`}
                >
                  <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${statusInfo.dotColor}`}></span>
                  {statusInfo.label}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Контейнеров:</span>
                <span className="font-medium">{location.containers.length}</span>
              </div>
              
              {location.lastCollection && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Последний вывоз:</span>
                  <span className="text-muted-foreground">{location.lastCollection}</span>
                </div>
              )}
            </div>
            
            <Button 
              size="sm"
              variant="outline" 
              className="w-full mt-3"
              onClick={(e) => {
                e.stopPropagation();
                handleLocationClick(location.id);
              }}
            >
              Подробнее
            </Button>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>
    );
  };


  return (
    <div className="h-full flex flex-col">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Уведомления</h1>
        <p className="text-muted-foreground mt-2">
          Обзор статуса всех площадок компании в реальном времени
        </p>
      </div>

      {locations.length === 0 ? (
        <Card className="flex-1">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Площадок пока нет</p>
          </CardContent>
        </Card>
      ) : (
        <LayoutGroup>
          <Card className="flex-1 shadow-lg overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Заголовки колонок в одной строке */}
              <div className="flex border-b">
                <div className="flex-1 bg-red-500 text-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Требуют внимания</h2>
                      <p className="text-sm opacity-90">{fullLocations.length} площадок</p>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 ml-auto">
                      {fullLocations.length}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 bg-amber-500 text-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Частично заполненные</h2>
                      <p className="text-sm opacity-90">{partialLocations.length} площадок</p>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 ml-auto">
                      {partialLocations.length}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 bg-green-500 text-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Пустые площадки</h2>
                      <p className="text-sm opacity-90">{emptyLocations.length} площадок</p>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 ml-auto">
                      {emptyLocations.length}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Область карточек - без разделений */}
              <div className="flex-1 bg-background p-4 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full relative">
                  {/* Колонка 1: Требуют внимания */}
                  <div className="flex flex-col space-y-3">
                    {fullLocations.map((location) => (
                      <LocationCard 
                        key={location.id} 
                        location={location} 
                        showPulse={true}
                      />
                    ))}
                    {fullLocations.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <p className="text-sm">Площадок нет</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Колонка 2: Частично заполненные */}
                  <div className="flex flex-col space-y-3">
                    {partialLocations.map((location) => (
                      <LocationCard 
                        key={location.id} 
                        location={location} 
                        showPulse={false}
                      />
                    ))}
                    {partialLocations.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <p className="text-sm">Площадок нет</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Колонка 3: Пустые */}
                  <div className="flex flex-col space-y-3">
                    {emptyLocations.map((location) => (
                      <LocationCard 
                        key={location.id} 
                        location={location} 
                        showPulse={false}
                      />
                    ))}
                    {emptyLocations.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <p className="text-sm">Площадок нет</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </LayoutGroup>
      )}
    </div>
  );
};

export default NotificationsPage;

