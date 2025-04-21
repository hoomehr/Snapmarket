import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { RecommendationType, Sector, SortOption } from "@shared/schema";

interface FilterControlsProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function FilterControls({
  onRefresh,
  isRefreshing
}: FilterControlsProps) {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="bg-black hover:bg-gray-800 text-white py-2.5 px-4 rounded-lg transition duration-200 flex items-center gap-2"
      >
        <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing Data...' : 'Refresh Market Data'}
      </Button>
    </div>
  );
}
