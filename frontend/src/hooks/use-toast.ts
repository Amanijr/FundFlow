import { toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "success" | "destructive" | "warning" | "info";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

function toast({ title, description, variant = "default", duration }: ToastOptions) {
  const options = { description, duration };

  switch (variant) {
    case "success":
      return sonnerToast.success(title, options);
    case "destructive":
      return sonnerToast.error(title, options);
    case "warning":
      return sonnerToast.warning(title, options);
    case "info":
      return sonnerToast.info(title, options);
    default:
      return sonnerToast(title, options);
  }
}

export { toast };
export type { ToastOptions, ToastVariant };
