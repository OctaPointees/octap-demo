import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { ToasterProvider } from "../components/shared/Toaster";
import { queryClient } from "../queries/client";
import { router } from "./router";

export default function OctaPAppEntryPoint() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToasterProvider>
        <RouterProvider router={router} />
      </ToasterProvider>
    </QueryClientProvider>
  );
}
