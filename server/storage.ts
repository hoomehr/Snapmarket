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
      console.log("Fetching real-time stock data from TwelveData API...");
      
      // Check if we have an API key
      const apiKey = process.env.TWELVEDATA_API_KEY;
      if (!apiKey) {
        throw new Error("TWELVEDATA_API_KEY environment variable is not set");
      }
      
      // Top stocks by market cap for US market - we'll carefully limit our requests
      // due to TwelveData API free tier limit of 8 credits per minute
      const popularStocks = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', // First batch (8 stocks)
        'V', 'JNJ', 'UNH', 'WMT', 'PG', 'HD', 'BAC', 'MA',               // Second batch (if credits available)
        'AVGO', 'LLY', 'XOM', 'COST', 'CVX', 'MRK', 'KO', 'PEP',
        'ABBV', 'PFE', 'CSCO', 'TMO', 'CRM', 'DIS', 'MCD', 'INTC',
        'ADBE', 'NFLX', 'AMD', 'CMCSA', 'QCOM', 'NKE', 'TXN', 'MS'
      ];
      
      console.log(`Processing stocks data from TwelveData API`);
      
      // Reset the stock map
      this.stocksData.clear();
      
      // TwelveData free tier only allows 8 API credits per minute
      // So we'll only request 8 stocks to stay within this limit
      const initialBatchSize = 8; // Reduced from 16 to stay within free tier limits
      const firstBatch = popularStocks.slice(0, initialBatchSize);
      
      // Combine into a single group that stays within the free tier limit
      const symbolsToFetch = firstBatch.join(',');
      
      console.log(`Fetching initial batch of ${initialBatchSize} stocks to stay within API rate limits...`);
      
      // Get quotes for the group (staying within 8 credits/minute limit)
      const quotesUrl = `https://api.twelvedata.com/quote?symbol=${symbolsToFetch}&apikey=${apiKey}`;
      console.log(`Requesting data from TwelveData API...`);
      
      // Variables for API response
      let quotesResponse: any = null;
      
      try {
        // Single request to stay within rate limits
        console.log("Sending request to TwelveData API...");
        const response = await axios.get(quotesUrl);
        quotesResponse = response;
        console.log('API response status:', response.status);
        
        // Process quotes immediately
        if (response.data) {
          const quotes = response.data;
          console.log('Response data type:', typeof quotes);
          console.log('Response data keys:', Object.keys(quotes));
          
          // Check if we got an error response from the API
          if (quotes.status === 'error' || quotes.code === 429 || quotes.message) {
            console.error(`TwelveData API error:`, quotes.message || 'Unknown error');
            // Continue to the fallback data path
          } else if (quotes.symbol) {
            // Single quote
            console.log('Processing single quote for symbol:', quotes.symbol);
            await this.processStockQuote(quotes);
          } else {
            // Multiple quotes - only process valid quote objects
            const validSymbols = Object.keys(quotes).filter(key => 
              typeof quotes[key] === 'object' && quotes[key].symbol
            );
            
            console.log('Found valid symbols:', validSymbols);
            for (const symbol of validSymbols) {
              await this.processStockQuote(quotes[symbol]);
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching data from TwelveData API:', error.message);
        if (error.response) {
          console.error('Error response status:', error.response.status);
          console.error('Error response data:', JSON.stringify(error.response.data || {}).substring(0, 300));
        }
      }
      
      console.log(`Successfully loaded ${this.stocksData.size} stocks from TwelveData API`);
      
      // If we didn't get any stocks, use fallback
      if (this.stocksData.size === 0) {
        console.log("No stocks fetched from API, using fallback data");
        this.createFallbackStocks();
      }
      
    } catch (error) {
      console.error("Error refreshing stocks from TwelveData API:", error);
      console.log("Using fallback stock data instead");
      this.createFallbackStocks();
    }
  }
  
  private async processStockQuote(quote: any): Promise<void> {
    try {
      if (!quote || !quote.symbol) {
        return;
      }
      
      const symbol = quote.symbol;
      console.log(`Processing stock: ${symbol}`);
      
      // Parse the numerical values
      const open = parseFloat(quote.open || '0');
      const close = parseFloat(quote.close || '0');
      const high = parseFloat(quote.high || '0');
      const low = parseFloat(quote.low || '0');
      const volume = parseInt(quote.volume || '0');
      const previousClose = parseFloat(quote.previous_close || open);
      
      // Calculate price change and percentage
      const priceChange = close - previousClose;
      const priceChangePercent = ((close - previousClose) / previousClose) * 100;
      
      // Determine stock sector based on symbol - this is a simplification
      let sector: Sector;
      
      // Map sectors based on common knowledge about the stocks
      const symbol_lower = symbol.toLowerCase();
      if (['aapl', 'msft', 'googl', 'meta', 'nvda', 'adbe', 'orcl', 'crm', 'amd', 'intc', 'csco'].includes(symbol_lower)) {
        sector = 'technology';
      } else if (['jpm', 'bac', 'wfc', 'gs', 'ms', 'c', 'v', 'ma', 'axp'].includes(symbol_lower)) {
        sector = 'financials';
      } else if (['unh', 'jnj', 'lly', 'pfe', 'mrk', 'abbv', 'tmo', 'dhr', 'abt'].includes(symbol_lower)) {
        sector = 'healthcare';
      } else if (['xom', 'cvx', 'cop', 'slb', 'eog', 'psx', 'vlo', 'oxy'].includes(symbol_lower)) {
        sector = 'energy';
      } else if (['amzn', 'tsla', 'hd', 'mcd', 'nke', 'sbux', 'low', 'bkng', 'abnb', 'f', 'gm'].includes(symbol_lower)) {
        sector = 'consumer_cyclical';
      } else if (['wmt', 'pg', 'ko', 'pep', 'cost', 'cl', 'gis'].includes(symbol_lower)) {
        sector = 'consumer_defensive';
      } else if (['ups', 'hon', 'unp', 'ba', 'cat', 'de', 'lmt', 'rtx', 'ge', 'mmm'].includes(symbol_lower)) {
        sector = 'industrials';
      } else if (['lin', 'apd', 'ecl', 'dd', 'dow', 'fcx', 'nue'].includes(symbol_lower)) {
        sector = 'basic_materials';
      } else if (['nflx', 'dis', 'cmcsa', 'vz', 't', 'tmus', 'atvi', 'ea'].includes(symbol_lower)) {
        sector = 'communication_services';
      } else {
        sector = 'technology'; // Default fallback
      }
      
      // Generate a recommendation based on relative price movements
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
        name: quote.name || symbol,
        price: close.toFixed(2),
        change: priceChange.toFixed(2),
        changePercent: priceChangePercent.toFixed(2),
        volume: String(volume),
        marketCap: String(0), // Not available in the basic API response
        sector: sector,
        recommendation: recommendation,
        high52Week: high.toFixed(2), // Approximation
        low52Week: low.toFixed(2), // Approximation
        peRatio: null, // Not available in the basic response
        dividendYield: null, // Not available in the basic response
        targetPrice: (close * 1.15).toFixed(2) // Estimated target 15% above current
      };
      
      // Add to storage
      this.stocksData.set(symbol, stock);
      console.log(`Successfully added ${symbol} data`);
      
    } catch (error) {
      console.error(`Error processing stock quote:`, error);
    }
  }
}

export const storage = new MemStorage();
