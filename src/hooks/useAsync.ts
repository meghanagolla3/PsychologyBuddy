import { useState, useCallback } from 'react';

export const useAsync = <T extends any[], R>(
  asyncFunction: (...args: T) => Promise<R>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: T): Promise<R> => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await asyncFunction(...args);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  return {
    execute,
    loading,
    error,
  };
};
