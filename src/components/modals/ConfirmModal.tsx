import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={variant === 'danger' ? "p-2 bg-red-50 rounded-lg text-red-600" : "p-2 bg-amber-50 rounded-lg text-amber-600"}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">{title}</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <p className="text-zinc-600 mb-8">{message}</p>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={onClose} className="flex-1">
                  {cancelText}
                </Button>
                <Button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }} 
                  className={variant === 'danger' ? "flex-1 bg-red-600 hover:bg-red-700" : "flex-1 bg-amber-600 hover:bg-amber-700"}
                >
                  {confirmText}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
