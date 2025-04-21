import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StockStatsProps {
  isLoading: boolean;
  buyCount: number;
  holdCount: number;
  sellCount: number;
}

export default function StockStats({ isLoading, buyCount, holdCount, sellCount }: StockStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-500">Buy Recommendations</h3>
          <div className="flex items-end mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <span className="text-3xl font-bold text-buy">{buyCount}</span>
                <span className="text-sm text-gray-500 ml-2 mb-1">stocks</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-500">Hold Recommendations</h3>
          <div className="flex items-end mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <span className="text-3xl font-bold text-hold">{holdCount}</span>
                <span className="text-sm text-gray-500 ml-2 mb-1">stocks</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-500">Sell Recommendations</h3>
          <div className="flex items-end mt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <span className="text-3xl font-bold text-sell">{sellCount}</span>
                <span className="text-sm text-gray-500 ml-2 mb-1">stocks</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
