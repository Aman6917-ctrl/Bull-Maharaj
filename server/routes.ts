import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { tradingBot } from "./model/tradingBot";
import { getMarketOverview, getMarketSentiment } from "./utils/marketData";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication - this will add all the needed middleware and routes
  setupAuth(app);

  // Authentication middleware
  const authenticate = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Market Overview routes
  app.get("/api/market/overview", async (req, res) => {
    try {
      const marketOverview = await getMarketOverview();
      res.status(200).json(marketOverview);
    } catch (error) {
      console.error("Error fetching market overview:", error);
      res.status(500).json({ message: "Failed to fetch market overview" });
    }
  });

  // Stocks routes
  app.get("/api/stocks", async (req, res) => {
    try {
      const stocks = await storage.getStocks();
      res.status(200).json(stocks);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      res.status(500).json({ message: "Failed to fetch stocks" });
    }
  });

  app.get("/api/stocks/:id", async (req, res) => {
    try {
      const stockId = parseInt(req.params.id);
      const stock = await storage.getStock(stockId);
      
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.status(200).json(stock);
    } catch (error) {
      console.error("Error fetching stock:", error);
      res.status(500).json({ message: "Failed to fetch stock" });
    }
  });

  // Portfolio routes (protected)
  app.get("/api/portfolio", authenticate, async (req, res) => {
    try {
      const userId = req.user!.id;
      const portfolioItems = await storage.getPortfolioByUserId(userId);
      
      // Enrich portfolio items with stock details
      const enrichedItems = await Promise.all(
        portfolioItems.map(async (item) => {
          const stock = await storage.getStock(item.stockId);
          return {
            ...item,
            stock
          };
        })
      );
      
      res.status(200).json(enrichedItems);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Trading History routes (protected)
  app.get("/api/trading-history", authenticate, async (req, res) => {
    try {
      const userId = req.user!.id;
      const history = await storage.getTradingHistoryByUserId(userId);
      
      // Enrich trading history with stock details
      const enrichedHistory = await Promise.all(
        history.map(async (entry) => {
          const stock = await storage.getStock(entry.stockId);
          return {
            ...entry,
            stock
          };
        })
      );
      
      res.status(200).json(enrichedHistory);
    } catch (error) {
      console.error("Error fetching trading history:", error);
      res.status(500).json({ message: "Failed to fetch trading history" });
    }
  });

  // Stock Predictions routes
  app.get("/api/predictions", async (req, res) => {
    try {
      const predictions = await storage.getStockPredictions();
      
      // Enrich predictions with stock details
      const enrichedPredictions = await Promise.all(
        predictions.map(async (prediction) => {
          const stock = await storage.getStock(prediction.stockId);
          return {
            ...prediction,
            stock
          };
        })
      );
      
      res.status(200).json(enrichedPredictions);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });

  // Trading Bot routes
  app.get("/api/trading-bot/performance", authenticate, async (req, res) => {
    try {
      const performance = await tradingBot.getPerformanceMetrics();
      res.status(200).json(performance);
    } catch (error) {
      console.error("Error fetching trading bot performance:", error);
      res.status(500).json({ message: "Failed to fetch trading bot performance" });
    }
  });

  app.get("/api/market/sentiment", async (req, res) => {
    try {
      const sentiment = await getMarketSentiment();
      res.status(200).json(sentiment);
    } catch (error) {
      console.error("Error fetching market sentiment:", error);
      res.status(500).json({ message: "Failed to fetch market sentiment" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
