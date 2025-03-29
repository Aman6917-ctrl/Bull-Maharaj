import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Login from "./login";
import Register from "./register";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen">
      {/* Left Column - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-primary-900 to-primary-700">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex justify-center space-x-4 mb-6">
              <Button
                variant={activeTab === "login" ? "default" : "outline"}
                onClick={() => setActiveTab("login")}
                className={`w-1/2 ${activeTab === "login" ? "bg-white text-primary-600 hover:bg-gray-100" : "bg-transparent text-white border-white hover:bg-white/10"}`}
              >
                Login
              </Button>
              <Button
                variant={activeTab === "register" ? "default" : "outline"}
                onClick={() => setActiveTab("register")}
                className={`w-1/2 ${activeTab === "register" ? "bg-white text-primary-600 hover:bg-gray-100" : "bg-transparent text-white border-white hover:bg-white/10"}`}
              >
                Register
              </Button>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-primary-800 mb-2">
                  {activeTab === "login" ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-gray-600 text-sm">
                  {activeTab === "login" 
                    ? "Access your Bull Maharaj dashboard" 
                    : "Join Bull Maharaj Trading Platform"}
                </p>
              </div>
              
              {activeTab === "login" ? <Login /> : <Register />}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-800 to-primary-950 text-white p-8 items-center justify-center">
        <div className="max-w-lg">
          <div className="mb-6 flex items-center">
            <div className="mr-3 bg-white text-primary-800 font-bold text-3xl px-4 py-2 rounded-lg">BM</div>
            <h1 className="text-4xl font-bold">Bull Maharaj</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-4">Reinforcement Learning Stock Trading Platform</h2>
          <p className="text-lg mb-8">
            Leverage the power of AI to make smarter trading decisions in the Indian stock market.
            Our platform uses reinforcement learning algorithms to predict stock trends and maximize your returns.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-sm">✓</span>
              </div>
              <p>Real-time market data and predictive analytics</p>
            </div>
            <div className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-sm">✓</span>
              </div>
              <p>AI-powered stock analysis and recommendations</p>
            </div>
            <div className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-sm">✓</span>
              </div>
              <p>Automated trading strategies and portfolio management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}