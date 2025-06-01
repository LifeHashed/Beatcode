'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressChartProps {
  data: {
    labels: string[];
    values: number[];
    backgroundColor?: string[];
  };
  title: string;
  type: 'doughnut' | 'bar';
  className?: string;
}

export function ProgressChart({ data, title, type, className = '' }: ProgressChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Default colors if not provided
        const defaultColors = [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)'
        ];

        chartInstance.current = new Chart(ctx, {
          type,
          data: {
            labels: data.labels,
            datasets: [
              {
                data: data.values,
                backgroundColor: data.backgroundColor || defaultColors,
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: type === 'doughnut' ? 'right' : 'top',
                labels: {
                  boxWidth: 12
                }
              }
            }
          }
        });
      }
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
