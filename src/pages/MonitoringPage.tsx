
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getStatusInfo } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React Leaflet
// Using a type assertion to avoid TypeScript error
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
});

const createContainerIcon = (color, opacity = 1) => {
  const containerSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" opacity="${opacity}">
      <!-- Container body -->
      <rect x="6" y="10" width="16" height="14" rx="1" fill="${color}" stroke="white" stroke-width="1.5"/>
      <!-- Container lid -->
      <rect x="4" y="8" width="20" height="3" rx="1.5" fill="${color}" stroke="white" stroke-width="1"/>
      <!-- Handle -->
      <rect x="11" y="6" width="6" height="2" rx="1" fill="${color}" stroke="white" stroke-width="1"/>
      <!-- Vertical lines on container -->
      <line x1="10" y1="12" x2="10" y2="22" stroke="white" stroke-width="1" opacity="0.7"/>
      <line x1="14" y1="12" x2="14" y2="22" stroke="white" stroke-width="1" opacity="0.7"/>
      <line x1="18" y1="12" x2="18" y2="22" stroke="white" stroke-width="1" opacity="0.7"/>
      <!-- Small circle for texture -->
      <circle cx="14" cy="17" r="1" fill="white" opacity="0.3"/>
    </svg>
  `;
  
  return L.divIcon({
    className: "custom-container-marker",
    html: `<div style="background: rgba(255,255,255,0.9); border-radius: 6px; padding: 1px; box-shadow: 0 2px 8px rgba(0,0,0,0.25); border: 1px solid rgba(0,0,0,0.1);">${containerSvg}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Компонент для автоматического центрирования карты на выбранную точку
const MapCenterController = ({ selectedLocation, locations, getMapCenter }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      // Плавно перемещаем карту к выбранной точке с анимацией
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 16, {
        duration: 1.5, // Длительность анимации в секундах
        easeLinearity: 0.25
      });
    } else if (locations.length > 0) {
      // Если точка не выбрана, возвращаемся к общему центру
      const center = getMapCenter();
      const zoom = locations.length <= 2 ? 14 : 13;
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [selectedLocation, locations, getMapCenter, map]);

  return null;
};

const MonitoringPage = () => {
  const { locations, isLoading: loading } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Обработка URL параметров для автоматического выделения точки (как при выборе из выпадающего списка)
  useEffect(() => {
    const locationIdFromUrl = searchParams.get('selectedLocation');
    const addressFromUrl = searchParams.get('selectedAddress');
    
    if ((locationIdFromUrl || addressFromUrl) && locations.length > 0) {
      let locationToSelect = null;
      
      // Сначала пытаемся найти по ID
      if (locationIdFromUrl) {
        locationToSelect = locations.find(loc => loc.id === locationIdFromUrl);
      }
      
      // Если не найден по ID, ищем по адресу (как в выпадающем списке)
      if (!locationToSelect && addressFromUrl) {
        locationToSelect = locations.find(loc => loc.address === decodeURIComponent(addressFromUrl));
      }
      
      if (locationToSelect) {
        // Имитируем выбор из выпадающего списка
        setSelectedAddress(locationToSelect.address);
        setSearchQuery(""); // Очищаем поиск, как в handleAddressSelect
        setSelectedLocation(locationToSelect);
        
        // Удаляем параметры из URL после обработки
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('selectedLocation');
        newSearchParams.delete('selectedAddress');
        navigate(`/dashboard/monitoring?${newSearchParams.toString()}`, { replace: true });
      }
    }
  }, [locations, searchParams, navigate]);

  // Обновляем выбранную локацию при изменении данных
  useEffect(() => {
    if (selectedLocation) {
      const updatedLocation = locations.find(loc => loc.id === selectedLocation.id);
      if (updatedLocation) {
        setSelectedLocation(updatedLocation);
      }
    }
  }, [locations, selectedLocation?.id]);

  // Вычисляем центр карты на основе города с наибольшим количеством точек
  const getMapCenter = (): [number, number] => {
    if (locations.length === 0) {
      return [51.1272, 71.4279]; // Астана по умолчанию
    }
    
    // Группируем локации по городам используя координаты
    // Астана: lat ~51.1, lng ~71.4
    // Алматы: lat ~43.2, lng ~76.9
    const cityGroups: { [city: string]: typeof locations } = {};
    
    locations.forEach(location => {
      let cityKey = '';
      
      // Определяем город по координатам
      if (location.lat > 50 && location.lat < 52 && location.lng > 70 && location.lng < 73) {
        cityKey = 'Астана';
      } else if (location.lat > 42 && location.lat < 44 && location.lng > 75 && location.lng < 78) {
        cityKey = 'Алматы';
      } else {
        // Для других городов используем приблизительные координаты как ключ
        cityKey = `${Math.round(location.lat * 10) / 10}, ${Math.round(location.lng * 10) / 10}`;
      }
      
      if (!cityGroups[cityKey]) {
        cityGroups[cityKey] = [];
      }
      cityGroups[cityKey].push(location);
    });
    
    // Находим город с наибольшим количеством точек
    let cityWithMostLocations = '';
    let maxLocationsCount = 0;
    
    Object.entries(cityGroups).forEach(([city, cityLocations]) => {
      console.log(`🏙️ Город: ${city}, точек: ${cityLocations.length}`);
      if (cityLocations.length > maxLocationsCount) {
        maxLocationsCount = cityLocations.length;
        cityWithMostLocations = city;
      }
    });
    
    console.log(`🎯 Выбран город: ${cityWithMostLocations} с ${maxLocationsCount} точками`);
    
    // Вычисляем центр для города с наибольшим количеством точек
    const cityLocations = cityGroups[cityWithMostLocations];
    if (cityLocations && cityLocations.length > 0) {
      const avgLat = cityLocations.reduce((sum, loc) => sum + loc.lat, 0) / cityLocations.length;
      const avgLng = cityLocations.reduce((sum, loc) => sum + loc.lng, 0) / cityLocations.length;
      return [avgLat, avgLng];
    }
    
    // Fallback: если что-то пошло не так, используем общий центр всех точек
    const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
    return [avgLat, avgLng];
  };

  // Filter locations based on search query or selected address
  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSelected = selectedAddress === "" || location.address === selectedAddress;
    
    // If both search and dropdown are empty, show all
    if (!searchQuery && !selectedAddress) return true;
    
    // If only search is used, filter by search
    if (searchQuery && !selectedAddress) return matchesSearch;
    
    // If only dropdown is used, filter by selected address
    if (!searchQuery && selectedAddress) return matchesSelected;
    
    // If both are used, show results that match either
    return matchesSearch || matchesSelected;
  });

  const getMarkerIcon = (status, isHighlighted = false) => {
    let color;
    switch (status) {
      case "empty":
        color = "#10B981"; // Green
        break;
      case "partial":
        color = "#F59E0B"; // Yellow/Orange
        break;
      case "full":
        color = "#EF4444"; // Red
        break;
      default:
        color = "#6B7280"; // Gray
    }

    // If search or dropdown is active and this location is not highlighted, make it dimmed
    const hasActiveFilter = searchQuery || selectedAddress;
    const opacity = hasActiveFilter && !isHighlighted ? 0.4 : 1;
    
    return createContainerIcon(color, opacity);
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  const handleViewDetails = (id) => {
    navigate(`/dashboard/locations/${id}`);
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "empty":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "full":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCloseDetails = () => {
    setSelectedLocation(null);
    // Сбрасываем выпадающий список и поиск
    setSelectedAddress("");
    setSearchQuery("");
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    // Clear search when selecting from dropdown
    setSearchQuery("");
    
    // Find and select the location to show details popup
    const location = locations.find(loc => loc.address === address);
    if (location) {
      setSelectedLocation(location);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Clear dropdown selection when typing in search
    if (e.target.value) {
      setSelectedAddress("");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search and update controls positioned above the map */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          {/* Dropdown with existing addresses */}
          <Select value={selectedAddress} onValueChange={handleAddressSelect}>
            <SelectTrigger className="w-80">
              <SelectValue placeholder="Выберите адрес площадки" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.address}>
                  {location.name} - {location.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* OR text */}
          <span className="text-gray-500 font-medium">ИЛИ</span>
          
          {/* Search input */}
          <Input
            type="text"
            placeholder="Поиск по адресу..."
            className="flex-1"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      {/* Map container */}
      <div className="relative flex-1 rounded-lg border overflow-hidden">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-lg">Загрузка карты...</span>
          </div>
        ) : locations.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center flex-col gap-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-700">Площадок пока нет</h3>
              <p className="text-gray-500 mt-2">Добавьте первую площадку в разделе "Управление точками"</p>
            </div>
          </div>
        ) : (
          <>
            <MapContainer
              center={getMapCenter()}
              zoom={locations.length <= 2 ? 14 : 13}
              className="h-full w-full"
              attributionControl={false}
            >
              <TileLayer
                attribution=''
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Компонент для автоматического центрирования на выбранной точке */}
              <MapCenterController 
                selectedLocation={selectedLocation} 
                locations={locations}
                getMapCenter={getMapCenter}
              />
              
              {locations.map((location) => {
                const isHighlighted = (searchQuery === "" && selectedAddress === "") || 
                  filteredLocations.some(filtered => filtered.id === location.id) ||
                  (selectedAddress && location.address === selectedAddress);
                
                return (
                  <Marker
                    key={location.id}
                    position={[location.lat, location.lng]}
                    icon={getMarkerIcon(location.status, isHighlighted)}
                    eventHandlers={{
                      click: () => handleLocationClick(location),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                      <div className="p-1">
                        <h3 className="font-bold">{location.name}</h3>
                        <p className="text-xs text-gray-600">{location.address}</p>
                      </div>
                    </Tooltip>
                  </Marker>
                );
              })}
            </MapContainer>
            
            {/* Location details overlay */}
            {selectedLocation && (
              <div className="absolute top-4 right-4 w-96 max-w-[calc(100%-2rem)] z-[1000]">
                <Card className="shadow-lg">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <CardTitle>{selectedLocation.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="h-6 w-6 p-0" 
                      onClick={handleCloseDetails}
                    >
                      <span className="sr-only">Close</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Текущий статус</h3>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusBadgeClasses(selectedLocation.status)} inline-flex items-center gap-1 w-fit`}
                      >
                        <div className={`h-2 w-2 rounded-full ${selectedLocation.status === 'full' ? 'bg-red-500 animate-pulse' : selectedLocation.status === 'partial' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        {getStatusInfo(selectedLocation.status).label}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">Контейнеры</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Всего:</span>
                          <span className="ml-1 font-medium">{selectedLocation.containers.length}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Заполнены:</span>
                          <span className="ml-1 font-medium">
                            {selectedLocation.containers.filter(c => c.status === 'full').length}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleViewDetails(selectedLocation.id)}
                      className="w-full"
                    >
                      Подробнее
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MonitoringPage;