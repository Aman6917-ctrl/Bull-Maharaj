import { Bell } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface TopNavProps {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

interface MarketOverviewData {
  indices: {
    SENSEX: {
      name: string;
      value: number;
      change: number;
      changePercent: number;
    };
    NIFTY: {
      name: string;
      value: number;
      change: number;
      changePercent: number;
    };
  };
}

export default function TopNav({ onMobileMenuToggle, mobileMenuOpen }: TopNavProps) {
  const { data, isLoading } = useQuery<MarketOverviewData>({
    queryKey: ['/api/market/overview'],
  });

  return (
    <div className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onMobileMenuToggle}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </Button>
              <span className="ml-2 text-xl font-bold text-primary-800">TradeSage</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {isLoading ? (
                <div className="flex space-x-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ) : (
                <>
                  <span className="font-medium text-sm text-gray-700 mr-4">
                    SENSEX:{" "}
                    <span className={data?.indices.SENSEX.changePercent > 0 ? "text-green-600" : "text-red-600"}>
                      {data?.indices.SENSEX.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}{" "}
                      {data?.indices.SENSEX.changePercent > 0 ? "+" : ""}
                      {data?.indices.SENSEX.changePercent.toFixed(2)}%
                    </span>
                  </span>
                  <span className="font-medium text-sm text-gray-700 mr-4">
                    NIFTY:{" "}
                    <span className={data?.indices.NIFTY.changePercent > 0 ? "text-green-600" : "text-red-600"}>
                      {data?.indices.NIFTY.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}{" "}
                      {data?.indices.NIFTY.changePercent > 0 ? "+" : ""}
                      {data?.indices.NIFTY.changePercent.toFixed(2)}%
                    </span>
                  </span>
                </>
              )}
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </Button>
              <div className="ml-3 relative">
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" />
                  <AvatarFallback>DU</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
