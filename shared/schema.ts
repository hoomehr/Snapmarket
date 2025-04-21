import { pgTable, text, serial, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema from original file
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Stock schema
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  price: numeric("price").notNull(),
  change: numeric("change").notNull(),
  changePercent: numeric("change_percent").notNull(),
  volume: numeric("volume").notNull(),
  marketCap: numeric("market_cap").notNull(),
  sector: text("sector"),
  recommendation: text("recommendation").notNull(),
  high52Week: numeric("high_52_week"),
  low52Week: numeric("low_52_week"),
  peRatio: numeric("pe_ratio"),
  dividendYield: numeric("dividend_yield"),
  targetPrice: numeric("target_price"),
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
});

export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocks.$inferSelect;

// Recommendation types
export const recommendationTypes = ["strong_buy", "buy", "hold", "sell", "strong_sell"] as const;
export type RecommendationType = typeof recommendationTypes[number];

// Sectors
export const sectors = [
  "technology", 
  "healthcare", 
  "financials", 
  "energy", 
  "consumer_cyclical",
  "consumer_defensive",
  "industrials",
  "basic_materials",
  "communication_services",
  "utilities",
  "real_estate"
] as const;
export type Sector = typeof sectors[number];

// Sort options
export const sortOptions = [
  "alphabetical",
  "price",
  "change",
  "volume",
  "market_cap"
] as const;
export type SortOption = typeof sortOptions[number];
