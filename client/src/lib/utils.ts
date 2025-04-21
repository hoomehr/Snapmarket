import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { RecommendationType } from "@shared/schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a number as currency with $ symbol
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Format large numbers with K, M, B suffixes
export function formatLargeNumber(value: number): string {
  if (value === 0) return '0';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1000000000) {
    return (value / 1000000000).toFixed(2) + 'B';
  } else if (absValue >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M';
  } else if (absValue >= 1000) {
    return (value / 1000).toFixed(2) + 'K';
  } else {
    return value.toString();
  }
}

// Get background and text colors for recommendation types
export function getRecommendationColor(recommendation: RecommendationType): { bg: string; text: string } {
  switch (recommendation) {
    case 'strong_buy':
      return { bg: 'bg-green-100', text: 'text-buy' };
    case 'buy':
      return { bg: 'bg-green-50', text: 'text-buy' };
    case 'hold':
      return { bg: 'bg-amber-100', text: 'text-hold' };
    case 'sell':
      return { bg: 'bg-red-50', text: 'text-sell' };
    case 'strong_sell':
      return { bg: 'bg-red-100', text: 'text-sell' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}
