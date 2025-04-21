import { Card, CardContent } from "@/components/ui/card";
import { Stock } from "@shared/schema";
import { formatCurrency, formatLargeNumber, getRecommendationColor, getSectorColor } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface StockCardProps {
  stock: Stock;
  onViewDetails: () => void;
}

export default function StockCard({ stock, onViewDetails }: StockCardProps) {
  const isPositiveChange = Number(stock.changePercent) >= 0;
  const changeColor = isPositiveChange ? "text-buy" : "text-sell";
  
  // Format recommendations for display (e.g., strong_buy -> Strong Buy)
  const formatRecommendation = (rec: string): string => {
    return rec
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Format sectors for display (e.g., consumer_cyclical -> Consumer Cyclical)
  const formatSector = (sector: string | null): string => {
    if (!sector) return "N/A";
    return sector
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const recommendationColor = getRecommendationColor(stock.recommendation);
  const sectorColor = getSectorColor(stock.sector as string);
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* Keep header as is */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{stock.symbol}</h2>
            <p className="text-sm text-gray-500">{stock.name}</p>
          </div>
          <div 
            className={`rounded-full px-3 py-1 text-sm font-medium ${recommendationColor.bg} ${recommendationColor.text}`}
          >
            {formatRecommendation(stock.recommendation)}
          </div>
        </div>
      </div>
      
      <CardContent className="p-3">
        {/* Use smaller fields in a more compact layout */}
        <div className="flex mb-2">
          <div className="w-1/2">
            <p className="text-xs text-gray-500 uppercase">Price</p>
            <p className="text-base font-semibold">{formatCurrency(Number(stock.price))}</p>
          </div>
          <div className="w-1/2">
            <p className="text-xs text-gray-500 uppercase">Change</p>
            <p className={`text-base font-semibold ${changeColor}`}>
              {isPositiveChange ? "+" : ""}{stock.changePercent}%
            </p>
          </div>
        </div>
        
        <div className="flex mb-3">
          <div className="w-1/2">
            <p className="text-xs text-gray-500 uppercase">Volume</p>
            <p className="text-xs">{formatLargeNumber(Number(stock.volume))}</p>
          </div>
          <div className="w-1/2">
            <p className="text-xs text-gray-500 uppercase">Market Cap</p>
            <p className="text-xs">{formatLargeNumber(Number(stock.marketCap))}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          {/* Colored sector tag */}
          <div 
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${sectorColor.bg} ${sectorColor.text}`}
          >
            {formatSector(stock.sector)}
          </div>
          
          <button 
            className="text-xs font-medium text-black hover:text-gray-700 flex items-center gap-1"
            onClick={onViewDetails}
          >
            Details
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
