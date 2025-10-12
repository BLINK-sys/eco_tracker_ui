import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Check } from "lucide-react";

interface LocationIdDialogProps {
  location: {
    id: string;
    name: string;
    containers: Array<{
      id: string;
      number: number;
      status: string;
    }>;
  };
  children: React.ReactNode;
}

const LocationIdDialog: React.FC<LocationIdDialogProps> = ({ location, children }) => {
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIds(prev => new Set(prev).add(id));
      setTimeout(() => {
        setCopiedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadAsTxt = () => {
    const content = [
      `=== ИНФОРМАЦИЯ О ПЛОЩАДКЕ ===`,
      `ID площадки: ${location.id}`,
      `Название площадки: ${location.name}`,
      ``,
      `=== КОНТЕЙНЕРЫ ===`,
      ...location.containers.map((container, index) => 
        `${index + 1}. ID: ${container.id} | Номер: ${container.number} | Статус: ${container.status}`
      ),
      ``,
      `Дата создания отчёта: ${new Date().toLocaleString('ru-RU')}`,
      `Всего контейнеров: ${location.containers.length}`
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `location_${location.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto min-w-[800px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ID площадки и контейнеров</DialogTitle>
          <DialogDescription>
            Информация о площадке и всех связанных контейнерах
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Левая колонка - Информация о площадке */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              📍 Площадка
            </h3>
            
            {/* Карточка с названием */}
            <div className="bg-white rounded-lg border shadow-md p-4">
              <p className="text-sm text-gray-600 mb-2">Название</p>
              <p className="font-medium text-lg">{location.name}</p>
            </div>
            
            {/* Карточка с ID */}
            <div className="bg-white rounded-lg border shadow-md p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 mb-2">ID площадки</p>
                  <p className="font-mono text-sm whitespace-nowrap overflow-hidden text-ellipsis">{location.id}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(location.id, 'location')}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  {copiedIds.has('location') ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copiedIds.has('location') ? 'Скопировано' : 'Копировать'}
                </Button>
              </div>
            </div>
          </div>

          {/* Правая колонка - Информация о контейнерах */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              🗂️ Контейнеры ({location.containers.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {location.containers.map((container, index) => (
                <div key={container.id} className="bg-white rounded-lg border shadow-md p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                        {container.number}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-600 mb-1">ID контейнера</p>
                        <p className="font-mono text-sm whitespace-nowrap overflow-hidden text-ellipsis">{container.id}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(container.id, container.id)}
                      className="flex items-center gap-2 flex-shrink-0"
                    >
                      {copiedIds.has(container.id) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedIds.has(container.id) ? 'Скопировано' : 'Копировать'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Кнопка скачивания внизу по центру */}
        <div className="flex justify-center pt-6 border-t mt-6">
          <Button
            onClick={downloadAsTxt}
            className="flex items-center gap-2"
            size="lg"
          >
            <Download className="h-5 w-5" />
            Скачать все данные (TXT)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationIdDialog;
