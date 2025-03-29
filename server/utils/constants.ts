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

// Mock Chart Data
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
