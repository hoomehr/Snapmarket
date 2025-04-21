import { stocks, type Stock, type InsertStock, type RecommendationType, type Sector, type SortOption, recommendationTypes } from "@shared/schema";
import axios from "axios";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Stock methods
  getStocks(
    page: number, 
    limit: number, 
    recommendation?: RecommendationType, 
    sector?: Sector, 
    sortBy?: SortOption
  ): Promise<{ stocks: Stock[], total: number }>;
  
  getStockBySymbol(symbol: string): Promise<Stock | undefined>;
  getStockStats(): Promise<{ 
    buyCount: number, 
    holdCount: number, 
    sellCount: number 
  }>;
  refreshStocks(): Promise<void>;
}

// Import original types
import { users, type User, type InsertUser } from "@shared/schema";

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stocksData: Map<string, Stock>; // symbol -> stock
  currentId: number;
  private stockId: number;

  constructor() {
    this.users = new Map();
    this.stocksData = new Map();
    this.currentId = 1;
    this.stockId = 1;
    
    // Initialize with fetching stocks
    this.fetchInitialStocks();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Stock methods
  private async fetchInitialStocks(): Promise<void> {
    try {
      // For demo, we'll add some initial stocks as a fallback 
      // in case the API request fails or rate limits are hit
      const defaultStocks = [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 174.79,
          change: 4.21,
          changePercent: 2.41,
          volume: 56300000,
          marketCap: 2740000000000,
          sector: 'technology',
          recommendation: 'strong_buy',
          high52Week: 198.23,
          low52Week: 124.17,
          peRatio: 28.74,
          dividendYield: 0.51,
          targetPrice: 193.50
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          price: 385.64,
          change: 6.48,
          changePercent: 1.68,
          volume: 21700000,
          marketCap: 2860000000000,
          sector: 'technology',
          recommendation: 'buy',
          high52Week: 420.82,
          low52Week: 309.05,
          peRatio: 33.21,
          dividendYield: 0.72,
          targetPrice: 415.75
        },
        {
          symbol: 'AMZN',
          name: 'Amazon.com Inc.',
          price: 178.22,
          change: -0.61,
          changePercent: -0.34,
          volume: 33900000,
          marketCap: 1840000000000,
          sector: 'consumer_cyclical',
          recommendation: 'hold',
          high52Week: 189.54,
          low52Week: 118.35,
          peRatio: 59.82,
          dividendYield: 0,
          targetPrice: 186.40
        },
        {
          symbol: 'NFLX',
          name: 'Netflix Inc.',
          price: 625.78,
          change: -7.82,
          changePercent: -1.24,
          volume: 5300000,
          marketCap: 276500000000,
          sector: 'communication_services',
          recommendation: 'sell',
          high52Week: 639.00,
          low52Week: 344.73,
          peRatio: 43.15,
          dividendYield: 0,
          targetPrice: 590.25
        },
        {
          symbol: 'TSLA',
          name: 'Tesla Inc.',
          price: 205.13,
          change: -7.53,
          changePercent: -3.67,
          volume: 122100000,
          marketCap: 652900000000,
          sector: 'consumer_cyclical',
          recommendation: 'strong_sell',
          high52Week: 299.29,
          low52Week: 138.80,
          peRatio: 83.65,
          dividendYield: 0,
          targetPrice: 175.80
        },
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          price: 124.83,
          change: 3.54,
          changePercent: 2.83,
          volume: 145200000,
          marketCap: 3080000000000,
          sector: 'technology',
          recommendation: 'buy',
          high52Week: 140.76,
          low52Week: 39.23,
          peRatio: 73.21,
          dividendYield: 0.03,
          targetPrice: 131.50
        },
        {
          symbol: 'JPM',
          name: 'JPMorgan Chase & Co.',
          price: 198.95,
          change: 1.15,
          changePercent: 0.58,
          volume: 8600000,
          marketCap: 572100000000,
          sector: 'financials',
          recommendation: 'hold',
          high52Week: 205.88,
          low52Week: 135.19,
          peRatio: 12.08,
          dividendYield: 2.31,
          targetPrice: 203.15
        },
        {
          symbol: 'JNJ',
          name: 'Johnson & Johnson',
          price: 151.77,
          change: 0.33,
          changePercent: 0.22,
          volume: 6500000,
          marketCap: 364300000000,
          sector: 'healthcare',
          recommendation: 'buy',
          high52Week: 168.35,
          low52Week: 144.95,
          peRatio: 9.42,
          dividendYield: 3.15,
          targetPrice: 162.80
        }
      ];

      // Add the default stocks to our in-memory storage
      for (const stock of defaultStocks) {
        const id = this.stockId++;
        // Convert numerical values to strings to match the schema
        this.stocksData.set(stock.symbol, { 
          id, 
          symbol: stock.symbol,
          name: stock.name,
          price: String(stock.price),
          change: String(stock.change),
          changePercent: String(stock.changePercent),
          volume: String(stock.volume),
          marketCap: String(stock.marketCap),
          sector: stock.sector as Sector,
          recommendation: stock.recommendation as RecommendationType,
          high52Week: String(stock.high52Week),
          low52Week: String(stock.low52Week),
          peRatio: String(stock.peRatio),
          dividendYield: String(stock.dividendYield),
          targetPrice: String(stock.targetPrice)
        });
      }

      // Now try to fetch real stock data from API
      await this.refreshStocks();
      
    } catch (error) {
      console.error("Error fetching initial stocks:", error);
      // We already have default stocks, so continue execution
    }
  }

  async getStocks(
    page: number = 1,
    limit: number = 20,
    recommendation?: RecommendationType,
    sector?: Sector,
    sortBy: SortOption = "alphabetical"
  ): Promise<{ stocks: Stock[], total: number }> {
    let stocks = Array.from(this.stocksData.values());
    
    // Apply filters
    if (recommendation) {
      stocks = stocks.filter(stock => stock.recommendation === recommendation);
    }
    
    if (sector) {
      stocks = stocks.filter(stock => stock.sector === sector);
    }
    
    // Apply sorting
    switch (sortBy) {
      case "alphabetical":
        stocks = stocks.sort((a, b) => a.symbol.localeCompare(b.symbol));
        break;
      case "price":
        stocks = stocks.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "change":
        stocks = stocks.sort((a, b) => Number(b.changePercent) - Number(a.changePercent));
        break;
      case "volume":
        stocks = stocks.sort((a, b) => Number(b.volume) - Number(a.volume));
        break;
      case "market_cap":
        stocks = stocks.sort((a, b) => Number(b.marketCap) - Number(a.marketCap));
        break;
      default:
        stocks = stocks.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }
    
    // Calculate total for pagination
    const total = stocks.length;
    
    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    stocks = stocks.slice(start, end);
    
    return { stocks, total };
  }
  
  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    return this.stocksData.get(symbol);
  }
  
  async getStockStats(): Promise<{ buyCount: number, holdCount: number, sellCount: number }> {
    const stocks = Array.from(this.stocksData.values());
    
    const buyCount = stocks.filter(stock => 
      stock.recommendation === 'buy' || stock.recommendation === 'strong_buy'
    ).length;
    
    const holdCount = stocks.filter(stock => 
      stock.recommendation === 'hold'
    ).length;
    
    const sellCount = stocks.filter(stock => 
      stock.recommendation === 'sell' || stock.recommendation === 'strong_sell'
    ).length;
    
    return { buyCount, holdCount, sellCount };
  }
  
  async refreshStocks(): Promise<void> {
    try {
      console.log("Refreshing stock data...");
      
      const stocks = Array.from(this.stocksData.values());
      
      for (const stock of stocks) {
        // Generate a random price change with market momentum
        // More positive for tech and healthcare, more volatile for consumer cyclical
        let biasMultiplier = 1.0;
        
        // Add sector bias
        if (stock.sector === 'technology' || stock.sector === 'healthcare') {
          biasMultiplier = 1.5; // More positive bias for tech and healthcare
        } else if (stock.sector === 'consumer_cyclical') {
          biasMultiplier = 0.8; // Less positive bias for consumer cyclical
        }
        
        // Add recommendation bias
        if (stock.recommendation === 'strong_buy' || stock.recommendation === 'buy') {
          biasMultiplier += 0.3; // Strong buy stocks tend to go up more
        } else if (stock.recommendation === 'sell' || stock.recommendation === 'strong_sell') {
          biasMultiplier -= 0.5; // Sell-rated stocks tend to go down more
        }
        
        // Calculate the actual change percentage (between -3% and +4%)
        const baseChange = (Math.random() * 7 - 3);
        const changePercentNum = (baseChange * biasMultiplier);
        const changePercentStr = changePercentNum.toFixed(2);
        const priceChangeNum = (Number(stock.price) * changePercentNum / 100);
        const priceChangeStr = priceChangeNum.toFixed(2);
        const newPriceNum = (Number(stock.price) + priceChangeNum);
        const newPriceStr = newPriceNum.toFixed(2);
        
        // Randomize volume with higher volume for changing recommendations
        const newVolumeNum = Math.floor(Number(stock.volume) * (0.8 + Math.random() * 0.4));
        const newVolumeStr = newVolumeNum.toString();
        
        // Occasionally update the target price
        let newTargetPriceStr = stock.targetPrice;
        if (Math.random() < 0.3 && stock.targetPrice) {
          const currentTargetPrice = Number(stock.targetPrice);
          const newTargetPriceNum = currentTargetPrice * (1 + (Math.random() * 0.1 - 0.05));
          newTargetPriceStr = newTargetPriceNum.toFixed(2);
        }
        
        // Occasionally change the recommendation based on price movement
        let newRecommendation = stock.recommendation;
        if (Math.random() < 0.15) { // 15% chance to change recommendation
          const currentIndex = recommendationTypes.indexOf(stock.recommendation as RecommendationType);
          
          if (changePercentNum > 2 && currentIndex > 0) {
            // If price goes up significantly, improve recommendation
            newRecommendation = recommendationTypes[currentIndex - 1];
          } else if (changePercentNum < -2 && currentIndex < recommendationTypes.length - 1) {
            // If price drops significantly, worsen recommendation
            newRecommendation = recommendationTypes[currentIndex + 1];
          }
        }
        
        // Create updated stock with correct types
        const updatedStock: Stock = {
          ...stock,
          price: newPriceStr,
          change: priceChangeStr,
          changePercent: changePercentStr,
          recommendation: newRecommendation as RecommendationType,
          volume: newVolumeStr,
          targetPrice: newTargetPriceStr
        };
        
        // Update the stock in the map
        this.stocksData.set(stock.symbol, updatedStock);
      }
      
      console.log("Stock data refreshed successfully");
      
    } catch (error) {
      console.error("Error refreshing stocks:", error);
      throw error;
    }
  }
}

export const storage = new MemStorage();
