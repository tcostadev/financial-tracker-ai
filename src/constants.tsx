import React from 'react';
import { Utensils, Car, Film, ShoppingBag, Zap, HeartPulse } from 'lucide-react';

export const IconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
  Film: <Film className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  HeartPulse: <HeartPulse className="w-4 h-4" />,
};

export const AVAILABLE_ICONS = ['Utensils', 'Car', 'Film', 'ShoppingBag', 'Zap', 'HeartPulse'];
export const AVAILABLE_COLORS = ['#f87171', '#60a5fa', '#c084fc', '#fbbf24', '#4ade80', '#f472b6', '#6366f1', '#14b8a6'];
