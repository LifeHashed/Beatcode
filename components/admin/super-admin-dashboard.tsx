'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileQuestion, UserCheck, TrendingUp } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalQuestions: number;
  questionsAddedThisMonth: number;
  totalAdmins: number;
  activeUsersThisWeek: number;
  recentActivity: any[];
}

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalQuestions: 0,
    questionsAddedThisMonth: 0,
    totalAdmins: 0,
    activeUsersThisWeek: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/super-admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'Registered platform users',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total Questions',
      value: stats.totalQuestions,
      description: 'Available coding problems',
      icon: FileQuestion,
      color: 'text-green-600'
    },
    {
      title: 'Questions Added',
      value: stats.questionsAddedThisMonth,
      description: 'This month',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Total Admins',
      value: stats.totalAdmins,
      description: 'Platform administrators',
      icon: UserCheck,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="p-2 space-y-2">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Super Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Master control panel for BeatCode platform.</p>
      </div>

      {/* 2x1 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Stats Section - 2x2 Grid */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-sm">Platform Statistics</CardTitle>
              <CardDescription className="text-xs">Key metrics overview</CardDescription>
            </CardHeader>
            <CardContent className="pt-1 pb-3">
              <div className="grid grid-cols-2 gap-1.5">
                {statCards.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="flex flex-col items-center justify-center p-2 border rounded bg-gray-100/50 dark:bg-gray-800/50">
                      <IconComponent className={`h-4 w-4 ${stat.color} mb-0.5`} />
                      <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {stat.value.toLocaleString()}
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center leading-tight">{stat.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">{stat.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health Section */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-sm">System Health</CardTitle>
              <CardDescription className="text-xs">Platform status overview</CardDescription>
            </CardHeader>
            <CardContent className="pt-1 pb-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center p-2 border rounded bg-green-100/50 dark:bg-green-900/30">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Database Status</span>
                  <span className="flex items-center text-green-600 dark:text-green-400 font-semibold text-xs">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded bg-green-100/50 dark:bg-green-900/30">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">API Status</span>
                  <span className="flex items-center text-green-600 dark:text-green-400 font-semibold text-xs">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                    Operational
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded bg-yellow-100/50 dark:bg-yellow-900/30">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Server Load</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400 text-xs">Normal</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded bg-blue-100/50 dark:bg-blue-900/30">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Response Time</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 text-xs">&lt;100ms</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded bg-gray-100/50 dark:bg-gray-800/50">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Last Backup</span>
                  <span className="font-semibold text-gray-600 dark:text-gray-400 text-xs">No data</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
