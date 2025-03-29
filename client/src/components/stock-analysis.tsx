import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart } from "@/components/charts/line-chart";
import { RefreshCcw, Search } from "lucide-react";

interface Stock {
  id: number;
  symbol: string;
  name: string;
  currentPrice: number;
  prevClosePrice: number;
  change: number;
  changePercent: number;
  updatedAt: string;
}

interface StockPrediction {
  id: number;
  stockId: number;
  signal: string;
  confidence: number;
  targetPrice: number;
  expectedReturn: number;
  timeHorizon: string;
  createdAt: string;
  stock: Stock;
}

interface MarketSentiment {
  sentiment: string;
  sentimentScore: number;
  volatilityIndex: number;
  volatilityLevel: string;
  sectorStrength: number;
  sectorStrengthLevel: string;
  aiInsights: string;
  lastUpdated: string;
}

export default function StockAnalysis() {
  const { data: predictions, isLoading: isLoadingPredictions } = useQuery<StockPrediction[]>({
    queryKey: ['/api/predictions'],
  });

  const { data: sentiment, isLoading: isLoadingSentiment } = useQuery<MarketSentiment>({
    queryKey: ['/api/market/sentiment'],
  });

  // Generate mock chart data (this would be real data in production)
  const generateChartData = (stockId: number) => {
    const data = [];
    let value = 100;
    const days = 30;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Different trend based on stock ID for visual variation
      const trend = stockId % 3 === 0 ? -0.5 : (stockId % 2 === 0 ? 0 : 0.5);
      const randomChange = (Math.random() * 3 - 1 + trend) / 100;
      value = value * (1 + randomChange);
      
      data.push({
        x: date.toISOString().split('T')[0],
        y: Math.round(value * 100) / 100
      });
    }
    
    return data;
  };

  const formatSignal = (signal: string) => {
    return signal.replace('_', ' ');
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Stock Analysis & Predictions</h2>
      
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Top Predictions</h3>
              <p className="mt-1 text-sm text-gray-500">Based on reinforcement learning model signals</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search Stocks
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-5">
          {isLoadingPredictions ? (
            Array(2).fill(0).map((_, index) => (
              <Card key={index} className="border border-gray-200 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Skeleton className="h-6 w-24 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex flex-col items-end">
                      <Skeleton className="h-6 w-24 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <Skeleton className="h-6 w-28 rounded-full" />
                  </div>
                  
                  <div className="mt-4 relative h-40">
                    <Skeleton className="h-full w-full rounded" />
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <Skeleton className="h-4 w-16 mx-auto mb-1" />
                      <Skeleton className="h-5 w-20 mx-auto" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mx-auto mb-1" />
                      <Skeleton className="h-5 w-16 mx-auto" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16 mx-auto mb-1" />
                      <Skeleton className="h-5 w-20 mx-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            predictions?.slice(0, 2).map((prediction) => (
              <Card key={prediction.id} className="chart-card border border-gray-200 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{prediction.stock.symbol}</h4>
                      <p className="text-sm text-gray-500">{prediction.stock.name}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-semibold text-gray-900">
                        ₹{prediction.stock.currentPrice.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                      <span className={`text-sm font-medium ${
                        prediction.stock.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {prediction.stock.changePercent > 0 ? '+' : ''}
                        {prediction.stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      prediction.signal.includes('BUY') ? 'bg-green-100 text-green-800' : 
                      prediction.signal === 'HOLD' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {formatSignal(prediction.signal)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      Confidence: {prediction.confidence}%
                    </span>
                  </div>
                  
                  <div className="mt-4 relative h-40">
                    <LineChart 
                      data={generateChartData(prediction.stockId)}
                      xAxisKey="x"
                      yAxisKey="y"
                      color={prediction.signal.includes('BUY') ? '#059669' : 
                             prediction.signal === 'HOLD' ? '#F59E0B' : 
                             '#DC2626'}
                    />
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Target Price</p>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{prediction.targetPrice.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Expected Return</p>
                      <p className={`text-sm font-medium ${
                        prediction.expectedReturn > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {prediction.expectedReturn > 0 ? '+' : ''}
                        {prediction.expectedReturn.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Time Horizon</p>
                      <p className="text-sm font-medium text-gray-900">{prediction.timeHorizon}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div className="p-5 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Market Analysis</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center mb-4 space-y-2 md:space-y-0 md:space-x-6">
              {isLoadingSentiment ? (
                <>
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Market Sentiment</span>
                    <div className="flex items-center mt-1">
                      <div className="w-40 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
                          style={{ width: `${sentiment?.sentimentScore}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {sentiment?.sentiment} ({sentiment?.sentimentScore}%)
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Volatility Index</span>
                    <div className="flex items-center mt-1">
                      <div className="w-40 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-yellow-500 h-2.5 rounded-full" 
                          style={{ width: `${sentiment?.volatilityIndex}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {sentiment?.volatilityLevel} ({sentiment?.volatilityIndex}%)
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Sector Strength</span>
                    <div className="flex items-center mt-1">
                      <div className="w-40 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
                          style={{ width: `${sentiment?.sectorStrength}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {sentiment?.sectorStrengthLevel} ({sentiment?.sectorStrength}%)
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="relative h-60 mt-4">
              {isLoadingSentiment ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : (
                <div className="h-full rounded-lg overflow-hidden bg-white p-4 shadow-inner">
                  <div className="font-medium text-lg mb-2">Market Overview Chart</div>
                  <LineChart 
                    data={generateChartData(0)}
                    xAxisKey="x"
                    yAxisKey="y"
                    color="#3B82F6"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">AI Insights</h4>
              {isLoadingSentiment ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-gray-700 text-sm">{sentiment?.aiInsights}</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
