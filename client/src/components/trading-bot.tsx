import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { LineChart } from "@/components/charts/line-chart";

interface PerformanceTimepoint {
  date: string;
  value: number;
  change: number;
}

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

interface TradingHistoryItem {
  id: number;
  userId: number;
  stockId: number;
  action: string;
  quantity: number;
  price: number;
  timestamp: string;
  profitLoss?: number;
  stock: {
    id: number;
    symbol: string;
    name: string;
    currentPrice: number;
    prevClosePrice: number;
    change: number;
    changePercent: number;
    updatedAt: string;
  };
}

export default function TradingBot() {
  const { data: performance, isLoading: isLoadingPerformance } = useQuery<BotPerformanceMetrics>({
    queryKey: ['/api/trading-bot/performance'],
  });

  const { data: tradingHistory, isLoading: isLoadingHistory } = useQuery<TradingHistoryItem[]>({
    queryKey: ['/api/trading-history'],
  });

  const exportData = () => {
    if (!performance || !tradingHistory) return;
    
    // In a real implementation, this would create a CSV file with the trading data
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Action,Symbol,Quantity,Price,Profit/Loss\n"
      + tradingHistory.map(item => {
          const date = new Date(item.timestamp).toLocaleDateString();
          return `${date},${item.action},${item.stock.symbol},${item.quantity},${item.price},${item.profitLoss || 0}`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trading_bot_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">AI Trading Bot</h2>
        <div className="flex space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
            Bot Active
          </span>
          <Button variant="outline" size="sm">
            Configure
          </Button>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Performance Overview</h3>
              <p className="mt-1 text-sm text-gray-500">Last updated: {new Date().toLocaleString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })} IST</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Select defaultValue="7days">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="ytd">Year to date</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center space-x-6">
                  {isLoadingPerformance ? (
                    <>
                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Return</p>
                        <p className="text-2xl font-semibold text-green-600">
                          +{performance?.totalReturnPercentage.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Win Rate</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {performance?.winRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Trades</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {performance?.totalTrades}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 md:mt-0">
                  <Button variant="outline" onClick={exportData} disabled={isLoadingPerformance || isLoadingHistory}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </div>
              
              <div className="relative h-80">
                {isLoadingPerformance ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : (
                  <LineChart 
                    data={performance?.performanceTimeline.map(point => ({
                      x: point.date,
                      y: point.value
                    })) || []}
                    xAxisKey="x"
                    yAxisKey="y"
                    color="#3B82F6"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Trading Activity</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoadingHistory ? (
                  Array(4).fill(0).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-28" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-12" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-20" />
                      </td>
                    </tr>
                  ))
                ) : (
                  tradingHistory?.map((trade) => (
                    <tr key={trade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {trade.stock.symbol}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        trade.action === "BUY" ? "text-green-600" : "text-red-600"
                      }`}>
                        {trade.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trade.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{trade.price.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(trade.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })} IST
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        (trade.profitLoss || 0) > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {(trade.profitLoss || 0) > 0 ? '+' : ''}
                        ₹{(trade.profitLoss || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
