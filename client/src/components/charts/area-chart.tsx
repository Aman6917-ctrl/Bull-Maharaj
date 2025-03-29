import { useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  AreaChart as RechartsAreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";

interface AreaChartProps {
  data: Array<{
    [key: string]: any;
  }>;
  xAxisKey: string;
  yAxisKey: string;
  color?: string;
  showGrid?: boolean;
  fillOpacity?: number;
}

export function AreaChart({
  data,
  xAxisKey,
  yAxisKey,
  color = "#3B82F6",
  showGrid = false,
  fillOpacity = 0.2
}: AreaChartProps) {
  const [chartData, setChartData] = useState(data);

  // Update chart data when props change
  useEffect(() => {
    setChartData(data);
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fontSize: 12 }} 
          tickLine={false}
          axisLine={false}
          minTickGap={30}
        />
        <YAxis 
          tick={{ fontSize: 12 }} 
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value.toLocaleString('en-IN')}`}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toLocaleString('en-IN')}`, yAxisKey]}
          labelFormatter={(label) => xAxisKey === "date" ? new Date(label).toLocaleDateString() : label}
        />
        <Area 
          type="monotone" 
          dataKey={yAxisKey} 
          stroke={color} 
          fill={color} 
          fillOpacity={fillOpacity}
          strokeWidth={2}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
