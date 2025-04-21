import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { RecommendationType, Sector, SortOption } from "@shared/schema";
import StockCard from "@/components/StockCard";
import FilterControls from "@/components/FilterControls";
import StockStats from "@/components/StockStats";
import Pagination from "@/components/Pagination";
import StockDetailModal from "@/components/StockDetailModal";
import { Stock } from "@shared/schema";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [recommendation, setRecommendation] = useState<RecommendationType | undefined>(undefined);
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch stocks with pagination, filtering and sorting
  const { data: stocksData, isLoading: isLoadingStocks, error: stocksError } = useQuery({
    queryKey: [
      '/api/stocks',
      { page: currentPage, limit: pageSize, recommendation, sector, sortBy }
    ],
    queryFn: () => fetch(
      `/api/stocks?page=${currentPage}&limit=${pageSize}${recommendation ? `&recommendation=${recommendation}` : ''}${sector ? `&sector=${sector}` : ''}&sortBy=${sortBy}`
    ).then(res => res.json())
  });

  // Define stats type
  type StockStatsData = {
    buyCount: number,
    holdCount: number,
    sellCount: number
  };
  
  // Fetch stock stats
  const { data: statsData = { buyCount: 0, holdCount: 0, sellCount: 0 }, isLoading: isLoadingStats } = useQuery<StockStatsData>({
    queryKey: ['/api/stocks/stats/overview'],
  });

  // Refresh stocks mutation
  const { mutate: refreshStocks, isPending: isRefreshing } = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/stocks/refresh', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stocks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stocks/stats/overview'] });
    }
  });

  // Handle opening the stock detail modal
  const handleViewDetails = (stock: Stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  // Handle closing the stock detail modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle filters and sorting
  const handleFilterChange = (
    newRecommendation?: RecommendationType | 'all_recommendations',
    newSector?: Sector | 'all_sectors'
  ) => {
    // Handle the special case of "all" values
    setRecommendation(newRecommendation === 'all_recommendations' ? undefined : newRecommendation as RecommendationType);
    setSector(newSector === 'all_sectors' ? undefined : newSector as Sector);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
  };

  const handleRefresh = () => {
    refreshStocks();
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">SnapMarket</h1>
              <p className="text-sm text-gray-500 mt-1">Top 100 market stocks with AI-powered recommendations</p>
            </div>
            
            {/* Refresh Button */}
            <FilterControls
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
  
        
        {/* Stats Overview */}
        <StockStats 
          isLoading={isLoadingStats} 
          buyCount={statsData?.buyCount || 0} 
          holdCount={statsData?.holdCount || 0} 
          sellCount={statsData?.sellCount || 0} 
        />

        {/* Stock Cards */}
        {isLoadingStocks ? (
          <div className="mt-10 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="mt-4 text-gray-600">Loading stock data...</p>
          </div>
        ) : stocksError ? (
          <div className="mt-10 text-center">
            <p className="text-red-500 font-medium">Error loading stocks</p>
            <p className="mt-2 text-gray-600">Please try refreshing the page.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
              {stocksData?.stocks.map((stock: Stock) => (
                <StockCard 
                  key={stock.symbol} 
                  stock={stock} 
                  onViewDetails={() => handleViewDetails(stock)} 
                />
              ))}
            </div>

            {/* Empty state */}
            {stocksData?.stocks.length === 0 && (
              <div className="mt-10 text-center">
                <p className="text-gray-600 font-medium">No stocks found matching your filters</p>
                <p className="mt-2 text-gray-500">Try adjusting your filter criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {stocksData?.pagination && stocksData.pagination.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={stocksData.pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </main>

      {/* Stock Detail Modal */}
      {selectedStock && (
        <StockDetailModal
          isOpen={isModalOpen}
          stock={selectedStock}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
