import { Link, useLocation } from "wouter";
import { ChartLine, Bot, Search, Briefcase, Newspaper, Settings, LogOut } from "lucide-react";

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-primary-900 text-white">
        <div className="flex items-center justify-center h-16 bg-primary-900">
          <span className="text-xl font-bold">Bull Maharaj</span>
        </div>
        <div className="flex flex-col flex-grow overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link href="/dashboard">
              <div className={`flex items-center px-4 py-3 text-sm font-medium rounded-md cursor-pointer ${
                isActive("/dashboard") || isActive("/")
                  ? "bg-primary-800 text-white" 
                  : "text-gray-300 hover:bg-primary-800 hover:text-white"
              }`}>
                <ChartLine className="mr-3 h-5 w-5" />
                Dashboard
              </div>
            </Link>
            <Link href="/trading-bot">
              <div className={`flex items-center px-4 py-3 text-sm font-medium rounded-md cursor-pointer ${
                isActive("/trading-bot")
                  ? "bg-primary-800 text-white" 
                  : "text-gray-300 hover:bg-primary-800 hover:text-white"
              }`}>
                <Bot className="mr-3 h-5 w-5" />
                AI Trading Bot
              </div>
            </Link>
            <Link href="/analysis">
              <div className={`flex items-center px-4 py-3 text-sm font-medium rounded-md cursor-pointer ${
                isActive("/analysis")
                  ? "bg-primary-800 text-white" 
                  : "text-gray-300 hover:bg-primary-800 hover:text-white"
              }`}>
                <Search className="mr-3 h-5 w-5" />
                Analysis
              </div>
            </Link>
            <Link href="/portfolio">
              <div className={`flex items-center px-4 py-3 text-sm font-medium rounded-md cursor-pointer ${
                isActive("/portfolio")
                  ? "bg-primary-800 text-white" 
                  : "text-gray-300 hover:bg-primary-800 hover:text-white"
              }`}>
                <Briefcase className="mr-3 h-5 w-5" />
                Portfolio
              </div>
            </Link>
            <Link href="/market">
              <div className={`flex items-center px-4 py-3 text-sm font-medium rounded-md cursor-pointer ${
                isActive("/market")
                  ? "bg-primary-800 text-white" 
                  : "text-gray-300 hover:bg-primary-800 hover:text-white"
              }`}>
                <Newspaper className="mr-3 h-5 w-5" />
                Market News
              </div>
            </Link>
            <div className={`flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:bg-primary-800 hover:text-white`}>
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </div>
          </nav>
          <div className="p-4 border-t border-gray-700">
            <div
              onClick={(e) => {
                e.preventDefault();
                onLogout();
              }}
              className="flex items-center text-sm font-medium text-gray-300 hover:text-white cursor-pointer"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
