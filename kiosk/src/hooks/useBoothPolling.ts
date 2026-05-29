import { useEffect, useState } from 'react';
import { fetchBooth } from '../api/boothClient';
import type { BoothSnapshot } from '../types/booth';

const POLL_INTERVAL_MS = 1000;

export function useBoothPolling() {
  const [snapshot, setSnapshot] = useState<BoothSnapshot | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await fetchBooth();
        if (!cancelled) {
          setSnapshot(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { snapshot, error };
}
