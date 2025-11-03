import React from 'react';
import { ChartContainer } from './ChartContainer';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface MetricsChartProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'pie';
  loading?: boolean;
  className?: string;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  title,
  description,
  data,
  type,
  loading = false,
  className = '',
}) => {
  const renderChart = () => {
    const maxValue = Math.max(...data.map(d => d.value));
    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];

    switch (type) {
      case 'bar':
        return (
          <div className="space-y-4">
            {data.map((point, index) => (
              <div key={point.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{point.label}</span>
                  <span className="text-sm text-gray-900 font-semibold">{point.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${point.color || colors[index % colors.length]}`}
                    style={{ width: `${(point.value / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'line':
        return (
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-between gap-2">
              {data.map((point, index) => (
                <div
                  key={point.label}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-full ${point.color || colors[index % colors.length]} rounded-t-sm`}
                    style={{ height: `${(point.value / maxValue) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2 text-center">{point.label}</span>
                  <span className="text-xs font-semibold text-gray-900">{point.value}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pie': {
        const total = data.reduce((sum, point) => sum + point.value, 0);
        return (
          <div className="flex items-center gap-8">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {data.map((point, index) => {
                  const percentage = (point.value / total) * 100;
                  const circumference = 2 * Math.PI * 40;
                  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = index === 0 ? 0 : -(data.slice(0, index).reduce((sum, p) => sum + (p.value / total) * 100, 0) / 100) * circumference;

                  return (
                    <circle
                      key={point.label}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={point.color?.replace('bg-', '#').replace('500', '600') || ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899'][index % colors.length]}
                      strokeWidth="8"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                    />
                  );
                })}
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              {data.map((point, index) => (
                <div key={point.label} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${point.color || colors[index % colors.length]}`}
                  ></div>
                  <span className="text-sm text-gray-700">{point.label}</span>
                  <span className="text-sm font-semibold text-gray-900 ml-auto">
                    {point.value} ({Math.round((point.value / total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <ChartContainer
      title={title}
      description={description}
      loading={loading}
      className={className}
    >
      {renderChart()}
    </ChartContainer>
  );
};