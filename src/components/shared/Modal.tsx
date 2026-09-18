import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "phosphor-react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";

const backdrop =
  "fixed inset-0 z-50 bg-black/40 transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0";
const popup =
  "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-3rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-box bg-base-100 shadow-2xl outline-none transition-[scale,opacity] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

const SIZES = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

export function Modal({ open, onOpenChange, title, description, children, footer, size = "md" }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => onOpenChange(o)}>
      <Dialog.Portal>
        <Dialog.Backdrop className={backdrop} />
        <Dialog.Popup className={cn(popup, SIZES[size])}>
          <div className="flex items-start justify-between gap-4 border-b border-base-300 p-5">
            <div>
              <Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>
              {description && <Dialog.Description className="mt-1 text-sm opacity-70">{description}</Dialog.Description>}
            </div>
            <Dialog.Close className="btn btn-ghost btn-sm btn-square" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
          {footer && <div className="flex justify-end gap-2 border-t border-base-300 p-4">{footer}</div>}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type ConfirmProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  confirmLabel?: string;
  tone?: "primary" | "error" | "warning";
  loading?: boolean;
  onConfirm: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", tone = "primary", loading, onConfirm, children }: ConfirmProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => onOpenChange(o)}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={backdrop} />
        <AlertDialog.Popup className={cn(popup, "max-w-md gap-4 p-5")}>
          <AlertDialog.Title className="text-lg font-bold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="text-sm opacity-75">{description}</AlertDialog.Description>
          {children}
          <div className="flex justify-end gap-2">
            <AlertDialog.Close className="btn btn-ghost">Cancel</AlertDialog.Close>
            <Button
              className={cn(tone === "error" ? "btn-error" : tone === "warning" ? "btn-warning" : "btn-primary")}
              disabled={loading}
              onClick={onConfirm}
            >
              {loading && <span className="loading loading-spinner loading-sm" />}
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
