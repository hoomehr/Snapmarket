import { Stock, RecommendationType } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency, formatLargeNumber, getRecommendationColor } from "@/lib/utils";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StockDetailModalProps {
  isOpen: boolean;
  stock: Stock;
  onClose: () => void;
}

export default function StockDetailModal({ isOpen, stock, onClose }: StockDetailModalProps) {
  if (!stock) return null;
  
  const isPositiveChange = Number(stock.changePercent) >= 0;
  const changeColor = isPositiveChange ? "text-buy" : "text-sell";
  const recommendationColor = getRecommendationColor(stock.recommendation as RecommendationType);
  
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
  
  // Calculate recommendation percentages based on the recommendation type
  const getRecommendationPercentages = () => {
    switch (stock.recommendation) {
      case 'strong_buy':
        return { strongBuy: 65, buy: 20, hold: 10, sell: 5, strongSell: 0 };
      case 'buy':
        return { strongBuy: 35, buy: 40, hold: 15, sell: 10, strongSell: 0 };
      case 'hold':
        return { strongBuy: 15, buy: 25, hold: 40, sell: 15, strongSell: 5 };
      case 'sell':
        return { strongBuy: 5, buy: 15, hold: 25, sell: 40, strongSell: 15 };
      case 'strong_sell':
        return { strongBuy: 0, buy: 5, hold: 10, sell: 20, strongSell: 65 };
      default:
        return { strongBuy: 20, buy: 20, hold: 20, sell: 20, strongSell: 20 };
    }
  };
  
  const recommendationPercentages = getRecommendationPercentages();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto mx-4 p-0">
        <DialogHeader className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <DialogTitle className="text-2xl font-semibold text-gray-900">{stock.symbol}</DialogTitle>
            <DialogDescription className="text-lg text-gray-500">{stock.name}</DialogDescription>
          </div>
          <Button variant="ghost" className="p-2 h-auto" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </DialogHeader>
        
        <div className="p-6">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 mb-1">Current Price</p>
              <p className="text-2xl font-bold">{formatCurrency(Number(stock.price))}</p>
              <p className={`${changeColor} font-medium flex items-center mt-1`}>
                {isPositiveChange ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {isPositiveChange ? "+" : ""}{stock.changePercent}% today
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 mb-1">Recommendation</p>
              <div className={`rounded-full px-3 py-1 text-sm font-medium inline-block ${recommendationColor.bg} ${recommendationColor.text}`}>
                {formatRecommendation(stock.recommendation)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Based on technical analysis and fundamentals
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 mb-1">Target Price</p>
              <p className="text-2xl font-bold">{formatCurrency(Number(stock.targetPrice))}</p>
              <p className="text-sm text-gray-600 mt-1">
                Average of analyst forecasts
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Price History</h3>
            <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
              <div className="text-center">
                <svg className="h-48 w-full" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M0,150 L40,130 L80,135 L120,95 L160,105 L200,80 L240,90 L280,70 L320,50 L360,30 L400,10" 
                    fill="none" 
                    stroke={isPositiveChange ? "#10B981" : "#EF4444"} 
                    strokeWidth="2" 
                  />
                  <line x1="0" y1="180" x2="400" y2="180" stroke="#E5E7EB" strokeWidth="1" />
                  <text x="0" y="195" fontSize="10" fill="#6B7280">Jan</text>
                  <text x="80" y="195" fontSize="10" fill="#6B7280">Mar</text>
                  <text x="160" y="195" fontSize="10" fill="#6B7280">May</text>
                  <text x="240" y="195" fontSize="10" fill="#6B7280">Jul</text>
                  <text x="320" y="195" fontSize="10" fill="#6B7280">Sep</text>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Key Metrics</h3>
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-sm text-gray-500">Market Cap</td>
                    <td className="py-2 text-sm font-medium text-right">
                      {formatLargeNumber(Number(stock.marketCap))}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-sm text-gray-500">P/E Ratio</td>
                    <td className="py-2 text-sm font-medium text-right">
                      {stock.peRatio ? Number(stock.peRatio).toFixed(2) : 'N/A'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-sm text-gray-500">52-Week High</td>
                    <td className="py-2 text-sm font-medium text-right">
                      {stock.high52Week ? formatCurrency(Number(stock.high52Week)) : 'N/A'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-sm text-gray-500">52-Week Low</td>
                    <td className="py-2 text-sm font-medium text-right">
                      {stock.low52Week ? formatCurrency(Number(stock.low52Week)) : 'N/A'}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-sm text-gray-500">Dividend Yield</td>
                    <td className="py-2 text-sm font-medium text-right">
                      {stock.dividendYield ? `${stock.dividendYield}%` : 'N/A'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Analyst Recommendations</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex mb-2">
                  <div className="w-24 text-sm text-gray-500">Strong Buy</div>
                  <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
                    <div className="h-full bg-buy" style={{ width: `${recommendationPercentages.strongBuy}%` }}></div>
                  </div>
                  <div className="w-10 text-sm text-right">{recommendationPercentages.strongBuy}%</div>
                </div>
                <div className="flex mb-2">
                  <div className="w-24 text-sm text-gray-500">Buy</div>
                  <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
                    <div className="h-full bg-buy" style={{ width: `${recommendationPercentages.buy}%` }}></div>
                  </div>
                  <div className="w-10 text-sm text-right">{recommendationPercentages.buy}%</div>
                </div>
                <div className="flex mb-2">
                  <div className="w-24 text-sm text-gray-500">Hold</div>
                  <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
                    <div className="h-full bg-hold" style={{ width: `${recommendationPercentages.hold}%` }}></div>
                  </div>
                  <div className="w-10 text-sm text-right">{recommendationPercentages.hold}%</div>
                </div>
                <div className="flex mb-2">
                  <div className="w-24 text-sm text-gray-500">Sell</div>
                  <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
                    <div className="h-full bg-sell" style={{ width: `${recommendationPercentages.sell}%` }}></div>
                  </div>
                  <div className="w-10 text-sm text-right">{recommendationPercentages.sell}%</div>
                </div>
                <div className="flex">
                  <div className="w-24 text-sm text-gray-500">Strong Sell</div>
                  <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
                    <div className="h-full bg-sell" style={{ width: `${recommendationPercentages.strongSell}%` }}></div>
                  </div>
                  <div className="w-10 text-sm text-right">{recommendationPercentages.strongSell}%</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 flex justify-end">
            <Button variant="default" className="bg-black hover:bg-gray-800" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
