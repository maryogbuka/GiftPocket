// hooks/useAuth.js
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth(required = true) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (required && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [required, isLoading, isAuthenticated, router]);

  return {
    user: session?.user,
    isLoading,
    isAuthenticated,
    session,
  };
}