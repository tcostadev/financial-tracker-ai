import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className }: { children: React.ReactNode; className?: string; key?: string | number }) => (
  <div className={cn("bg-white rounded-2xl shadow-soft p-6 border border-zinc-100", className)}>
    {children}
  </div>
);
