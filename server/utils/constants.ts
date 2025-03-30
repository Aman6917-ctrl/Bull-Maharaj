// Index Data (Updated as of March 29, 2024)
export const MARKET_INDICES = {
  SENSEX: {
    name: "SENSEX",
    value: 74265.63,
    change: 533.64,
    changePercent: 0.72
  },
  NIFTY: {
    name: "NIFTY",
    value: 22503.30,
    change: 148.95,
    changePercent: 0.67
  },
  BANKNIFTY: {
    name: "BANKNIFTY",
    value: 47721.30,
    change: 320.45,
    changePercent: 0.68
  },
  INR_USD: {
    name: "INR/USD",
    value: 83.42,
    change: -0.05,
    changePercent: -0.06
  }
};

// Define the stock info type
export interface StockInfo {
  baseValue: number;
  volatility: number;
  trend: number;
}

// Indian Stock Data - Updated with current market prices (as of March 29, 2024)
export const INDIAN_STOCKS: Record<string, StockInfo> = {
  "TCS": {
    baseValue: 3945.55,
    volatility: 0.015,
    trend: 0.0005
  },
  "RELIANCE": {
    baseValue: 2918.95,
    volatility: 0.02,
    trend: 0.0008
  },
  "HDFCBANK": {
    baseValue: 1549.40,
    volatility: 0.018,
    trend: 0.0004
  },
  "INFY": {
    baseValue: 1677.95,
    volatility: 0.022,
    trend: 0.0006
  },
  "ICICIBANK": {
    baseValue: 1033.10,
    volatility: 0.016,
    trend: 0.0007
  },
  "TATASTEEL": {
    baseValue: 164.80,
    volatility: 0.025,
    trend: 0.0003
  },
  "WIPRO": {
    baseValue: 493.60,
    volatility: 0.020,
    trend: 0.0002
  },
  "HCLTECH": {
    baseValue: 1541.70,
    volatility: 0.021,
    trend: 0.0004
  },
  "BAJFINANCE": {
    baseValue: 6912.35,
    volatility: 0.025,
    trend: 0.0006
  },
  "SUNPHARMA": {
    baseValue: 1335.90,
    volatility: 0.018,
    trend: 0.0003
  },
  "ADANIPORTS": {
    baseValue: 1314.95,
    volatility: 0.026,
    trend: 0.0008
  },
  "ADANIENT": {
    baseValue: 887.10,
    volatility: 0.028,
    trend: 0.0010
  },
  "ASIANPAINT": {
    baseValue: 2885.25,
    volatility: 0.017,
    trend: 0.0003
  },
  "AXISBANK": {
    baseValue: 1052.50,
    volatility: 0.019,
    trend: 0.0005
  },
  "JSWSTEEL": {
    baseValue: 968.35,
    volatility: 0.024,
    trend: 0.0002
  }
};

// Market Sentiment (Updated as of March 29, 2024)
export const MARKET_SENTIMENT = {
  sentiment: "BULLISH",
  sentimentScore: 73,
  volatilityIndex: 38,
  volatilityLevel: "MODERATE",
  sectorStrength: 82,
  sectorStrengthLevel: "STRONG",
  aiInsights: "Our reinforcement learning model indicates a sustained bullish trend for Indian markets, with NIFTY and SENSEX continuing their upward momentum. IT and Banking sectors show strong performance based on recent Q4 earnings expectations and global tech rally. The model suggests increasing exposure to IT, financial services, and select pharma stocks. Technical indicators show strong support for NIFTY at 22,200 with resistance around 22,800. The trading bot's reinforcement learning algorithms detect a high probability (76%) of continued uptrend in the next 2-3 weeks with moderate volatility."
};

// Sector Performance (Updated as of March 29, 2024)
export const SECTOR_PERFORMANCE = {
  "IT": {
    performance: 4.8,
    outlook: "POSITIVE",
    topPicks: ["TCS", "INFY", "HCLTECH"]
  },
  "BANKING": {
    performance: 2.9,
    outlook: "POSITIVE",
    topPicks: ["HDFCBANK", "ICICIBANK", "AXISBANK"]
  },
  "ENERGY": {
    performance: 1.7,
    outlook: "NEUTRAL",
    topPicks: ["RELIANCE", "ADANIENT", "NTPC"]
  },
  "PHARMA": {
    performance: 3.5,
    outlook: "POSITIVE",
    topPicks: ["SUNPHARMA", "DRREDDY", "CIPLA"]
  },
  "METALS": {
    performance: 0.8,
    outlook: "NEUTRAL",
    topPicks: ["TATASTEEL", "JSWSTEEL", "HINDALCO"]
  },
  "FMCG": {
    performance: 1.5,
    outlook: "POSITIVE",
    topPicks: ["HINDUNILVR", "ITC", "NESTLEIND"]
  },
  "AUTO": {
    performance: 2.1,
    outlook: "POSITIVE",
    topPicks: ["MARUTI", "TATAMOTORS", "M&M"]
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
