import { useCallback, useRef, useState } from "react";

export function useRequestLock() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLockedRef = useRef(false);

  const withRequestLock = useCallback(
    async <T>(callback: () => Promise<T>): Promise<T | undefined> => {
      if (isLockedRef.current) return;

      isLockedRef.current = true;
      setIsSubmitting(true);

      try {
        return await callback();
      } finally {
        isLockedRef.current = false;
        setIsSubmitting(false);
      }
    },
    []
  );

  return {
    isSubmitting,
    withRequestLock,
  };
}
