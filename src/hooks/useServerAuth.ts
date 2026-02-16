import { useAuth } from '@/src/contexts/AuthContext';
import { useState, useEffect } from 'react';

export function useServerAuth() {
  const { user, loading, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Check for authentication errors
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setError('Authentication required. Please login to continue.');
    } else {
      setError(null);
    }
  }, [loading, isAuthenticated]);

  return {
    user,
    loading,
    error,
  };
}
