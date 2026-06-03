import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameMode } from '../types';
import { getUserById } from '../services/api';

interface GameContextValue {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  userId: number | null;
  setUserId: (id: number | null) => void;
  isAdmin: boolean;
  isAdminLoading: boolean;
  refreshCurrentUser: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const useGame = (): GameContextValue => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
};

const STORAGE_MODE_KEY = 'quiz-mode';
const STORAGE_USER_KEY = 'quiz-userId';

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [mode, setModeState] = useState<GameMode>(() => {
    const stored = localStorage.getItem(STORAGE_MODE_KEY);
    return (stored === 'binary' || stored === 'multiple-choice') ? stored : 'binary';
  });

  const [userId, setUserIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_USER_KEY);
    return stored ? Number(stored) : null;
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  const setMode = (newMode: GameMode) => {
    localStorage.setItem(STORAGE_MODE_KEY, newMode);
    setModeState(newMode);
  };

  const setUserId = (id: number | null) => {
    if (id === null) {
      localStorage.removeItem(STORAGE_USER_KEY);
    } else {
      localStorage.setItem(STORAGE_USER_KEY, String(id));
    }
    setUserIdState(id);
  };

  const refreshCurrentUser = async () => {
    if (userId === null) {
      setIsAdmin(false);
      setIsAdminLoading(false);
      return;
    }
    try {
      const user = await getUserById(userId);
      setIsAdmin(user.isAdmin);
    } catch {
      // User no longer exists (e.g. DB was reset) — clear stale ID and let the app redirect to create-user
      setIsAdmin(false);
      setUserId(null);
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    if (userId !== null) {
      setIsAdminLoading(true);
      refreshCurrentUser();
    } else {
      setIsAdmin(false);
      setIsAdminLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <GameContext.Provider value={{ mode, setMode, userId, setUserId, isAdmin, isAdminLoading, refreshCurrentUser }}>
      {children}
    </GameContext.Provider>
  );
};
