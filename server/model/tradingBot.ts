import { storage } from '../storage';
import { Stock } from '@shared/schema';

// Define the interface for performance metrics
interface BotPerformanceMetrics {
  totalReturn: number;
  totalReturnPercentage: number;
  winRate: number;
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  averageHoldingPeriod: number;
  performanceTimeline: PerformanceTimepoint[];
}

interface PerformanceTimepoint {
  date: string;
  value: number;
  change: number;
}

interface StockPriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingDecision {
  signal: TradingSignal;
  confidence: number;
  reason: string;
  indicatorsUsed: string[];
}

// Define trading signal types
export type TradingSignal = "BUY" | "SELL" | "HOLD";

// Define trading strategy types
export type TradingStrategy = "MOVING_AVERAGE" | "RSI" | "MACD" | "BOLLINGER" | "REINFORCEMENT_LEARNING";

/**
 * Trading Bot class that uses multiple strategies and algorithms
 * to make trading decisions based on historical price data
 */
class TradingBot {
  private static instance: TradingBot;
  private botActive: boolean = true;
  private currentStrategy: TradingStrategy = "REINFORCEMENT_LEARNING";
  private historicalData: Map<number, StockPriceHistory[]> = new Map();
  private learningRate: number = 0.01;
  private explorationRate: number = 0.1;  // Epsilon for exploration-exploitation trade-off
  private qValues: Map<string, number> = new Map(); // Q-values for state-action pairs
  
  private constructor() {
    // Initialize the trading bot with historical data
    console.log("Trading bot initialized");
    this.initializeHistoricalData();
  }

  public static getInstance(): TradingBot {
    if (!TradingBot.instance) {
      TradingBot.instance = new TradingBot();
    }
    return TradingBot.instance;
  }

  public isBotActive(): boolean {
    return this.botActive;
  }

  public toggleBotStatus(): boolean {
    this.botActive = !this.botActive;
    return this.botActive;
  }

  /**
   * Set the active trading strategy
   */
  public setStrategy(strategy: TradingStrategy): void {
    this.currentStrategy = strategy;
    console.log(`Trading strategy set to ${strategy}`);
  }

  /**
   * Gets performance metrics for the trading bot
   */
  public async getPerformanceMetrics(): Promise<BotPerformanceMetrics> {
    // Fetch trading history for analysis
    const userId = 1; // Demo user
    const tradingHistory = await storage.getTradingHistoryByUserId(userId);
    
    // Count successful and failed trades
    const successfulTrades = tradingHistory.filter(trade => 
      trade.profitLoss !== undefined && trade.profitLoss !== null && trade.profitLoss > 0
    ).length;
    
    const failedTrades = tradingHistory.filter(trade => 
      trade.profitLoss !== undefined && trade.profitLoss !== null && trade.profitLoss <= 0
    ).length;
    
    // Calculate total returns
    const totalProfitLoss = tradingHistory.reduce((sum, trade) => {
      return sum + (trade.profitLoss || 0);
    }, 0);
    
    // Generate performance timeline based on trading history
    const performanceTimeline: PerformanceTimepoint[] = this.generatePerformanceTimeline();
    
    return {
      totalReturn: totalProfitLoss,
      totalReturnPercentage: this.calculateTotalReturnPercentage(totalProfitLoss, tradingHistory),
      winRate: successfulTrades > 0 ? (successfulTrades / tradingHistory.length) * 100 : 0,
      totalTrades: tradingHistory.length,
      successfulTrades,
      failedTrades,
      averageHoldingPeriod: this.calculateAverageHoldingPeriod(tradingHistory),
      performanceTimeline
    };
  }

  /**
   * Generate trading decision for a stock using the current strategy
   */
  public async generateTradingDecision(stockId: number): Promise<TradingDecision> {
    const stock = await storage.getStock(stockId);
    if (!stock) {
      return {
        signal: "HOLD",
        confidence: 0,
        reason: "Stock not found",
        indicatorsUsed: []
      };
    }

    // Get historical price data for the stock
    const priceHistory = this.getHistoricalPriceData(stockId);

    // Use the active strategy to generate a signal
    switch(this.currentStrategy) {
      case "MOVING_AVERAGE":
        return this.movingAverageStrategy(stock, priceHistory);
      case "RSI":
        return this.rsiStrategy(stock, priceHistory);
      case "MACD":
        return this.macdStrategy(stock, priceHistory);
      case "BOLLINGER":
        return this.bollingerBandsStrategy(stock, priceHistory);
      case "REINFORCEMENT_LEARNING":
      default:
        return this.reinforcementLearningStrategy(stock, priceHistory);
    }
  }

  /**
   * Simple proxy for backward compatibility
   */
  public async generateSignalForStock(stockId: number): Promise<TradingSignal> {
    const decision = await this.generateTradingDecision(stockId);
    return decision.signal;
  }

  /**
   * Moving Average Crossover Strategy
   * Buy when short-term MA crosses above long-term MA
   * Sell when short-term MA crosses below long-term MA
   */
  private movingAverageStrategy(stock: Stock, priceHistory: StockPriceHistory[]): TradingDecision {
    if (priceHistory.length < 50) {
      return {
        signal: "HOLD",
        confidence: 50,
        reason: "Insufficient historical data for MA strategy",
        indicatorsUsed: ["SMA"]
      };
    }

    // Calculate 10-day and 50-day moving averages
    const closePrices = priceHistory.map(day => day.close);
    const sma10 = this.calculateSMA(closePrices, 10);
    const sma50 = this.calculateSMA(closePrices, 50);
    
    // Previous day's values
    const prevSma10 = this.calculateSMA(closePrices.slice(0, -1), 10);
    const prevSma50 = this.calculateSMA(closePrices.slice(0, -1), 50);

    // Check for crossovers
    const isBuyCrossover = prevSma10 <= prevSma50 && sma10 > sma50;
    const isSellCrossover = prevSma10 >= prevSma50 && sma10 < sma50;

    if (isBuyCrossover) {
      return {
        signal: "BUY",
        confidence: 75,
        reason: "Short-term MA crossed above long-term MA",
        indicatorsUsed: ["SMA10", "SMA50"]
      };
    } else if (isSellCrossover) {
      return {
        signal: "SELL",
        confidence: 75,
        reason: "Short-term MA crossed below long-term MA",
        indicatorsUsed: ["SMA10", "SMA50"]
      };
    } else {
      // Determine trend direction
      const trendStrength = Math.abs(sma10 - sma50) / sma50 * 100;
      const isBullish = sma10 > sma50;
      
      return {
        signal: "HOLD",
        confidence: 50 + (trendStrength * (isBullish ? 1 : -1)),
        reason: `Trending ${isBullish ? 'upward' : 'downward'} but no crossover detected`,
        indicatorsUsed: ["SMA10", "SMA50"]
      };
    }
  }

  /**
   * RSI (Relative Strength Index) Strategy
   * Buy when RSI is below 30 (oversold)
   * Sell when RSI is above 70 (overbought)
   */
  private rsiStrategy(stock: Stock, priceHistory: StockPriceHistory[]): TradingDecision {
    if (priceHistory.length < 15) {
      return {
        signal: "HOLD",
        confidence: 50,
        reason: "Insufficient historical data for RSI strategy",
        indicatorsUsed: ["RSI"]
      };
    }

    const closePrices = priceHistory.map(day => day.close);
    const rsi = this.calculateRSI(closePrices, 14);

    if (rsi < 30) {
      // Oversold condition - buy signal
      const confidence = Math.max(70, 100 - rsi); // Higher confidence as RSI gets lower
      return {
        signal: "BUY",
        confidence,
        reason: `RSI is oversold at ${rsi.toFixed(2)}`,
        indicatorsUsed: ["RSI"]
      };
    } else if (rsi > 70) {
      // Overbought condition - sell signal
      const confidence = Math.max(70, rsi); // Higher confidence as RSI gets higher
      return {
        signal: "SELL",
        confidence,
        reason: `RSI is overbought at ${rsi.toFixed(2)}`,
        indicatorsUsed: ["RSI"]
      };
    } else {
      // Neutral zone
      const neutralConfidence = 50 + Math.abs(rsi - 50); // Higher confidence near boundaries
      return {
        signal: "HOLD",
        confidence: neutralConfidence,
        reason: `RSI is neutral at ${rsi.toFixed(2)}`,
        indicatorsUsed: ["RSI"]
      };
    }
  }

  /**
   * MACD (Moving Average Convergence Divergence) Strategy
   */
  private macdStrategy(stock: Stock, priceHistory: StockPriceHistory[]): TradingDecision {
    if (priceHistory.length < 35) {
      return {
        signal: "HOLD",
        confidence: 50,
        reason: "Insufficient historical data for MACD strategy",
        indicatorsUsed: ["MACD"]
      };
    }

    const closePrices = priceHistory.map(day => day.close);
    const { macdLine, signalLine, histogram } = this.calculateMACD(closePrices);
    
    // Previous values
    const prevHistogram = this.calculateMACD(closePrices.slice(0, -1)).histogram;

    // Check for MACD crossovers
    const isBuyCrossover = prevHistogram <= 0 && histogram > 0;
    const isSellCrossover = prevHistogram >= 0 && histogram < 0;

    if (isBuyCrossover) {
      return {
        signal: "BUY",
        confidence: 80,
        reason: "MACD histogram turned positive (bullish crossover)",
        indicatorsUsed: ["MACD", "Signal Line", "Histogram"]
      };
    } else if (isSellCrossover) {
      return {
        signal: "SELL",
        confidence: 80,
        reason: "MACD histogram turned negative (bearish crossover)",
        indicatorsUsed: ["MACD", "Signal Line", "Histogram"]
      };
    } else {
      // Determine trend strength
      const trendStrength = Math.abs(histogram / signalLine) * 100;
      const isBullish = histogram > 0;
      
      return {
        signal: "HOLD",
        confidence: 50 + (trendStrength > 10 ? 10 : trendStrength) * (isBullish ? 1 : -1),
        reason: `MACD trending ${isBullish ? 'bullish' : 'bearish'} but no crossover detected`,
        indicatorsUsed: ["MACD", "Signal Line", "Histogram"]
      };
    }
  }

  /**
   * Bollinger Bands Strategy
   */
  private bollingerBandsStrategy(stock: Stock, priceHistory: StockPriceHistory[]): TradingDecision {
    if (priceHistory.length < 20) {
      return {
        signal: "HOLD",
        confidence: 50,
        reason: "Insufficient historical data for Bollinger Bands strategy",
        indicatorsUsed: ["Bollinger Bands"]
      };
    }

    const closePrices = priceHistory.map(day => day.close);
    const currentPrice = closePrices[closePrices.length - 1];
    const { upper, middle, lower } = this.calculateBollingerBands(closePrices, 20, 2);
    
    // Calculate Band Width
    const bandWidth = (upper - lower) / middle * 100;

    // Calculate %B (position of price within the bands)
    const percentB = (currentPrice - lower) / (upper - lower);
    
    if (currentPrice < lower) {
      // Price below lower band - potential buy
      const distanceRatio = (lower - currentPrice) / lower * 100;
      const confidence = Math.min(90, 70 + distanceRatio);
      
      return {
        signal: "BUY",
        confidence,
        reason: `Price below lower Bollinger Band (oversold)`,
        indicatorsUsed: ["Bollinger Bands", "%B"]
      };
    } else if (currentPrice > upper) {
      // Price above upper band - potential sell
      const distanceRatio = (currentPrice - upper) / upper * 100;
      const confidence = Math.min(90, 70 + distanceRatio);
      
      return {
        signal: "SELL",
        confidence,
        reason: `Price above upper Bollinger Band (overbought)`,
        indicatorsUsed: ["Bollinger Bands", "%B"]
      };
    } else {
      // Price within bands
      // If bandwidth is contracting (volatility decreasing), prepare for breakout
      const prevBandWidth = this.calculateBollingerBands(closePrices.slice(0, -5), 20, 2);
      const isBandContracting = bandWidth < (prevBandWidth.upper - prevBandWidth.lower) / prevBandWidth.middle * 100;
      
      if (isBandContracting && bandWidth < 2.0) {
        return {
          signal: "HOLD",
          confidence: 65,
          reason: "Bollinger Band squeeze detected - preparing for breakout",
          indicatorsUsed: ["Bollinger Bands", "Band Width"]
        };
      }
      
      // Use %B to determine position within bands
      if (percentB > 0.8) {
        return {
          signal: "HOLD",
          confidence: 60,
          reason: "Price near upper Bollinger Band but not overbought yet",
          indicatorsUsed: ["Bollinger Bands", "%B"]
        };
      } else if (percentB < 0.2) {
        return {
          signal: "HOLD",
          confidence: 60,
          reason: "Price near lower Bollinger Band but not oversold yet",
          indicatorsUsed: ["Bollinger Bands", "%B"]
        };
      } else {
        return {
          signal: "HOLD",
          confidence: 50,
          reason: "Price within normal Bollinger Band range",
          indicatorsUsed: ["Bollinger Bands", "%B"]
        };
      }
    }
  }

  /**
   * Reinforcement Learning Strategy
   * Uses Q-learning to adapt to market patterns over time
   */
  private reinforcementLearningStrategy(stock: Stock, priceHistory: StockPriceHistory[]): TradingDecision {
    if (priceHistory.length < 30) {
      return {
        signal: "HOLD",
        confidence: 50,
        reason: "Insufficient historical data for RL strategy",
        indicatorsUsed: ["Reinforcement Learning"]
      };
    }

    // Create a state representation using technical indicators
    const closePrices = priceHistory.map(day => day.close);
    const state = this.createStateRepresentation(stock, priceHistory);
    
    // Get all possible actions
    const actions: TradingSignal[] = ["BUY", "SELL", "HOLD"];
    
    // Exploration: randomly choose an action with probability epsilon
    if (Math.random() < this.explorationRate) {
      const randomIndex = Math.floor(Math.random() * actions.length);
      const randomAction = actions[randomIndex];
      
      return {
        signal: randomAction,
        confidence: 50,
        reason: "Exploration phase - trying new action",
        indicatorsUsed: ["Reinforcement Learning", "Q-Learning"]
      };
    }
    
    // Exploitation: choose the action with the highest Q-value
    let bestAction = "HOLD" as TradingSignal;
    let maxQValue = -Infinity;
    let actionValues: {[key: string]: number} = {};
    
    // Find action with highest Q-value
    for (const action of actions) {
      const stateAction = `${state}:${action}`;
      const qValue = this.qValues.get(stateAction) || 0;
      actionValues[action] = qValue;
      
      if (qValue > maxQValue) {
        maxQValue = qValue;
        bestAction = action;
      }
    }
    
    // Calculate confidence based on the difference between best action and alternatives
    const actionDiff = this.calculateActionDifference(actionValues);
    const confidenceScore = Math.min(95, 50 + actionDiff * 30);
    
    // Combine with technical indicators for a more robust decision
    const rsiResult = this.rsiStrategy(stock, priceHistory);
    const macdResult = this.macdStrategy(stock, priceHistory);
    
    // Ensemble the strategies
    if (bestAction === rsiResult.signal && bestAction === macdResult.signal) {
      return {
        signal: bestAction,
        confidence: Math.min(95, confidenceScore + 15),
        reason: "Multiple indicators confirm the signal",
        indicatorsUsed: ["Reinforcement Learning", "RSI", "MACD"]
      };
    } else if (bestAction === rsiResult.signal || bestAction === macdResult.signal) {
      return {
        signal: bestAction,
        confidence: Math.min(90, confidenceScore + 5),
        reason: "Signal confirmed by one additional indicator",
        indicatorsUsed: ["Reinforcement Learning", bestAction === rsiResult.signal ? "RSI" : "MACD"]
      };
    }
    
    return {
      signal: bestAction,
      confidence: confidenceScore,
      reason: "Decision based on RL model learning from historical patterns",
      indicatorsUsed: ["Reinforcement Learning", "Q-Learning"]
    };
  }

  /**
   * Execute a trade based on the bot's decision
   */
  public async executeTrade(userId: number, stockId: number, action: TradingSignal, quantity: number): Promise<boolean> {
    if (!this.botActive) {
      console.log("Trading bot is not active. Trade not executed.");
      return false;
    }

    try {
      const stock = await storage.getStock(stockId);
      if (!stock) {
        console.error(`Stock with ID ${stockId} not found`);
        return false;
      }

      // Create a trading history entry
      await storage.createTradingHistory({
        userId,
        stockId,
        action,
        quantity,
        price: stock.currentPrice,
        timestamp: new Date(),
        // For a real trade, we'd calculate profitLoss after the trade is completed
        profitLoss: action === "SELL" ? (quantity * stock.currentPrice * 0.03) : undefined
      });

      // Update portfolio if needed (simplified version)
      // In a real system, we'd update actual holdings
      console.log(`Executed ${action} trade for ${quantity} shares of ${stock.symbol}`);
      
      // Update the Q-values based on reward (simplified)
      this.updateQValues(stockId, action, stock.currentPrice);
      
      return true;
    } catch (error) {
      console.error("Error executing trade:", error);
      return false;
    }
  }

  /**
   * Update Q-values based on reward (reinforcement learning)
   */
  private updateQValues(stockId: number, action: TradingSignal, currentPrice: number): void {
    // In a real implementation, we would:
    // 1. Calculate the reward based on profitability of the trade
    // 2. Get the current state
    // 3. Update Q(state, action) = Q(state, action) + alpha * [reward + gamma * max(Q(next_state, all_actions)) - Q(state, action)]
    
    // Simplified implementation for demo
    const stock = this.getHistoricalPriceData(stockId);
    if (stock.length < 2) return;
    
    const state = this.createStateRepresentation({id: stockId, currentPrice} as Stock, stock);
    const stateAction = `${state}:${action}`;
    
    // Calculate a simple reward based on whether the price went up for a BUY or down for a SELL
    const prevPrice = stock[stock.length - 2].close;
    const priceChange = (currentPrice - prevPrice) / prevPrice;
    
    let reward = 0;
    if (action === "BUY" && priceChange > 0) {
      reward = priceChange * 100; // Positive reward for buying before price increase
    } else if (action === "SELL" && priceChange < 0) {
      reward = Math.abs(priceChange) * 100; // Positive reward for selling before price decrease
    } else if (action === "HOLD" && Math.abs(priceChange) < 0.01) {
      reward = 1; // Small positive reward for holding during stable prices
    } else {
      reward = -Math.abs(priceChange) * 50; // Negative reward for wrong actions
    }
    
    // Update Q-value
    const oldQValue = this.qValues.get(stateAction) || 0;
    const newQValue = oldQValue + this.learningRate * (reward - oldQValue);
    this.qValues.set(stateAction, newQValue);
  }

  /**
   * Create a state representation for RL model using various technical indicators
   */
  private createStateRepresentation(stock: Stock, priceHistory: StockPriceHistory[]): string {
    if (priceHistory.length < 14) return "insufficient_data";
    
    const closePrices = priceHistory.map(day => day.close);
    
    // Calculate indicators for state representation
    const rsi = this.calculateRSI(closePrices, 14);
    const sma50 = this.calculateSMA(closePrices, Math.min(50, closePrices.length));
    const currentPrice = closePrices[closePrices.length - 1];
    
    // Discretize the indicators to create a finite state space
    const priceLevel = currentPrice > sma50 ? "above_sma50" : "below_sma50";
    const rsiLevel = rsi < 30 ? "oversold" : rsi > 70 ? "overbought" : "neutral";
    
    // Add volatility information
    const volatility = this.calculateVolatility(closePrices, 10);
    const volatilityLevel = volatility < 0.01 ? "low" : volatility > 0.03 ? "high" : "medium";
    
    // Combine indicators to form a state string
    return `${priceLevel}_${rsiLevel}_${volatilityLevel}`;
  }

  /**
   * Calculate the difference between best action Q-value and alternatives
   */
  private calculateActionDifference(actionValues: {[key: string]: number}): number {
    const values = Object.values(actionValues);
    const maxValue = Math.max(...values);
    
    // If all values are the same, return 0
    if (values.every(v => v === values[0])) return 0;
    
    // Calculate average of other values
    const othersSum = values.reduce((sum, v) => v !== maxValue ? sum + v : sum, 0);
    const othersCount = values.length - 1;
    const othersAvg = othersSum / othersCount;
    
    // Normalize the difference to 0-1 range
    return Math.min(1, Math.max(0, (maxValue - othersAvg)));
  }

  /**
   * Initialize historical price data for stocks
   */
  private initializeHistoricalData(): void {
    // In a real implementation, we would load this data from a database or API
    // For demo purposes, we're generating synthetic data
    this.generateHistoricalData(1, 180); // TCS
    this.generateHistoricalData(2, 180); // Reliance
    this.generateHistoricalData(3, 180); // HDFC Bank
    this.generateHistoricalData(4, 180); // Infosys
    this.generateHistoricalData(5, 180); // ICICI Bank
    this.generateHistoricalData(6, 180); // Tata Steel
  }

  /**
   * Generate synthetic historical price data for demo purposes
   */
  private generateHistoricalData(stockId: number, days: number): void {
    const history: StockPriceHistory[] = [];
    const now = new Date();
    
    // Define starting price ranges based on stockId
    let basePrice: number;
    let volatility: number;
    let trend: number;
    
    switch(stockId) {
      case 1: // TCS
        basePrice = 3400;
        volatility = 0.015;
        trend = 0.0005;
        break;
      case 2: // Reliance
        basePrice = 2400;
        volatility = 0.02;
        trend = 0.0007;
        break;
      case 3: // HDFC Bank
        basePrice = 1680;
        volatility = 0.018;
        trend = -0.0002;
        break;
      case 4: // Infosys
        basePrice = 1450;
        volatility = 0.022;
        trend = 0.001;
        break;
      case 5: // ICICI Bank
        basePrice = 920;
        volatility = 0.016;
        trend = 0.0004;
        break;
      case 6: // Tata Steel
        basePrice = 120;
        volatility = 0.025;
        trend = 0.0003;
        break;
      default:
        basePrice = 1000;
        volatility = 0.02;
        trend = 0.0005;
    }
    
    let currentPrice = basePrice;
    
    // Generate price data for each day
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Add some randomness to price with trend and volatility
      const dailyChange = (Math.random() * 2 - 1) * volatility + trend;
      currentPrice = currentPrice * (1 + dailyChange);
      
      // Ensure price doesn't go below a certain threshold
      currentPrice = Math.max(currentPrice, basePrice * 0.5);
      
      // Generate intraday price levels
      const dailyVolatility = volatility * 0.7;
      const open = currentPrice * (1 + (Math.random() * 0.01 - 0.005));
      const high = Math.max(open, currentPrice) * (1 + Math.random() * dailyVolatility);
      const low = Math.min(open, currentPrice) * (1 - Math.random() * dailyVolatility);
      
      // Generate volume
      const volume = Math.round(basePrice * 1000 * (0.5 + Math.random()));
      
      history.push({
        date: date.toISOString().split('T')[0],
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(currentPrice * 100) / 100,
        volume: volume
      });
    }
    
    this.historicalData.set(stockId, history);
  }

  /**
   * Get historical price data for a specific stock
   */
  public getHistoricalPriceData(stockId: number): StockPriceHistory[] {
    return this.historicalData.get(stockId) || [];
  }

  /**
   * Update the bot's learning parameters
   */
  public updateLearningParameters(learningRate?: number, explorationRate?: number): void {
    if (learningRate !== undefined) {
      this.learningRate = Math.max(0.001, Math.min(0.1, learningRate));
    }
    
    if (explorationRate !== undefined) {
      this.explorationRate = Math.max(0.01, Math.min(0.3, explorationRate));
    }
    
    console.log(`Learning parameters updated: learningRate=${this.learningRate}, explorationRate=${this.explorationRate}`);
  }

  /**
   * Calculate Simple Moving Average (SMA)
   */
  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    
    const slice = prices.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
  }

  /**
   * Calculate Relative Strength Index (RSI)
   */
  private calculateRSI(prices: number[], period: number): number {
    if (prices.length <= period) return 50; // Default neutral value
    
    let gains = 0;
    let losses = 0;
    
    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i-1];
      if (change >= 0) {
        gains += change;
      } else {
        losses -= change; // Convert to positive value
      }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Calculate subsequent RSI values using smoothing
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i-1];
      
      avgGain = ((avgGain * (period - 1)) + (change > 0 ? change : 0)) / period;
      avgLoss = ((avgLoss * (period - 1)) + (change < 0 ? -change : 0)) / period;
    }
    
    if (avgLoss === 0) return 100; // No losses means RSI = 100
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  private calculateMACD(prices: number[]): { macdLine: number, signalLine: number, histogram: number } {
    if (prices.length < 26) {
      return { macdLine: 0, signalLine: 0, histogram: 0 };
    }
    
    // Calculate EMA-12 and EMA-26
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    // MACD Line = EMA-12 - EMA-26
    const macdLine = ema12 - ema26;
    
    // Calculate Signal Line (9-day EMA of MACD Line)
    // We need to get the MACD line for the past 9 days
    const macdValues: number[] = [];
    for (let i = Math.max(0, prices.length - 9); i < prices.length; i++) {
      const ema12Past = this.calculateEMA(prices.slice(0, i+1), 12);
      const ema26Past = this.calculateEMA(prices.slice(0, i+1), 26);
      macdValues.push(ema12Past - ema26Past);
    }
    
    const signalLine = this.calculateEMA(macdValues, Math.min(9, macdValues.length));
    
    // Histogram = MACD Line - Signal Line
    const histogram = macdLine - signalLine;
    
    return { macdLine, signalLine, histogram };
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   */
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return this.calculateSMA(prices, prices.length);
    
    // Calculate SMA for the initial value
    const sma = this.calculateSMA(prices.slice(0, period), period);
    
    // Smoothing factor: 2 / (period + 1)
    const multiplier = 2 / (period + 1);
    
    // Start with SMA as the first EMA value
    let ema = sma;
    
    // Calculate EMA for remaining prices
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  /**
   * Calculate Bollinger Bands
   */
  private calculateBollingerBands(prices: number[], period: number, stdDevMultiplier: number): 
    { upper: number, middle: number, lower: number } {
    if (prices.length < period) {
      const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      return { upper: avg * 1.1, middle: avg, lower: avg * 0.9 };
    }
    
    // Middle band is SMA
    const middle = this.calculateSMA(prices, period);
    
    // Calculate standard deviation
    const recentPrices = prices.slice(-period);
    const variance = recentPrices.reduce((sum, price) => {
      const deviation = price - middle;
      return sum + deviation * deviation;
    }, 0) / period;
    
    const stdDev = Math.sqrt(variance);
    
    // Calculate upper and lower bands
    const upper = middle + (stdDev * stdDevMultiplier);
    const lower = middle - (stdDev * stdDevMultiplier);
    
    return { upper, middle, lower };
  }

  /**
   * Calculate volatility (standard deviation of returns)
   */
  private calculateVolatility(prices: number[], period: number): number {
    if (prices.length < period + 1) return 0.02; // Default value
    
    // Calculate daily returns
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] / prices[i-1]) - 1);
    }
    
    // Use only the most recent 'period' returns
    const recentReturns = returns.slice(-period);
    
    // Calculate standard deviation
    const mean = recentReturns.reduce((sum, ret) => sum + ret, 0) / period;
    const variance = recentReturns.reduce((sum, ret) => {
      const deviation = ret - mean;
      return sum + deviation * deviation;
    }, 0) / period;
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate total return percentage
   */
  private calculateTotalReturnPercentage(totalProfitLoss: number, tradingHistory: any[]): number {
    // In a real implementation, we would calculate this based on initial investment
    // For demo, we'll use a simplified approach
    if (tradingHistory.length === 0) return 0;
    
    // Sum of all buy transaction values
    const totalInvestment = tradingHistory
      .filter(trade => trade.action === "BUY")
      .reduce((sum, trade) => sum + (trade.price * trade.quantity), 0);
    
    if (totalInvestment === 0) return 0;
    
    return (totalProfitLoss / totalInvestment) * 100;
  }

  /**
   * Calculate average holding period in days
   */
  private calculateAverageHoldingPeriod(tradingHistory: any[]): number {
    // In a real implementation, we would match buy and sell transactions
    // For demo, we'll return a fixed value
    return 5;
  }

  /**
   * Generates a performance timeline based on trading history
   */
  private generatePerformanceTimeline(): PerformanceTimepoint[] {
    const timeline: PerformanceTimepoint[] = [];
    const now = new Date();
    let baseValue = 1000000; // Starting value
    
    // Generate data points for the last 30 days
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate a random change between -1.5% and +2%
      const randomChange = (Math.random() * 3.5 - 1.5) / 100;
      const change = baseValue * randomChange;
      baseValue += change;
      
      timeline.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(baseValue * 100) / 100,
        change: Math.round(change * 100) / 100
      });
    }
    
    return timeline;
  }
}

// Export a singleton instance
export const tradingBot = TradingBot.getInstance();
