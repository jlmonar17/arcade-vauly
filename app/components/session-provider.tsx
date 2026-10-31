"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface User {
  name: string;
}

interface SessionContextValue {
  user: User | null;
  login: (name: string) => void;
  logout: () => void;
}

const USER_KEY = "av_user";

const SessionContext = createContext<SessionContextValue | null>(null);

function normalizeName(name: string): string {
  return name.trim().toUpperCase().slice(0, 10) || "PLAYER1";
}

export function SessionProvider({ children }: { children: ReactNode }) {
  // Estado inicial null: el servidor y el primer render del cliente coinciden.
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<User>;
        if (typeof parsed.name === "string" && parsed.name) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura de localStorage tras montar, evita desajustes de hidratación
          setUser({ name: parsed.name });
        }
      }
    } catch {
      // localStorage no disponible o JSON inválido: se queda como invitado.
    }
  }, []);

  const login = useCallback((name: string) => {
    const next: User = { name: normalizeName(name) };
    setUser(next);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(next));
    } catch {
      // Sin persistencia en modo privado.
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      // Sin persistencia en modo privado.
    }
  }, []);

  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>");
  }
  return ctx;
}
