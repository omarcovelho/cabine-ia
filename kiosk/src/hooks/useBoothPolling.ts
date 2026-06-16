import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchBooth } from '../api/boothClient';
import type { BoothSnapshot } from '../types/booth';

const POLL_INTERVAL_MS = 1000;
const STARTUP_ERROR_AFTER_FAILURES = 15;

export function useBoothPolling() {
  const [snapshot, setSnapshot] = useState<BoothSnapshot | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const hasLoadedRef = useRef(false);
  const startupFailuresRef = useRef(0);

  const handleSuccess = useCallback((data: BoothSnapshot) => {
    setSnapshot(data);
    setError(null);
    hasLoadedRef.current = true;
    startupFailuresRef.current = 0;
  }, []);

  const handleFailure = useCallback((e: unknown) => {
    const err = e instanceof Error ? e : new Error(String(e));

    if (hasLoadedRef.current) {
      setError(err);
      return;
    }

    startupFailuresRef.current += 1;
    if (startupFailuresRef.current >= STARTUP_ERROR_AFTER_FAILURES) {
      setError(err);
    }
  }, []);

  const refetch = useCallback(async () => {
    try {
      const data = await fetchBooth();
      handleSuccess(data);
    } catch (e) {
      handleFailure(e);
    }
  }, [handleFailure, handleSuccess]);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await fetchBooth();
        if (!cancelled) {
          handleSuccess(data);
        }
      } catch (e) {
        if (!cancelled) {
          handleFailure(e);
        }
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [handleFailure, handleSuccess]);

  return { snapshot, error, refetch };
}
