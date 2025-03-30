// Index Data
export const MARKET_INDICES = {
  SENSEX: {
    name: "SENSEX",
    value: 65214.50,
    change: 273.90,
    changePercent: 0.42
  },
  NIFTY: {
    name: "NIFTY",
    value: 19634.25,
    change: 70.68,
    changePercent: 0.36
  },
  BANKNIFTY: {
    name: "BANKNIFTY",
    value: 42865.75,
    change: -51.44,
    changePercent: -0.12
  },
  INR_USD: {
    name: "INR/USD",
    value: 82.41,
    change: 0.12,
    changePercent: 0.15
  }
};

// Define the stock info type
export interface StockInfo {
  baseValue: number;
  volatility: number;
  trend: number;
}

// Indian Stock Data - Realistic base values for known stocks
export const INDIAN_STOCKS: Record<string, StockInfo> = {
  "TCS": {
    baseValue: 3450.25,
    volatility: 0.015,
    trend: 0.0004
  },
  "RELIANCE": {
    baseValue: 2355.80,
    volatility: 0.02,
    trend: 0.0006
  },
  "HDFCBANK": {
    baseValue: 1685.30,
    volatility: 0.018,
    trend: -0.0002
  },
  "INFY": {
    baseValue: 1420.40,
    volatility: 0.022,
    trend: 0.0008
  },
  "ICICIBANK": {
    baseValue: 918.75,
    volatility: 0.016,
    trend: 0.0005
  },
  "TATASTEEL": {
    baseValue: 118.65,
    volatility: 0.025,
    trend: 0.0003
  },
  "WIPRO": {
    baseValue: 408.50,
    volatility: 0.020,
    trend: 0.0001
  },
  "HCLTECH": {
    baseValue: 1132.15,
    volatility: 0.021,
    trend: 0.0007
  },
  "BAJFINANCE": {
    baseValue: 6850.25,
    volatility: 0.025,
    trend: 0.0004
  },
  "SUNPHARMA": {
    baseValue: 1050.40,
    volatility: 0.018,
    trend: 0.0002
  }
};

// Market Sentiment
export const MARKET_SENTIMENT = {
  sentiment: "BULLISH",
  sentimentScore: 65,
  volatilityIndex: 42,
  volatilityLevel: "MODERATE",
  sectorStrength: 78,
  sectorStrengthLevel: "STRONG",
  aiInsights: "Our reinforcement learning model indicates a bullish trend continuing for IT and Banking sectors based on positive Q2 results and anticipated rate cuts. The model suggests reducing exposure to metals and commodities due to global demand concerns. Technical indicators show strong support levels for the NIFTY at 19,450."
};

// Sector Performance
export const SECTOR_PERFORMANCE = {
  "IT": {
    performance: 3.2,
    outlook: "POSITIVE",
    topPicks: ["TCS", "INFY", "WIPRO"]
  },
  "BANKING": {
    performance: 1.8,
    outlook: "POSITIVE",
    topPicks: ["HDFCBANK", "ICICIBANK", "KOTAKBANK"]
  },
  "ENERGY": {
    performance: 0.5,
    outlook: "NEUTRAL",
    topPicks: ["RELIANCE", "ONGC", "NTPC"]
  },
  "PHARMA": {
    performance: 2.1,
    outlook: "POSITIVE",
    topPicks: ["SUNPHARMA", "DRREDDY", "CIPLA"]
  },
  "METALS": {
    performance: -1.5,
    outlook: "NEGATIVE",
    topPicks: ["TATASTEEL", "JSWSTEEL", "HINDALCO"]
  }
};

// Generate Chart Data with more realistic parameters
export const generateChartData = (days: number, trend: "up" | "down" | "volatile" = "up") => {
  const data = [];
  let baseValue = 100;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    let randomChange;
    if (trend === "up") {
      randomChange = (Math.random() * 3 - 0.5) / 100; // Mostly positive
    } else if (trend === "down") {
      randomChange = (Math.random() * 3 - 2.5) / 100; // Mostly negative
    } else {
      randomChange = (Math.random() * 6 - 3) / 100; // Volatile
    }
    
    baseValue = baseValue * (1 + randomChange);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(baseValue * 100) / 100
    });
  }
  
  return data;
};

// Generate OHLCV Data for a stock (Open, High, Low, Close, Volume)
export const generateOHLCVData = (
  symbol: string,
  days: number = 180
) => {
  const data = [];
  const now = new Date();
  
  // Get base parameters for the stock or use defaults
  const stockInfo = INDIAN_STOCKS[symbol] || {
    baseValue: 1000,
    volatility: 0.02,
    trend: 0.0001
  };
  
  let currentPrice = stockInfo.baseValue;
  const volatility = stockInfo.volatility;
  const trendBias = stockInfo.trend;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add market-wide events at specific dates
    let eventMultiplier = 1;
    
    // Examples of market events:
    // Budget day volatility
    if (i % 60 === 0) eventMultiplier = 1.5;
    
    // Quarterly results - increased volatility every 90 days
    if (i % 90 === 0) eventMultiplier = 1.3;
    
    // RBI policy announcements - slight trend change every 45 days
    if (i % 45 === 0) eventMultiplier = 1.2;
    
    // Daily random change with trend bias
    const dailyChange = (Math.random() * 2 - 1) * volatility * eventMultiplier + trendBias;
    currentPrice = currentPrice * (1 + dailyChange);
    
    // Ensure price doesn't go below a minimum threshold
    currentPrice = Math.max(currentPrice, stockInfo.baseValue * 0.6);
    
    // Generate intraday variation
    const openOffset = (Math.random() * 0.01 - 0.005);
    const open = currentPrice * (1 + openOffset);
    
    const highOffset = Math.random() * volatility * 0.7;
    const high = Math.max(open, currentPrice) * (1 + highOffset);
    
    const lowOffset = Math.random() * volatility * 0.7;
    const low = Math.min(open, currentPrice) * (1 - lowOffset);
    
    // Volume varies based on price movement
    const volumeBase = stockInfo.baseValue * 500;
    const volumeMultiplier = 0.5 + Math.abs(dailyChange) * 50 + Math.random();
    const volume = Math.round(volumeBase * volumeMultiplier);
    
    // Skip weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(currentPrice.toFixed(2)),
      volume: volume
    });
  }
  
  return data;
};
