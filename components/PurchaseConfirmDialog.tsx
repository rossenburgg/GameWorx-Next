// components/PurchaseConfirmDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PurchaseConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: {
    name: string;
    description: string;
    price: number;
    image_url: string;
  };
}

export function PurchaseConfirmDialog({ isOpen, onClose, onConfirm, item }: PurchaseConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            Are you sure you want to purchase this item? Purchases are non-refundable.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <img src={item.image_url} alt={item.name} className="col-span-4 w-full h-48 object-cover rounded-md" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Item:</span>
            <span className="col-span-3">{item.name}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Description:</span>
            <span className="col-span-3">{item.description}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-bold">Price:</span>
            <span className="col-span-3">{item.price} Xcoin</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm Purchase</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}