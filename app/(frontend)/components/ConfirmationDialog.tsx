"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
}

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  cancelButtonText = "Batal",
  confirmButtonText = "Konfirmasi",
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-left">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4 py-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <DialogDescription className="text-base text-foreground">{description}</DialogDescription>
        </div>
        <DialogFooter className="flex sm:justify-between gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1 w-full sm:flex-initial rounded-full"
          >
            {cancelButtonText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={"destructive"}
            className="flex-1 w-full sm:flex-initial rounded-full"
          >
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
