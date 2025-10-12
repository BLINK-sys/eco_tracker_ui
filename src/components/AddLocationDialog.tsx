import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LatLng } from "leaflet";
import { Plus, Search, Loader2 } from "lucide-react";
import { createLocation } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import "leaflet/dist/leaflet.css";

// Types for search results
interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

// Kazakhstan cities list
const kazakhstanCities = [
  { name: "Алматы", lat: 43.2775, lng: 76.8958 },
  { name: "Астана", lat: 51.1694, lng: 71.4491 },
  { name: "Шымкент", lat: 42.3417, lng: 69.5901 },
  { name: "Актобе", lat: 50.2839, lng: 57.1670 },
  { name: "Тараз", lat: 42.9000, lng: 71.3667 },
  { name: "Павлодар", lat: 52.2953, lng: 76.9475 },
  { name: "Усть-Каменогорск", lat: 49.9480, lng: 82.6281 },
  { name: "Семей", lat: 50.4111, lng: 80.2275 },
  { name: "Атырау", lat: 47.1167, lng: 51.8833 },
  { name: "Костанай", lat: 53.2144, lng: 63.6246 },
  { name: "Кызылорда", lat: 44.8479, lng: 65.5093 },
  { name: "Уральск", lat: 51.2167, lng: 51.3667 },
  { name: "Петропавловск", lat: 54.8667, lng: 69.1500 },
  { name: "Актау", lat: 43.6486, lng: 51.1601 },
  { name: "Темиртау", lat: 50.0542, lng: 72.9683 },
  { name: "Туркестан", lat: 43.3000, lng: 68.2667 },
  { name: "Кокшетау", lat: 53.2833, lng: 69.3833 },
  { name: "Талдыкорган", lat: 45.0167, lng: 78.3833 },
  { name: "Экибастуз", lat: 51.7167, lng: 75.3167 },
  { name: "Рудный", lat: 52.9667, lng: 63.1167 },
];

// Fix for default markers in react-leaflet
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

interface AddLocationDialogProps {
  onAddLocation: (location: { name: string; lat: number; lng: number; containerCount: number }) => void;
}

const AddLocationDialog: React.FC<AddLocationDialogProps> = ({ onAddLocation }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [containerCount, setContainerCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshLocations } = useAuth();
  const { toast } = useToast();
  const mapRef = useRef<any>(null);
  
  // Search states
  const [selectedCityName, setSelectedCityName] = useState("Астана");
  const [addressQuery, setAddressQuery] = useState("");
  const [addressResults, setAddressResults] = useState<SearchResult[]>([]);
  const [selectedCity, setSelectedCity] = useState<SearchResult | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.1694, 71.4491]);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Fix map size when dialog opens
  useEffect(() => {
    if (open && mapRef.current) {
      setTimeout(() => {
        const map = mapRef.current;
        if (map) {
          map.invalidateSize();
        }
      }, 100);
    }
  }, [open]);

  // Search for addresses in selected city
  const searchAddresses = async (query: string) => {
    if (query.length < 2 || !selectedCityName) {
      setAddressResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', ' + selectedCityName)}&addressdetails=1&limit=5&countrycodes=kz`
      );
      const data = await response.json();
      setAddressResults(data);
    } catch (error) {
      console.error("Error searching addresses:", error);
    }
  };

  // Debounced search functions
  useEffect(() => {
    if (!isReverseGeocoding) {
      const timeoutId = setTimeout(() => searchAddresses(addressQuery), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [addressQuery, selectedCityName, isReverseGeocoding]);

  const handleCitySelect = (cityName: string) => {
    setSelectedCityName(cityName);
    const city = kazakhstanCities.find(c => c.name === cityName);
    if (city) {
      setMapCenter([city.lat, city.lng]);
      if (mapRef.current) {
        mapRef.current.setView([city.lat, city.lng], 12);
      }
    }
    setAddressQuery("");
    setAddressResults([]);
  };

  const handleAddressSelect = (result: SearchResult) => {
    setAddressQuery(result.display_name);
    setAddressResults([]);
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedPosition({ lat, lng });
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 16);
    }
  };

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&countrycodes=kz`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        const city = address.city || address.town || address.village || address.state || "Астана";
        const street = address.road || "";
        const houseNumber = address.house_number || "";
        const fullAddress = `${street}${houseNumber ? " " + houseNumber : ""}`.trim();
        
        // Clear existing results to hide dropdowns
        setAddressResults([]);
        
        // Update city if found in our list
        const foundCity = kazakhstanCities.find(c => c.name === city);
        if (foundCity) {
          setSelectedCityName(foundCity.name);
        }
        
        // Update address field
        if (fullAddress) {
          setAddressQuery(fullAddress);
        }
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    // Clear dropdown results immediately when clicking on map
    setAddressResults([]);
    reverseGeocode(lat, lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !selectedPosition) {
      return;
    }

    setIsLoading(true);

    try {
      const finalAddress = addressQuery || `Координаты: ${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}`;
      
      // Создаём массив контейнеров
      const containers = Array.from({ length: containerCount }, (_, index) => ({
        number: index + 1,
        status: 'empty',
        fill_level: 0
      }));
      
      // Создаём площадку через API с контейнерами
      const response = await createLocation({
        name: name.trim(),
        lat: selectedPosition.lat,
        lng: selectedPosition.lng,
        address: finalAddress,
        company_id: user?.parent_company_id,
        containers: containers, // Передаём контейнеры
      });

      // Для обратной совместимости вызываем callback
      onAddLocation({
        name: name.trim(),
        lat: selectedPosition.lat,
        lng: selectedPosition.lng,
        containerCount,
      });

      // Обновляем список площадок
      await refreshLocations();

      toast({
        title: "Площадка создана",
        description: `Площадка "${name.trim()}" успешно добавлена.`,
      });

      // Reset form
      setName("");
      setSelectedPosition(null);
      setContainerCount(1);
      setSelectedCityName("Астана");
      setAddressQuery("");
      setAddressResults([]);
      setMapCenter([51.1694, 71.4491]);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Ошибка создания площадки",
        description: error instanceof Error ? error.message : "Не удалось создать площадку",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = name.trim() && selectedPosition;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Добавить новую площадку</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Название площадки</Label>
              <Input
                id="name"
                type="text"
                placeholder="Введите название площадки"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="w-48 space-y-2">
              <Label htmlFor="containerCount">Количество контейнеров</Label>
              <Input
                id="containerCount"
                type="number"
                min="1"
                max="20"
                value={containerCount}
                onChange={(e) => setContainerCount(parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          {/* Search Section */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="citySelect">Выбор города</Label>
              <Select value={selectedCityName} onValueChange={handleCitySelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent>
                  {kazakhstanCities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2 relative">
              <Label htmlFor="addressSearch">Поиск адреса</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="addressSearch"
                  type="text"
                  placeholder={selectedCityName ? "Введите адрес" : "Сначала выберите город"}
                  value={addressQuery}
                  onChange={(e) => {
                    setIsReverseGeocoding(false);
                    setAddressQuery(e.target.value);
                  }}
                  disabled={!selectedCityName}
                  className="pl-10"
                />
              </div>
              {!isReverseGeocoding && addressResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {addressResults.map((result) => (
                    <div
                      key={result.place_id}
                      className="p-2 hover:bg-accent cursor-pointer text-sm"
                      onClick={() => handleAddressSelect(result)}
                    >
                      {result.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col space-y-2">
            <Label>Местоположение на карте</Label>
            <p className="text-sm text-muted-foreground">
              Нажмите на карту, чтобы выбрать местоположение
            </p>
            <div className="flex-1 w-full rounded-md border min-h-0">
              <MapContainer
                center={mapCenter}
                zoom={11}
                style={{ height: "100%", width: "100%" }}
                className="rounded-md"
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onLocationSelect={handleLocationSelect} />
                {selectedPosition && (
                  <Marker position={[selectedPosition.lat, selectedPosition.lng]} />
                )}
              </MapContainer>
            </div>
            {selectedPosition && (
              <p className="text-sm text-muted-foreground">
                Выбрано: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
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
                  Создание...
                </>
              ) : (
                'Добавить площадку'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationDialog;