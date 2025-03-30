import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { tradingBot, TradingStrategy } from "./model/tradingBot";
import { getMarketOverview, getMarketSentiment, getStockPriceChartData } from "./utils/marketData";
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

  app.get("/api/stocks/:id/chart", async (req, res) => {
    try {
      const stockId = parseInt(req.params.id);
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      
      const stock = await storage.getStock(stockId);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      const chartData = await getStockPriceChartData(stock.symbol, days);
      res.status(200).json(chartData);
    } catch (error) {
      console.error("Error fetching stock chart data:", error);
      res.status(500).json({ message: "Failed to fetch stock chart data" });
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

  // Get trading bot status
  app.get("/api/trading-bot/status", authenticate, async (req, res) => {
    try {
      const isActive = tradingBot.isBotActive();
      res.status(200).json({ active: isActive });
    } catch (error) {
      console.error("Error fetching trading bot status:", error);
      res.status(500).json({ message: "Failed to fetch trading bot status" });
    }
  });

  // Toggle trading bot status
  app.post("/api/trading-bot/toggle", authenticate, async (req, res) => {
    try {
      const isActive = tradingBot.toggleBotStatus();
      res.status(200).json({ active: isActive });
    } catch (error) {
      console.error("Error toggling trading bot status:", error);
      res.status(500).json({ message: "Failed to toggle trading bot status" });
    }
  });

  // Get trading decision for a stock
  app.get("/api/trading-bot/decision/:stockId", authenticate, async (req, res) => {
    try {
      const stockId = parseInt(req.params.stockId);
      const decision = await tradingBot.generateTradingDecision(stockId);
      res.status(200).json(decision);
    } catch (error) {
      console.error("Error generating trading decision:", error);
      res.status(500).json({ message: "Failed to generate trading decision" });
    }
  });

  // Set trading strategy
  app.post("/api/trading-bot/strategy", authenticate, async (req, res) => {
    try {
      const { strategy } = req.body;
      
      // Validate strategy
      if (!["MOVING_AVERAGE", "RSI", "MACD", "BOLLINGER", "REINFORCEMENT_LEARNING"].includes(strategy)) {
        return res.status(400).json({ message: "Invalid strategy" });
      }
      
      tradingBot.setStrategy(strategy as TradingStrategy);
      res.status(200).json({ strategy, success: true });
    } catch (error) {
      console.error("Error setting trading strategy:", error);
      res.status(500).json({ message: "Failed to set trading strategy" });
    }
  });

  // Execute a trade
  app.post("/api/trading-bot/execute-trade", authenticate, async (req, res) => {
    try {
      const { stockId, action, quantity } = req.body;
      const userId = req.user!.id;
      
      // Basic validation
      if (!stockId || !action || !quantity) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      // Validate action
      if (!["BUY", "SELL", "HOLD"].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }
      
      const success = await tradingBot.executeTrade(userId, stockId, action, quantity);
      
      if (success) {
        res.status(200).json({ success: true, message: "Trade executed successfully" });
      } else {
        res.status(400).json({ success: false, message: "Failed to execute trade" });
      }
    } catch (error) {
      console.error("Error executing trade:", error);
      res.status(500).json({ message: "Failed to execute trade" });
    }
  });

  // Update learning parameters
  app.post("/api/trading-bot/learning-parameters", authenticate, async (req, res) => {
    try {
      const { learningRate, explorationRate } = req.body;
      
      tradingBot.updateLearningParameters(learningRate, explorationRate);
      res.status(200).json({ 
        success: true, 
        message: "Learning parameters updated successfully"
      });
    } catch (error) {
      console.error("Error updating learning parameters:", error);
      res.status(500).json({ message: "Failed to update learning parameters" });
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
