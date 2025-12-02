import { useCallback, useEffect, useState } from "react";
import type { SpottersLogCategory, SpottersLogEntry } from "../types/spottersLog";

const API_ENDPOINTS: Record<SpottersLogCategory, string> = {
  airplanes: "https://api.demiffy.com:8543/planesdata",
  cars: "https://api.demiffy.com:8543/carsdata",
};

type HookState = {
  entries: SpottersLogEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  addEntry: (payload: SpottersLogEntry) => Promise<void>;
  updateEntry: (id: string, payload: SpottersLogEntry) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
};

export function useSpottersLog(category: SpottersLogCategory): HookState {
  const [entries, setEntries] = useState<SpottersLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(
    (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      fetch(API_ENDPOINTS[category], { cache: "no-store", signal })
        .then(async (response) => {
          if (!response.ok) throw new Error("Remote API request failed");
          return (await response.json()) as SpottersLogEntry[];
        })
        .then((payload) => {
          if (!signal?.aborted) setEntries(Array.isArray(payload) ? payload : []);
        })
        .catch((err: Error) => {
          if (err.name === "AbortError") return;
          setError(err.message);
          if (!signal?.aborted) setEntries([]);
        })
        .finally(() => {
          if (!signal?.aborted) setIsLoading(false);
        });
    },
    [category],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadEntries(controller.signal);
    return () => controller.abort();
  }, [loadEntries]);

  const refresh = useCallback(() => loadEntries(), [loadEntries]);

  const addEntry = useCallback(
    async (payload: SpottersLogEntry) => {
      try {
        await fetch(API_ENDPOINTS[category], {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        refresh();
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [category, refresh],
  );

  const removeEntry = useCallback(
    async (id: string) => {
      try {
        await fetch(`${API_ENDPOINTS[category]}/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        refresh();
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [category, refresh],
  );

  const updateEntry = useCallback(
    async (id: string, payload: SpottersLogEntry) => {
      try {
        await fetch(`${API_ENDPOINTS[category]}/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        refresh();
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [category, refresh],
  );

  return {
    entries,
    isLoading,
    error,
    refresh,
    addEntry,
    updateEntry,
    removeEntry,
  };
}
