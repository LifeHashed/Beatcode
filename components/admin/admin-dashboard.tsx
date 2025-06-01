'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileQuestion, UserCheck, TrendingUp } from 'lucide-react';

interface AdminStats {
  totalQuestions: number;
  totalUsers: number;
  questionsAddedThisMonth: number;
  activeUsersThisWeek: number;
  recentActivity: any[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalQuestions: 0,
    totalUsers: 0,
    questionsAddedThisMonth: 0,
    activeUsersThisWeek: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
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
      <div className="p-2 space-y-2">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Questions',
      value: stats.totalQuestions,
      description: 'Across all companies',
      icon: FileQuestion,
      color: 'text-green-600'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'Registered accounts',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Questions Added',
      value: stats.questionsAddedThisMonth,
      description: 'This month',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Active Users',
      value: stats.activeUsersThisWeek,
      description: 'This week',
      icon: UserCheck,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="p-2 space-y-2">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Manage questions, view statistics, and track user progress.</p>
      </div>

      {/* 3x1 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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

        {/* User Activity Section */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-sm">User Activity</CardTitle>
              <CardDescription className="text-xs">User engagement metrics</CardDescription>
            </CardHeader>
            <CardContent className="pt-1 pb-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center p-2 border rounded bg-blue-100/50 dark:bg-blue-900/30">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Active Users This Week</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{stats.activeUsersThisWeek}</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded bg-green-100/50 dark:bg-green-900/30">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Total Registered</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded bg-purple-100/50 dark:bg-purple-900/30">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Questions Available</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{stats.totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded bg-orange-100/50 dark:bg-orange-900/30">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">New Questions</span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{stats.questionsAddedThisMonth}</span>
                </div>
                <div className="flex justify-between items-center p-2 border rounded bg-indigo-100/50 dark:bg-indigo-900/30">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Platform Health</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Good</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
              <CardDescription className="text-xs">Latest submissions</CardDescription>
            </CardHeader>
            <CardContent className="pt-1 pb-3">
              <div className="space-y-1.5">
                {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={activity.id} className="flex justify-between items-center p-2 border rounded bg-gray-100/50 dark:bg-gray-800/50">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">
                      {activity.description.substring(0, 30)}...
                    </span>
                    <span className={`text-xs font-semibold ${
                      activity.status === 'ACCEPTED' ? 'text-green-600 dark:text-green-400' : 
                      activity.status === 'REJECTED' ? 'text-red-600 dark:text-red-400' : 
                      'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
                {stats.recentActivity.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
