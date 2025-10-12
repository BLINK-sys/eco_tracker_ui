
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStatusInfo, deleteLocation } from "@/services/dataService";
import { useAuth } from "@/contexts/AuthContext";
import AddLocationDialog from "@/components/AddLocationDialog";
import EditLocationDialog from "@/components/EditLocationDialog";
import DeleteLocationDialog from "@/components/DeleteLocationDialog";
import AccessControl from "@/components/AccessControl";

const LocationsPage = () => {
  const { locations, isLoading: loading, user, refreshLocations } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    location: any | null;
  }>({ isOpen: false, location: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewLocation = (id: string) => {
    navigate(`/dashboard/locations/${id}`);
  };

  const handleViewOnMap = (location: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Переходим на страницу карты с параметрами для выделения точки
    // Передаем как ID площадки, так и адрес для точного соответствия с выпадающим списком
    navigate(`/dashboard/monitoring?selectedLocation=${location.id}&selectedAddress=${encodeURIComponent(location.address)}`);
  };

  const handleEditLocation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Edit functionality is now handled by the EditLocationDialog component
  };

  const handleDeleteLocation = (location: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, location });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.location) return;

    setIsDeleting(true);
    try {
      await deleteLocation(deleteDialog.location.id);
      await refreshLocations();
      console.log("Location deleted:", deleteDialog.location.id);
    } catch (error) {
      console.error("Error deleting location:", error);
      // Здесь можно показать toast с ошибкой
      alert('Ошибка при удалении площадки. Попробуйте снова.');
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ isOpen: false, location: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ isOpen: false, location: null });
  };

  // Function to get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&countrycodes=kz`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        const street = address.road || "";
        const houseNumber = address.house_number || "";
        const city = address.city || address.town || address.village || address.state || "Астана";
        
        if (street) {
          return `${street}${houseNumber ? " " + houseNumber : ""}, ${city}`;
        } else {
          return city;
        }
      }
      
      return `Координаты: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error("Error getting address:", error);
      return `Координаты: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const handleAddLocation = async (newLocation: { name: string; lat: number; lng: number; containerCount: number }) => {
    // Get actual address from coordinates
    const address = await getAddressFromCoordinates(newLocation.lat, newLocation.lng);
    
    // Generate containers for the new location
    const containers = Array.from({ length: newLocation.containerCount }, (_, index) => ({
      id: `${Date.now()}-${index}`,
      number: index + 1,
      status: 'empty' as const,
    }));

    // Create new location object
    const location: Location = {
      id: Date.now().toString(),
      name: newLocation.name,
      address,
      lat: newLocation.lat,
      lng: newLocation.lng,
      containers,
      status: 'empty' as const,
    };

    // Add to locations list
    setLocations(prev => [...prev, location]);
    console.log("Added new location:", location);
  };

  const handleUpdateLocation = async (updatedLocation: { id: string; name: string; lat: number; lng: number; containerCount: number; address: string }) => {
    setLocations(prev => prev.map(location => {
      if (location.id === updatedLocation.id) {
        // Update containers if count changed
        let containers = location.containers;
        if (containers.length !== updatedLocation.containerCount) {
          if (updatedLocation.containerCount > containers.length) {
            // Add new containers
            const newContainers = Array.from(
              { length: updatedLocation.containerCount - containers.length }, 
              (_, index) => ({
                id: `${Date.now()}-${containers.length + index}`,
                number: containers.length + index + 1,
                status: 'empty' as const,
              })
            );
            containers = [...containers, ...newContainers];
          } else {
            // Remove excess containers
            containers = containers.slice(0, updatedLocation.containerCount);
          }
        }

        return {
          ...location,
          name: updatedLocation.name,
          address: updatedLocation.address,
          lat: updatedLocation.lat,
          lng: updatedLocation.lng,
          containers,
        };
      }
      return location;
    }));
    console.log("Updated location:", updatedLocation);
  };

  return (
    <div className="h-full">
      <h1 className="mb-4 text-2xl font-bold">Управление точками</h1>
      
      <div className="mb-4 flex items-center justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Поиск по адресу..."
            className="w-full rounded-md border border-gray-300 px-4 py-2 pr-10 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>
        
        <div className="ml-4 flex">
          <AccessControl permission="can_create_locations">
            <AddLocationDialog onAddLocation={handleAddLocation} />
          </AccessControl>
        </div>
      </div>
      
      <div className="overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Название
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Адрес
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Контейнеры
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Статус
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Загрузка...
                  </td>
                </tr>
              ) : filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Площадки не найдены
                  </td>
                </tr>
              ) : (
                filteredLocations.map((location) => {
                  const statusInfo = getStatusInfo(location.status);
                  return (
                    <tr
                      key={location.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleViewLocation(location.id)}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {location.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {location.address}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {location.containers.length}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                          <span className={`mr-1 h-2 w-2 rounded-full ${statusInfo.dotColor}`}></span>
                          {statusInfo.label}
                        </span>
                      </td>
                       <td className="whitespace-nowrap px-6 py-4 text-left text-sm font-medium">
                         <div className="flex items-center gap-1">
                           <button 
                             onClick={(e) => handleViewOnMap(location, e)}
                             className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                             title="Показать на карте"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M21 12a9 9 0 1 1-9 9 9.75 9.75 0 0 1 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>
                           </button>
                           
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               handleViewLocation(location.id);
                             }}
                             className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                             title="Просмотр"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                           </button>
                           
                           <AccessControl permission="can_edit_locations">
                             <div onClick={(e) => e.stopPropagation()}>
                               <EditLocationDialog 
                                 location={location} 
                                 onUpdateLocation={handleUpdateLocation}
                               >
                                 <button 
                                   className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                   title="Редактировать"
                                 >
                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                                 </button>
                               </EditLocationDialog>
                             </div>
                           </AccessControl>
                           
                           <AccessControl permission="can_delete_locations">
                             <button 
                               onClick={(e) => handleDeleteLocation(location, e)}
                               className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                               title="Удалить"
                             >
                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                             </button>
                           </AccessControl>
                         </div>
                       </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Диалог подтверждения удаления */}
      <DeleteLocationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        locationName={deleteDialog.location?.name || ''}
        containerCount={deleteDialog.location?.containers?.length || 0}
      />
    </div>
  );
};

export default LocationsPage;
