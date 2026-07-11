import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { DefaultPending } from "./components/DefaultPending";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Realtime subscriptions in __root.tsx auto-invalidate on any DB change,
        // so we can safely serve cached reads for a minute and skip window-focus
        // refetches. Admin dashboards override with staleTime: 0 where needed.
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });


  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Skeleton fallback for any route without its own pendingComponent
    defaultPendingComponent: DefaultPending,
    defaultPendingMs: 150,
    defaultPendingMinMs: 400,
  });

  return router;
};
