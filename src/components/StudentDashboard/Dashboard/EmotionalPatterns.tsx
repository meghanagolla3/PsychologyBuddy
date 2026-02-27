"use client";

import React, { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { Brain, Lightbulb, Filter, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Plugin for center text (only for pie/doughnut charts)
const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: (chart: any) => {
    // Only apply to pie/doughnut charts, not bar charts
    if (chart.config.type !== 'pie' && chart.config.type !== 'doughnut') {
      return;
    }
    
    const ctx = chart.ctx;
    const width = chart.width;
    const height = chart.height;
    
    ctx.restore();
    const fontSize = (height / 114).toFixed(2);
    ctx.font = fontSize + "em sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    
    // Get the data from the chart
    const data = chart.data;
    if (data && data.datasets && data.datasets[0] && data.labels) {
      const dataset = data.datasets[0];
      const labels = data.labels;
      
      // Find the index of the highest value
      let maxIndex = 0;
      let maxValue = 0;
      
      for (let i = 0; i < dataset.data.length; i++) {
        if (dataset.data[i] > maxValue) {
          maxValue = dataset.data[i];
          maxIndex = i;
        }
      }
      
      // Display the trigger name with the highest percentage
      const text = labels[maxIndex] || "Triggers";
      const textX = Math.round(width / 2);
      const textY = Math.round(height / 2);
      
      ctx.fillText(text, textX, textY);
    }
    
    ctx.save();
  }
};

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, centerTextPlugin);

interface EmotionalPatternData {
  mood: string;
  count: number;
  percentage: number;
  color: string;
}

interface TriggerData {
  trigger: string;
  count: number;
  percentage: number;
}

interface EmotionalPatternsResponse {
  emotionalPatterns: EmotionalPatternData[];
  triggerPatterns: TriggerData[];
  insights: {
    primary: string;
    secondary: string;
    recommendation: string;
  };
  totalCheckins: number;
  timeRange: string;
}

// API function
async function fetchEmotionalPatterns(timeRange: string): Promise<EmotionalPatternsResponse> {
  const res = await fetch(`/api/student/emotional-patterns?timeRange=${timeRange}`);
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch emotional patterns");
  return json.data;
}

// Trigger options (matching the mood check-in component)
const triggerOptions = [
  "Friends",
  "Exams", 
  "Family",
  "Social pressure",
  "Sleep",
  "School work",
  "Health",
  "Others"
];

export default function EmotionalPatterns() {
  const [selectedTrigger, setSelectedTrigger] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"emotions" | "triggers">("emotions");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["emotionalPatterns", "month"],
    queryFn: () => fetchEmotionalPatterns("month"),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });

  // Filter data based on selected trigger
  const filteredData = React.useMemo(() => {
    if (!data || selectedTrigger === "all") return data;
    
    // For now, return the same data since we don't have trigger-specific emotional patterns
    // This could be enhanced in the future to show emotional patterns for specific triggers
    return data;
  }, [data, selectedTrigger]);

  // Prepare chart data for emotions
  const emotionChartData = {
    labels: filteredData?.emotionalPatterns.map(p => p.mood) || ["Happy", "Okay", "Sad", "Anxious", "Tired"],
    datasets: [
      {
        label: "Emotions",
        data: filteredData?.emotionalPatterns.map(p => p.percentage) || [30, 25, 20, 15, 10],
        backgroundColor: filteredData?.emotionalPatterns.map(p => p.color) || [
          "#FDE68A", // Happy (yellow-200)
          "#BFDBFE", // Okay (blue-200)
          "#FECACA", // Sad (red-200)
          "#DDD6FE", // Anxious (purple-200)
          "#A7F3D0", // Tired (green-200)
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for triggers (doughnut chart)
  const triggerChartData = {
    labels: data?.triggerPatterns.map(p => p.trigger) || [],
    datasets: [
      {
        label: "Triggers",
        data: data?.triggerPatterns.map(p => p.percentage) || [],
        backgroundColor: [
          "#3b82f6", // blue-500
          "#10b981", // emerald-500  
          "#f59e0b", // amber-500
          "#ef4444", // red-500
          "#8b5cf6", // violet-500
          "#06b6d4", // cyan-500
          "#f97316", // orange-500
          "#6b7280", // gray-500
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const emotionOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}% (${filteredData?.emotionalPatterns[context.dataIndex]?.count || 0} check-ins)`;
          }
        }
      }
    },
  };

  const triggerChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%', // This creates the doughnut hole
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}% (${data?.triggerPatterns[context.dataIndex]?.count || 0} times)`;
          }
        }
      }
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-2xl p-5 border bg-white shadow-sm w-full">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-[260px] bg-gray-100 rounded-lg animate-pulse mb-4"></div>
        <div className="h-[120px] bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  // Error state or no data state
  if (isError || !data) {
    return (
      <div className="rounded-2xl p-5 border bg-white shadow-sm w-full">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">
            Emotional Triggers
          </h3>
        </div>
        <div className="h-[260px] flex items-center justify-center">
          <p className="text-sm text-gray-500">Failed to load emotional patterns</p>
        </div>
      </div>
    );
  }

  // Handle case where student has no trigger data
  if (data.triggerPatterns.length === 0) {
    return (
      <div className="rounded-2xl p-5 border bg-white shadow-sm w-full">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-800">
              Emotional Triggers
            </h3>
          </div>
        </div>

        {/* No Data Message */}
        <div className="h-[260px] flex items-center justify-center mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              No trigger data available for the selected time period
            </p>
            <p className="text-xs text-gray-400">
              Start checking in regularly to see your emotional trigger patterns
            </p>
          </div>
        </div>

        {/* Insights Section */}
        <div className="rounded-2xl p-5 border shadow-sm w-full bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-800">
              Monthly Insights
            </h3>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {data.insights.primary}
            </p>
            
            {data.insights.secondary && (
              <p className="text-sm text-gray-700 leading-relaxed">
                {data.insights.secondary}
              </p>
            )}
            
            <div className="pt-2 border-t border-purple-200">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-medium">Recommendation:</span> {data.insights.recommendation}
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            Based on your monthly check-ins
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 border bg-white shadow-sm w-full">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-800">
            Emotional Triggers
          </h3>
        </div>
      </div>

      {/* Triggers Pie Chart */}
      <div className="h-[260px] mb-4">
        <Pie data={triggerChartData} options={triggerChartOptions} />
      </div>

      {/* Insights Section */}
      <div className="rounded-2xl p-5 border shadow-sm w-full bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-800">
            Monthly Insights
          </h3>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            {data.insights.primary}
          </p>
          
          {data.insights.secondary && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {data.insights.secondary}
            </p>
          )}
          
          <div className="pt-2 border-t border-purple-200">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-medium">Recommendation:</span> {data.insights.recommendation}
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Based on your monthly check-ins
        </p>
      </div>
    </div>
  );
}