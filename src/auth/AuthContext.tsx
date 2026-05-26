import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { createBackofficeEmailSession, fetchCurrentBackofficeUser } from '../api/auth';
import { clearTokens, hasStoredTokens } from '../lib/tokenStorage';
import { unauthorizedEventName } from '../lib/apiClient';
import type { BackofficeUser } from '../types/api';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: BackofficeUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [user, setUser] = useState<BackofficeUser | null>(null);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const currentUser = await fetchCurrentBackofficeUser();

    if (currentUser.role !== 'ADMIN') {
      throw new Error('ADMIN 권한이 있는 계정만 접근할 수 있습니다.');
    }

    setUser(currentUser);
    setStatus('authenticated');
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setStatus('checking');

      try {
        await createBackofficeEmailSession(email, password);
        await loadCurrentUser();
      } catch (error) {
        clearTokens();
        setUser(null);
        setStatus('unauthenticated');
        throw error;
      }
    },
    [loadCurrentUser],
  );

  useEffect(() => {
    if (!hasStoredTokens()) {
      setStatus('unauthenticated');
      return;
    }

    loadCurrentUser().catch(() => {
      logout();
    });
  }, [loadCurrentUser, logout]);

  useEffect(() => {
    window.addEventListener(unauthorizedEventName, logout);

    return () => {
      window.removeEventListener(unauthorizedEventName, logout);
    };
  }, [logout]);

  const value = useMemo(
    () => ({
      status,
      user,
      login,
      logout,
    }),
    [status, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.');
  }

  return context;
}
