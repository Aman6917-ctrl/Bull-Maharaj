import { useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from "recharts";

interface PieChartProps {
  data: Array<{
    [key: string]: any;
  }>;
  nameKey: string;
  valueKey: string;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
}

export function PieChart({
  data,
  nameKey,
  valueKey,
  colors,
  innerRadius = 0,
  outerRadius = 80
}: PieChartProps) {
  const [chartData, setChartData] = useState(data);

  // Default colors if not provided
  const defaultColors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#8B5CF6", // purple
    "#F59E0B", // amber
    "#EC4899", // pink
    "#6366F1", // indigo
    "#EF4444", // red
    "#06B6D4"  // cyan
  ];

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
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey={valueKey}
          nameKey={nameKey}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        >
          {chartData.map((entry, index) => {
            const colorToUse = entry.fill || (colors ? colors[index % colors.length] : defaultColors[index % defaultColors.length]);
            return <Cell key={`cell-${index}`} fill={colorToUse} />;
          })}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, valueKey]}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
