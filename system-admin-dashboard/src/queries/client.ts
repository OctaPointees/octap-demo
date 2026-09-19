import { MutationCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "../services/mock/http";
import { sessionStore } from "../services/session";

export const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
    },
  },
  mutationCache: new MutationCache({
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) sessionStore.set(null);
    },
    // Every write may affect dashboards/audit, so refresh anything visible.
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  }),
});

sessionStore.subscribe(() => {
  if (!sessionStore.get()) queryClient.clear();
});
