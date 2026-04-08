import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className }: { children: React.ReactNode; className?: string; key?: string | number }) => (
  <div className={cn("bg-white rounded-3xl shadow-premium p-6 border border-slate-100", className)}>
    {children}
  </div>
);
