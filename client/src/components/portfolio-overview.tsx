import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart } from "@/components/charts/line-chart";
import { PieChart } from "@/components/charts/pie-chart";

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

interface PortfolioItem {
  id: number;
  userId: number;
  stockId: number;
  quantity: number;
  avgPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  stock: Stock;
}

export default function PortfolioOverview() {
  const { data: portfolio, isLoading } = useQuery<PortfolioItem[]>({
    queryKey: ['/api/portfolio'],
  });

  // Calculate total portfolio value and P&L
  const totalValue = portfolio?.reduce((sum, item) => sum + item.currentValue, 0) || 0;
  const totalProfitLoss = portfolio?.reduce((sum, item) => sum + item.profitLoss, 0) || 0;
  const totalProfitLossPercent = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0;

  // Generate portfolio value chart data (this would be real data in production)
  const generatePortfolioValueData = () => {
    const data = [];
    let value = totalValue - totalProfitLoss;
    const days = 30;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Gradually increase to current value
      const progress = 1 - (i / days);
      const currentValue = value + (totalProfitLoss * progress);
      
      // Add some random fluctuation
      const randomFactor = 1 + ((Math.random() * 0.02) - 0.01);
      
      data.push({
        x: date.toISOString().split('T')[0],
        y: Math.round(currentValue * randomFactor * 100) / 100
      });
    }
    
    return data;
  };

  // Generate portfolio allocation data
  const generateAllocationData = () => {
    if (!portfolio || portfolio.length === 0) return [];
    
    return portfolio.map(item => ({
      name: item.stock.symbol,
      value: item.currentValue,
      fill: getRandomColor(item.stockId)
    }));
  };
  
  // Get a color based on stockId (for consistent colors in pie chart)
  const getRandomColor = (id: number) => {
    const colors = [
      '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
      '#EC4899', '#6366F1', '#EF4444', '#06B6D4'
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="mt-8 mb-12">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Portfolio Overview</h2>
      
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Portfolio Summary</h3>
              {isLoading ? (
                <Skeleton className="h-5 w-48 mt-1" />
              ) : (
                <p className="mt-1 text-sm text-gray-500">
                  Current value: ₹{totalValue.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              {isLoading ? (
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-10 w-32" />
                </div>
              ) : (
                <>
                  <span className={`text-lg font-medium mr-4 ${
                    totalProfitLoss > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {totalProfitLoss > 0 ? '+' : ''}
                    ₹{totalProfitLoss.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} ({totalProfitLossPercent.toFixed(2)}%)
                  </span>
                  <Select defaultValue="today">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="1week">1 Week</SelectItem>
                      <SelectItem value="1month">1 Month</SelectItem>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <div className="relative h-64">
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : (
                  <LineChart 
                    data={generatePortfolioValueData()}
                    xAxisKey="x"
                    yAxisKey="y"
                    color="#3B82F6"
                  />
                )}
              </div>
            </div>
            
            <div>
              <div className="relative h-64">
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : (
                  <PieChart 
                    data={generateAllocationData()}
                    nameKey="name"
                    valueKey="value"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Recommendation</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <Skeleton className="h-5 w-16 mb-1" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-12" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                  </tr>
                ))
              ) : (
                portfolio?.map((item) => {
                  // Generate a recommendation based on performance
                  let recommendation;
                  if (item.profitLossPercent > 5) {
                    recommendation = { label: "HOLD", class: "bg-green-100 text-green-800" };
                  } else if (item.profitLossPercent > 0) {
                    recommendation = { label: "BUY", class: "bg-green-100 text-green-800" };
                  } else if (item.profitLossPercent > -5) {
                    recommendation = { label: "HOLD", class: "bg-yellow-100 text-yellow-800" };
                  } else {
                    recommendation = { label: "SELL", class: "bg-red-100 text-red-800" };
                  }
                  
                  return (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.stock.symbol}</div>
                            <div className="text-sm text-gray-500">{item.stock.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{item.avgPrice.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{item.stock.currentPrice.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{item.currentValue.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        item.profitLoss > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.profitLoss > 0 ? '+' : ''}
                        ₹{item.profitLoss.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} ({item.profitLossPercent.toFixed(2)}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${recommendation.class}`}>
                          {recommendation.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
