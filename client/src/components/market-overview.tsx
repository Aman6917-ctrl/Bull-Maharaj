import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp } from "lucide-react";

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface MarketOverviewData {
  indices: {
    SENSEX: MarketIndex;
    NIFTY: MarketIndex;
    BANKNIFTY: MarketIndex;
    INR_USD: MarketIndex;
  };
  lastUpdated: string;
}

export default function MarketOverview() {
  const { data, isLoading, error } = useQuery<MarketOverviewData>({
    queryKey: ['/api/market/overview'],
  });

  if (isLoading) {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-28 mb-2" />
              <Skeleton className="h-4 w-16" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Market Overview</h2>
        <Card className="p-4 text-red-500">
          Error loading market data. Please try again later.
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Market Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {data && Object.values(data.indices).map((index, i) => (
          <Card
            key={i}
            className={`p-4 border-l-4 ${
              index.changePercent > 0 ? 'border-green-500' : 'border-red-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{index.name}</p>
                <p className="text-xl font-semibold">{index.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div
                className={`text-sm font-medium ${
                  index.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {index.changePercent > 0 ? '+' : ''}
                {index.changePercent.toFixed(2)}%{' '}
                {index.changePercent > 0 ? (
                  <ArrowUp className="inline h-4 w-4 ml-1" />
                ) : (
                  <ArrowDown className="inline h-4 w-4 ml-1" />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
