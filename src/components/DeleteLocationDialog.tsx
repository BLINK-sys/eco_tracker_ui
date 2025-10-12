import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  locationName: string;
  containerCount: number;
}

const DeleteLocationDialog: React.FC<DeleteLocationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  locationName,
  containerCount,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удаление площадки</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Вы действительно хотите удалить площадку <strong>"{locationName}"</strong>?
            </p>
            <p>
              Это действие также удалит все связанные контейнеры ({containerCount} шт.) и не может быть отменено.
            </p>
            <p className="text-red-600 font-medium">
              ⚠️ Внимание: Это действие необратимо!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Удалить площадку
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteLocationDialog;
