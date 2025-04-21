import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { RecommendationType, Sector, SortOption } from "@shared/schema";

interface FilterControlsProps {
  recommendation?: RecommendationType;
  sector?: Sector;
  sortBy: SortOption;
  onFilterChange: (recommendation?: RecommendationType | 'all_recommendations', sector?: Sector | 'all_sectors') => void;
  onSortChange: (sortBy: SortOption) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function FilterControls({
  recommendation,
  sector,
  sortBy,
  onFilterChange,
  onSortChange,
  onRefresh,
  isRefreshing
}: FilterControlsProps) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-4 items-center">
      <div className="relative">
        <Select 
          value={recommendation || "all_recommendations"} 
          onValueChange={(value) => onFilterChange(value as RecommendationType | 'all_recommendations', sector)}
        >
          <SelectTrigger className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black w-full">
            <SelectValue placeholder="All Recommendations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_recommendations">All Recommendations</SelectItem>
            <SelectItem value="strong_buy">Strong Buy</SelectItem>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="hold">Hold</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
            <SelectItem value="strong_sell">Strong Sell</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative">
        <Select 
          value={sector || "all_sectors"} 
          onValueChange={(value) => onFilterChange(recommendation, value as Sector | 'all_sectors')}
        >
          <SelectTrigger className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black w-full">
            <SelectValue placeholder="All Sectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_sectors">All Sectors</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="financials">Financials</SelectItem>
            <SelectItem value="energy">Energy</SelectItem>
            <SelectItem value="consumer_cyclical">Consumer Cyclical</SelectItem>
            <SelectItem value="consumer_defensive">Consumer Defensive</SelectItem>
            <SelectItem value="industrials">Industrials</SelectItem>
            <SelectItem value="basic_materials">Basic Materials</SelectItem>
            <SelectItem value="communication_services">Communication Services</SelectItem>
            <SelectItem value="utilities">Utilities</SelectItem>
            <SelectItem value="real_estate">Real Estate</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative">
        <Select 
          value={sortBy} 
          onValueChange={(value) => onSortChange(value as SortOption)}
        >
          <SelectTrigger className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black w-full">
            <SelectValue placeholder="Sort: A-Z" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alphabetical">Sort: A-Z</SelectItem>
            <SelectItem value="price">Sort: Price</SelectItem>
            <SelectItem value="change">Sort: % Change</SelectItem>
            <SelectItem value="volume">Sort: Volume</SelectItem>
            <SelectItem value="market_cap">Sort: Market Cap</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="bg-black hover:bg-gray-800 text-white py-2.5 px-4 rounded-lg transition duration-200 flex items-center gap-2"
      >
        <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
    </div>
  );
}
