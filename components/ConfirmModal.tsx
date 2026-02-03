"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-midnight/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative book-card p-6 max-w-sm w-full animate-fade-in">
        <h3 className="font-display text-xl text-plum mb-2">{title}</h3>
        <p className="font-body text-midnight-soft text-sm mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="btn-secondary text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`btn-primary text-sm ${
              danger ? "!bg-red-700 hover:!bg-red-800" : ""
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
