'use client'

import { useMiniApp } from '@/app/providers/MiniAppProvider';
import { ReactNode } from 'react';

interface SafeAreaProps {
  children: ReactNode;
  className?: string;
}

export function SafeArea({ children, className }: SafeAreaProps) {
  const miniApp = useMiniApp();

  // Only apply insets when running inside a mini app
  if (!miniApp.isReady) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={className}
      style={{
        paddingTop: miniApp.top ?? 0,
        paddingBottom: miniApp.bottom ?? 0,
        paddingLeft: miniApp.left ?? 0,
        paddingRight: miniApp.right ?? 0,
      }}
    >
      {children}
    </div>
  );
}
 