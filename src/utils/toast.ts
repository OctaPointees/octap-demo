import { Toast } from "@base-ui/react/toast";
import { ApiError } from "../services/mock/http";

export const toastManager = Toast.createToastManager();

export const notify = {
  success: (title: string, description?: string) =>
    toastManager.add({ title, description, type: "success" }),
  info: (title: string, description?: string) =>
    toastManager.add({ title, description, type: "info" }),
  error: (error: unknown, title = "Something went wrong") =>
    toastManager.add({
      title: error instanceof ApiError ? `${title} (${error.status})` : title,
      description: error instanceof Error ? error.message : String(error),
      type: "error",
      priority: "high",
    }),
};
