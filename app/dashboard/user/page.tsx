'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Award,
  Brain,
  Code2,
  Zap,
  BarChart3,
  Activity
} from 'lucide-react';

interface UserStats {
  completedCount: number;
  totalQuestions: number;
  progressPercentage: number;
  currentStreak: number;
  progressByDifficulty: Array<{
    difficulty: string;
    _count: { id: number };
  }>;
  progressByTopic: Array<{
    name: string;
    completed: number;
  }>;
  lastSolvedQuestion: {
    title: string;
    difficulty: string;
    solvedAt: string;
  } | null;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      // Redirect admins to their respective dashboards
      if (session?.user?.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (session?.user?.role === 'SUPER_ADMIN') {
        router.push('/dashboard/super-admin');
      } else {
        fetchStats();
      }
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const progressByDifficulty = stats?.progressByDifficulty || [];
  const topTopics = stats?.progressByTopic?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 mt-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
            Ready to solve some problems today?
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Problems Solved</p>
                  <p className="text-3xl font-bold">{stats?.completedCount || 0}</p>
                </div>
                <Trophy className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Current Streak</p>
                  <p className="text-3xl font-bold">{stats?.currentStreak || 0}</p>
                </div>
                <Zap className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Progress</p>
                  <p className="text-3xl font-bold">{stats?.progressPercentage || 0}%</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total Available</p>
                  <p className="text-3xl font-bold">{stats?.totalQuestions || 0}</p>
                </div>
                <BookOpen className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Progress and Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Progress */}
            <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Problems Completed</span>
                    <span className="text-sm text-gray-600">
                      {stats?.completedCount} / {stats?.totalQuestions}
                    </span>
                  </div>
                  <Progress value={stats?.progressPercentage || 0} className="h-3" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats?.progressPercentage || 0}%</p>
                    <p className="text-sm text-gray-600">Keep going! You're doing great!</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Breakdown */}
            <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Progress by Difficulty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['EASY', 'MEDIUM', 'HARD'].map((difficulty) => {
                    const diffStats = progressByDifficulty.find(d => d.difficulty === difficulty);
                    const count = diffStats?._count?.id || 0;
                    const percentage = stats?.totalQuestions ? (count / stats.totalQuestions) * 100 : 0;
                    
                    return (
                      <div key={difficulty} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Badge className={`${getDifficultyColor(difficulty)} border`}>
                            {difficulty}
                          </Badge>
                          <span className="text-sm font-medium">{count} solved</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Topics */}
            <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Top Topics Mastered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topTopics.length > 0 ? (
                    topTopics.map((topic, index) => (
                      <div key={topic.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-300">#{index + 1}</span>
                          </div>
                          <span className="font-medium dark:text-gray-200">{topic.name}</span>
                        </div>
                        <Badge variant="secondary">{topic.completed} solved</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Start solving problems to see your progress!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activities and Actions */}
          <div className="space-y-6">
            {/* Last Solved */}
            <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Recent Achievement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.lastSolvedQuestion ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800">{stats.lastSolvedQuestion.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getDifficultyColor(stats.lastSolvedQuestion.difficulty)}>
                          {stats.lastSolvedQuestion.difficulty}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {new Date(stats.lastSolvedQuestion.solvedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Code2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No problems solved yet</p>
                    <p className="text-sm text-gray-400">Start your coding journey!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Motivational Quote */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                  <Brain className="h-5 w-5" />
                  Daily Inspiration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <blockquote className="text-sm italic text-indigo-800 dark:text-indigo-300 leading-relaxed">
                      "The only way to learn a new programming language is by writing programs in it."
                    </blockquote>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">— Dennis Ritchie</p>
                  </div>
                  <div className="mt-4 p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                      Keep coding, keep growing! 🚀
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
