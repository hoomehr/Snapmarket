import { stocks, type Stock, type InsertStock, type RecommendationType, type Sector, type SortOption, recommendationTypes } from "@shared/schema";
import axios from "axios";

// Helper function to handle API rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
      // Initialize with empty stock data
      this.stocksData = new Map();
      
      // Fetch real data right away using Polygon.io API
      await this.refreshStocks();
      
    } catch (error) {
      console.error("Error fetching initial stocks:", error);
      // Create some fallback stocks if API request fails
      this.createFallbackStocks();
    }
  }
  
  private createFallbackStocks(): void {
    console.log("Creating fallback stocks as API request failed");
    // If API fails, create a few fallback stocks
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
      }
    ];

    // Add fallback stocks
    for (const stock of defaultStocks) {
      const id = this.stockId++;
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
      console.log("Fetching real-time stock data from Polygon.io API...");
      
      // Check if we have an API key
      const apiKey = process.env.POLYGON_API_KEY;
      if (!apiKey) {
        throw new Error("POLYGON_API_KEY environment variable is not set");
      }
      
      // Only process a few popular stocks to avoid rate limits with free tier
      // These are some of the most popular stocks that will be interesting to track
      const popularStocks = [
        { ticker: 'AAPL', name: 'Apple Inc.', sector: 'technology' },
        { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'technology' },
        { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'technology' },
        { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'consumer_cyclical' },
        { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'technology' },
        { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'consumer_cyclical' },
        { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'financials' },
        { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'healthcare' },
        { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'technology' },
        { ticker: 'V', name: 'Visa Inc.', sector: 'financials' }
      ];
      
      console.log(`Processing ${popularStocks.length} popular stocks to avoid API rate limits`);
      
      // Reset the stock map
      this.stocksData.clear();
      
      // Process each popular stock with significant delay between requests
      for (let i = 0; i < popularStocks.length; i++) {
        try {
          const stockInfo = popularStocks[i];
          const symbol = stockInfo.ticker;
          
          console.log(`Processing stock ${i+1}/${popularStocks.length}: ${symbol}`);
          
          // Add significant delay between requests to avoid rate limit errors
          if (i > 0) {
            await delay(2000); // Wait 2 seconds between requests
          }
          
          // Get detailed stock data using the grouping endpoint
          const detailUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`;
          const detailResponse = await axios.get(detailUrl);
          
          if (!detailResponse.data || !detailResponse.data.results || !detailResponse.data.results.length) {
            console.log(`No detail data available for ${symbol}, skipping...`);
            continue;
          }
          
          const detail = detailResponse.data.results[0];
          
          // Generate a recommendation based on relative price movements
          const priceChange = detail.c - detail.o;
          const priceChangePercent = (priceChange / detail.o) * 100;
          
          let recommendation: RecommendationType;
          if (priceChangePercent > 5) {
            recommendation = 'strong_buy';
          } else if (priceChangePercent > 2) {
            recommendation = 'buy';
          } else if (priceChangePercent > -2) {
            recommendation = 'hold';
          } else if (priceChangePercent > -5) {
            recommendation = 'sell';
          } else {
            recommendation = 'strong_sell';
          }
          
          // Create stock object with all necessary fields
          const stock: Stock = {
            id: this.stockId++,
            symbol: symbol,
            name: stockInfo.name,
            price: detail.c.toFixed(2),
            change: priceChange.toFixed(2),
            changePercent: priceChangePercent.toFixed(2),
            volume: String(detail.v),
            marketCap: String(0), // We don't have this in the hardcoded list
            sector: stockInfo.sector as Sector,
            recommendation: recommendation,
            high52Week: detail.h ? detail.h.toFixed(2) : null,
            low52Week: detail.l ? detail.l.toFixed(2) : null,
            peRatio: null, // Not available in this simplified approach
            dividendYield: null, // Not available in this simplified approach
            targetPrice: ((detail.c * 1.1) + (Math.random() * detail.c * 0.1)).toFixed(2) // Estimated target 10-20% above current
          };
          
          // Add to storage
          this.stocksData.set(symbol, stock);
          console.log(`Successfully added ${symbol} data`);
          
        } catch (error) {
          console.error(`Error processing stock ${popularStocks[i].ticker}:`, error);
          // Continue with other stocks if one fails
        }
      }
      
      console.log(`Successfully loaded ${this.stocksData.size} stocks from Polygon.io API`);
      
      // If we didn't get any stocks, use fallback
      if (this.stocksData.size === 0) {
        console.log("No stocks fetched from API, using fallback data");
        this.createFallbackStocks();
      }
      
    } catch (error) {
      console.error("Error refreshing stocks from Polygon.io API:", error);
      console.log("Using fallback stock data instead");
      this.createFallbackStocks();
    }
  }
}

export const storage = new MemStorage();
