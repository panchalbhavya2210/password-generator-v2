"use client";

import { ReactNode, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 60 * 12, // 12 hours (important)
            gcTime: 1000 * 60 * 60 * 24, // keep cache 24h
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const persister = createSyncStoragePersister({
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    key: "RQ-NSE-CACHE",
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hour persistent cache
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
