'use client'

import { createContext, useContext, ReactNode } from 'react';

/**
 * Base App Context Provider
 * Replaces Farcaster MiniApp SDK with a lighter weight context for Base apps
 * For OnchainKit features, use the OnchainKitProvider instead
 */
interface BaseAppContextValue {
  left: number;
  right: number;
  bottom: number;
  top: number;
  isReady: boolean;
  chain: 'base' | 'base-sepolia';
}

export const MiniAppContext = createContext<BaseAppContextValue | null>(null);

export function useMiniApp() {
  const context = useContext(MiniAppContext);
  if (!context) {
    throw new Error('useMiniApp must be used within MiniAppProvider');
  }
  return context;
}

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const chain = (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia') || 'base';
  
  const contextValue: BaseAppContextValue = {
    isReady: true,
    chain,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  return (
    <MiniAppContext.Provider value={contextValue}>
      {children}
    </MiniAppContext.Provider>
  );
}

