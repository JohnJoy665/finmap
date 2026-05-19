import { useState } from "react";

export function useRequestLock() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function withRequestLock<T>(
    callback: () => Promise<T>
  ): Promise<T | undefined> {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      return await callback();
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, withRequestLock };
}
