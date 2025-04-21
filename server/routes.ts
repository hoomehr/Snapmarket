import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { RecommendationType, Sector, SortOption } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all stocks with pagination, filtering and sorting
  app.get("/api/stocks", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const recommendation = req.query.recommendation as RecommendationType | undefined;
      const sector = req.query.sector as Sector | undefined;
      const sortBy = req.query.sortBy as SortOption || "alphabetical";
      
      const { stocks, total } = await storage.getStocks(
        page,
        limit,
        recommendation,
        sector,
        sortBy
      );
      
      res.json({
        stocks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching stocks:", error);
      res.status(500).json({ message: "Failed to fetch stocks" });
    }
  });
  
  // Get a single stock by symbol
  app.get("/api/stocks/:symbol", async (req: Request, res: Response) => {
    try {
      const { symbol } = req.params;
      const stock = await storage.getStockBySymbol(symbol);
      
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.json(stock);
    } catch (error) {
      console.error("Error fetching stock:", error);
      res.status(500).json({ message: "Failed to fetch stock" });
    }
  });
  
  // Get stock stats (counts by recommendation)
  app.get("/api/stocks/stats/overview", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStockStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stock stats:", error);
      res.status(500).json({ message: "Failed to fetch stock statistics" });
    }
  });
  
  // Refresh stocks data
  app.post("/api/stocks/refresh", async (req: Request, res: Response) => {
    try {
      await storage.refreshStocks();
      res.json({ message: "Stocks refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing stocks:", error);
      res.status(500).json({ message: "Failed to refresh stocks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
