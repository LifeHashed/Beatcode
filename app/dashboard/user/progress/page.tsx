'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ConditionalNavbar } from '@/components/layout/conditional-navbar';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Star, 
  MessageSquare, 
  Filter,
  Search,
  Calendar,
  ArrowUpDown,
  Building,
  Target,
  BookOpen,
  Clock,
  Hash,
  BarChart,
  PieChart,
  TrendingUp,
  Brain,
  Trophy,
  CalendarDays,
  BookMarked,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

interface Remark {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  questionId: string;
  question: { title: string };
}

export default function UserProgressPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { questions } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [completedQuestions, setCompletedQuestions] = useState<any[]>([]);
  const [favoritedQuestions, setFavoritedQuestions] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('date-desc');
  const [favoriteVsSolvedView, setFavoriteVsSolvedView] = useState('solved-unsolved');
  const [chartView, setChartView] = useState<{
    companies: 'solved' | 'favorited' | 'remarked',
    topics: 'solved' | 'favorited' | 'remarked',
    difficulties: 'solved' | 'favorited' | 'remarked'
  }>({
    companies: 'solved',
    topics: 'solved',
    difficulties: 'solved'
  });

  // Move utility functions to the top
  const getMostFrequentItem = (items: any[], property: string): string => {
    if (!items || items.length === 0) return 'N/A';
    
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const value = item[property];
      counts[value] = (counts[value] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0][0] || 'N/A';
  };

  const getDifficultyCounts = () => {
    if (!stats?.difficultyCounts) return { easy: 0, medium: 0, hard: 0 };
    
    const easy = stats.difficultyCounts.find((d: any) => d.difficulty === 'EASY')?._count || 0;
    const medium = stats.difficultyCounts.find((d: any) => d.difficulty === 'MEDIUM')?._count || 0;
    const hard = stats.difficultyCounts.find((d: any) => d.difficulty === 'HARD')?._count || 0;
    
    return { easy, medium, hard };
  };

  const getProgressDifficultyCounts = () => {
    if (!stats?.progressByDifficulty) return { easy: 0, medium: 0, hard: 0 };
    
    const easy = stats.progressByDifficulty.find((d: any) => d.difficulty === 'EASY')?._count.id || 0;
    const medium = stats.progressByDifficulty.find((d: any) => d.difficulty === 'MEDIUM')?._count.id || 0;
    const hard = stats.progressByDifficulty.find((d: any) => d.difficulty === 'HARD')?._count.id || 0;
    
    return { easy, medium, hard };
  };

  const generateColorArray = (length: number, baseColor: string = 'blue') => {
    const colorMap: Record<string, string[]> = {
      'blue': ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
      'green': ['#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534'],
      'yellow': ['#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e'],
      'purple': ['#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8'],
    };

    const colors = colorMap[baseColor] || colorMap.blue;
    return Array(length).fill(0).map((_, i) => colors[i % colors.length]);
  };

  const difficultyColors = {
    'EASY': 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300',
    'MEDIUM': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300',
    'HARD': 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch completed questions
      const completedRes = await fetch('/api/user/completed');
      if (completedRes.ok) {
        const completedData = await completedRes.json();
        setCompletedQuestions(completedData);
      }

      // Fetch favorites
      const favoritesRes = await fetch('/api/user/favorites');
      if (favoritesRes.ok) {
        const favoritesData = await favoritesRes.json();
        setFavoritedQuestions(favoritesData);
      }

      // Fetch remarks
      const remarksRes = await fetch('/api/user/remarks');
      if (remarksRes.ok) {
        const remarksData = await remarksRes.json();
        setRemarks(remarksData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopicData = (type: 'solved' | 'favorited' | 'remarked') => {
    if (!stats) return { labels: [], values: [], backgroundColor: [] };

    let data;
    if (type === 'solved') {
      data = stats.progressByTopic || [];
      return {
        labels: data.map((item: any) => item.name),
        values: data.map((item: any) => item.completed),
        backgroundColor: generateColorArray(data.length)
      };
    } else if (type === 'favorited') {
      data = stats.favoritesByTopic || [];
      return {
        labels: data.map((item: any) => item.name),
        values: data.map((item: any) => item.count),
        backgroundColor: generateColorArray(data.length, 'yellow')
      };
    } else {
      data = stats.remarksByTopic || [];
      return {
        labels: data.map((item: any) => item.name),
        values: data.map((item: any) => item.count),
        backgroundColor: generateColorArray(data.length, 'purple')
      };
    }
  };

  const getCompanyData = (type: 'solved' | 'favorited' | 'remarked') => {
    if (!stats) return { labels: [], values: [], backgroundColor: [] };

    let data;
    if (type === 'solved') {
      data = stats.progressByCompany || [];
      return {
        labels: data.map((item: any) => item.name),
        values: data.map((item: any) => item.completed),
        backgroundColor: generateColorArray(data.length, 'blue')
      };
    } else if (type === 'favorited') {
      data = stats.favoritesByCompany || [];
      return {
        labels: data.map((item: any) => item.name),
        values: data.map((item: any) => item.count),
        backgroundColor: generateColorArray(data.length, 'yellow')
      };
    } else {
      data = stats.remarksByCompany || [];
      return {
        labels: data.map((item: any) => item.name),
        values: data.map((item: any) => item.count),
        backgroundColor: generateColorArray(data.length, 'purple')
      };
    }
  };

  const getDifficultyData = (type: 'solved' | 'favorited' | 'remarked') => {
    if (!stats) return { labels: [], values: [], backgroundColor: [] };

    let data;
    if (type === 'solved') {
      data = stats.progressByDifficulty || [];
      return {
        labels: data.map((item: any) => item.difficulty),
        values: data.map((item: any) => item._count.id),
        backgroundColor: ['#4ade80', '#facc15', '#f87171']
      };
    } else if (type === 'favorited') {
      data = stats.favoritesByDifficulty || [];
      return {
        labels: data.map((item: any) => item.difficulty),
        values: data.map((item: any) => item.count),
        backgroundColor: ['#4ade80', '#facc15', '#f87171']
      };
    } else {
      data = stats.remarksByDifficulty || [];
      return {
        labels: data.map((item: any) => item.difficulty),
        values: data.map((item: any) => item.count),
        backgroundColor: ['#4ade80', '#facc15', '#f87171']
      };
    }
  };

  const filterProblems = (tab: 'completed' | 'favorited' | 'remarks') => {
    let filteredItems: any[] = [];
    
    if (tab === 'completed') {
      filteredItems = completedQuestions;
    } else if (tab === 'favorited') {
      filteredItems = favoritedQuestions;
    } else {
      filteredItems = remarks;
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(item => {
        const title = tab === 'remarks' ? item.question?.title || item.title : item.title;
        const company = item.company || '';
        return title.toLowerCase().includes(query) || company.toLowerCase().includes(query);
      });
    }
    
    // Difficulty/Type filter
    if (filterOption !== 'all') {
      if (tab === 'remarks' && ['NOTE', 'HINT', 'SOLUTION', 'QUESTION'].includes(filterOption)) {
        filteredItems = filteredItems.filter(item => item.type === filterOption);
      } else if (filterOption === 'EASY' || filterOption === 'MEDIUM' || filterOption === 'HARD') {
        filteredItems = filteredItems.filter(item => item.difficulty === filterOption);
      }
    }
    
    // Sorting
    filteredItems.sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        case 'date-asc':
          return new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime();
        case 'title-asc':
          const titleA = tab === 'remarks' ? a.question?.title || a.title : a.title;
          const titleB = tab === 'remarks' ? b.question?.title || b.title : b.title;
          return titleA.localeCompare(titleB);
        case 'title-desc':
          const titleA2 = tab === 'remarks' ? a.question?.title || a.title : a.title;
          const titleB2 = tab === 'remarks' ? b.question?.title || b.title : b.title;
          return titleB2.localeCompare(titleA2);
        case 'difficulty':
          const diffOrder = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
          return (diffOrder[a.difficulty as keyof typeof diffOrder] || 0) - (diffOrder[b.difficulty as keyof typeof diffOrder] || 0);
        default:
          return 0;
      }
    });
    
    return filteredItems;
  };

  const getFilterOptions = (tab: 'completed' | 'favorited' | 'remarks') => {
    if (tab === 'remarks') {
      return [
        { value: 'all', label: 'All Types' },
        { value: 'NOTE', label: 'Notes' },
        { value: 'HINT', label: 'Hints' },
        { value: 'SOLUTION', label: 'Solutions' },
        { value: 'QUESTION', label: 'Questions' }
      ];
    }
    return [
      { value: 'all', label: 'All Difficulties' },
      { value: 'EASY', label: 'Easy' },
      { value: 'MEDIUM', label: 'Medium' },
      { value: 'HARD', label: 'Hard' }
    ];
  };

  const getFavoriteVsSolvedData = () => {
    if (favoriteVsSolvedView === 'solved-unsolved') {
      return {
        labels: ['Solved', 'Unsolved'],
        values: [totalSolved, totalQuestions - totalSolved],
        backgroundColor: ['#10b981', '#e5e7eb']
      };
    } else {
      return {
        labels: ['Favorites', 'Remarks'],
        values: [totalFavorites, totalRemarks],
        backgroundColor: ['#f59e0b', '#8b5cf6']
      };
    }
  };

  const getTimelineText = (timeline: string) => {
    switch (timeline) {
      case 'THIRTY_DAYS': return '30 Days';
      case 'THREE_MONTHS': return '3 Months';
      case 'SIX_MONTHS': return '6 Months';
      case 'MORE_THAN_SIX_MONTHS': return '6+ Months';
      default: return timeline;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ConditionalNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your progress data...</p>
          </div>
        </div>
      </div>
    );
  }

  const { easy: easyTotal, medium: mediumTotal, hard: hardTotal } = getDifficultyCounts();
  const { easy: easySolved, medium: mediumSolved, hard: hardSolved } = getProgressDifficultyCounts();

  const avgProblemsPerDay = stats?.averagePerDay || 0;
  const totalRemarks = remarks.length;
  const totalFavorites = favoritedQuestions.length;
  const lastSolvedDate = completedQuestions.length > 0
    ? new Date(completedQuestions[0].updatedAt).toLocaleDateString()
    : 'N/A';
  const totalSolved = stats?.completedCount || 0;
  const totalQuestions = questions.length;
  
  const mostSolvedCompany = getMostFrequentItem(completedQuestions, 'company');
  const mostSolvedTopic = stats?.topSolvedTopic?.name || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <ConditionalNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 pt-10">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse mb-4 lg:mb-0">
            Your Coding Progress
          </h1>
        </div>

        {/* Stats Grid - 6x2 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatsCard 
            title="Problems Solved" 
            value={`${totalSolved} / ${totalQuestions}`} 
            description="Total completion" 
            icon={<CheckCircle className="h-4 w-4" />}
            compact={true}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30"
          />
          <StatsCard 
            title="Companies Solved" 
            value={`${stats?.companySolvedCount || 0}`} 
            description={`Most solved: ${mostSolvedCompany}`} 
            icon={<Building className="h-4 w-4" />}
            compact={true}
            className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30"
          />
          <StatsCard 
            title="Easy Problems" 
            value={`${easySolved} / ${easyTotal}`} 
            description={`${Math.round((easySolved / (easyTotal || 1)) * 100)}% completed`} 
            icon={<Target className="h-4 w-4" />}
            compact={true}
            className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30"
          />
          <StatsCard 
            title="Medium Problems" 
            value={`${mediumSolved} / ${mediumTotal}`} 
            description={`${Math.round((mediumSolved / (mediumTotal || 1)) * 100)}% completed`} 
            icon={<Target className="h-4 w-4" />}
            compact={true}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30"
          />
          <StatsCard 
            title="Hard Problems" 
            value={`${hardSolved} / ${hardTotal}`} 
            description={`${Math.round((hardSolved / (hardTotal || 1)) * 100)}% completed`} 
            icon={<Target className="h-4 w-4" />}
            compact={true}
            className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30"
          />
          <StatsCard 
            title="Topics Mastered" 
            value={mostSolvedTopic} 
            description="Most solved topic" 
            icon={<Brain className="h-4 w-4" />}
            compact={true}
            className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30"
          />
          <StatsCard 
            title="Avg. Problems/Day" 
            value={avgProblemsPerDay.toFixed(1)} 
            description="Daily solving rate" 
            icon={<TrendingUp className="h-4 w-4" />}
            compact={true}
            className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30"
          />
          <StatsCard 
            title="Last Solved" 
            value={lastSolvedDate} 
            description="Most recent completion" 
            icon={<CalendarDays className="h-4 w-4" />}
            compact={true}
            className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30"
          />
          <StatsCard 
            title="Total Remarks" 
            value={totalRemarks} 
            description="Notes and solutions" 
            icon={<MessageSquare className="h-4 w-4" />}
            compact={true}
            className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30"
          />
          <StatsCard 
            title="Favorites" 
            value={totalFavorites} 
            description="Marked for review" 
            icon={<Star className="h-4 w-4" />}
            compact={true}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30"
          />
          <StatsCard 
            title="Consistency" 
            value={stats?.consistencyStreak || 0}
            description="Days in a row" 
            icon={<Trophy className="h-4 w-4" />}
            compact={true}
            className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30"
          />
          <StatsCard 
            title="Total Questions" 
            value={totalQuestions} 
            description="In database" 
            icon={<BookOpen className="h-4 w-4" />}
            compact={true}
            className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30"
          />
        </div>

        {/* Charts Section */}
        <div className="mb-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
            <BarChart className="h-6 w-6 text-primary" />
            Visual Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Company Chart */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Companies</CardTitle>
                  <Select
                    value={chartView.companies}
                    onValueChange={(value: any) => setChartView({ ...chartView, companies: value })}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solved">Solved</SelectItem>
                      <SelectItem value="favorited">Favorited</SelectItem>
                      <SelectItem value="remarked">Remarked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ProgressChart
                  data={getCompanyData(chartView.companies)}
                  title=""
                  type="pie"
                  className="h-48"
                />
              </CardContent>
            </Card>

            {/* Topics Chart */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Topics</CardTitle>
                  <Select
                    value={chartView.topics}
                    onValueChange={(value: any) => setChartView({ ...chartView, topics: value })}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solved">Solved</SelectItem>
                      <SelectItem value="favorited">Favorited</SelectItem>
                      <SelectItem value="remarked">Remarked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ProgressChart
                  data={getTopicData(chartView.topics)}
                  title=""
                  type="pie"
                  className="h-48"
                />
              </CardContent>
            </Card>

            {/* Difficulty Chart */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Difficulty</CardTitle>
                  <Select
                    value={chartView.difficulties}
                    onValueChange={(value: any) => setChartView({ ...chartView, difficulties: value })}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solved">Solved</SelectItem>
                      <SelectItem value="favorited">Favorited</SelectItem>
                      <SelectItem value="remarked">Remarked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ProgressChart
                  data={getDifficultyData(chartView.difficulties)}
                  title=""
                  type="pie"
                  className="h-48"
                />
              </CardContent>
            </Card>

            {/* Progress Over Time Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart
                  data={{
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    values: [5, 12, 18, totalSolved],
                    backgroundColor: ['#3b82f6']
                  }}
                  title=""
                  type="line"
                  className="h-48"
                />
              </CardContent>
            </Card>

            {/* Difficulty Breakdown Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Difficulty Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart
                  data={{
                    labels: ['Easy', 'Medium', 'Hard'],
                    values: [
                      Math.round((easySolved / (totalSolved || 1)) * 100),
                      Math.round((mediumSolved / (totalSolved || 1)) * 100),
                      Math.round((hardSolved / (totalSolved || 1)) * 100)
                    ],
                    backgroundColor: ['#4ade80', '#facc15', '#f87171']
                  }}
                  title=""
                  type="pie"
                  className="h-48"
                />
              </CardContent>
            </Card>

            {/* Favorite vs Solved Chart */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Favorite vs Solved</CardTitle>
                  <Select
                    value={favoriteVsSolvedView}
                    onValueChange={(value: any) => setFavoriteVsSolvedView(value)}
                  >
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solved-unsolved">Solved vs Unsolved</SelectItem>
                      <SelectItem value="favorite-remarked">Favorite vs Remarked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ProgressChart
                  data={getFavoriteVsSolvedData()}
                  title=""
                  type="doughnut"
                  className="h-48"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tab View: Problem Tracker */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-primary" />
            Problem Tracker
          </h2>

          <Tabs defaultValue="completed" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="completed" className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Completed</span>
                  <Badge variant="secondary" className="ml-1 h-5">{completedQuestions.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="favorited" className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Favorited</span>
                  <Badge variant="secondary" className="ml-1 h-5">{favoritedQuestions.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="remarks" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Remarked</span>
                  <Badge variant="secondary" className="ml-1 h-5">{remarks.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={filterOption} onValueChange={setFilterOption}>
                  <SelectTrigger className="w-[150px]">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {getFilterOptions('completed').map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[140px]">
                    <div className="flex items-center">
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Sort" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Latest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="title-asc">Title A-Z</SelectItem>
                    <SelectItem value="title-desc">Title Z-A</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="completed">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Title</th>
                          <th className="text-left p-4">Difficulty</th>
                          <th className="text-left p-4">Company</th>
                          <th className="text-left p-4">Timeline</th>
                          <th className="text-left p-4">Completion Date</th>
                          <th className="text-center p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterProblems('completed').length > 0 ? (
                          filterProblems('completed').map((question) => (
                            <tr key={question.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="p-4">
                                <a 
                                  href={question.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                  {question.title}
                                </a>
                              </td>
                              <td className="p-4">
                                <Badge className={difficultyColors[question.difficulty as keyof typeof difficultyColors] || ''}>
                                  {question.difficulty.toLowerCase()}
                                </Badge>
                              </td>
                              <td className="p-4">{question.company}</td>
                              <td className="p-4">
                                <Badge variant="outline" className="text-xs">
                                  {getTimelineText(question.timeline)}
                                </Badge>
                              </td>
                              <td className="p-4">{new Date(question.updatedAt).toLocaleDateString()}</td>
                              <td className="p-4 text-center">
                                <div className="flex justify-center space-x-2">
                                  <Button size="sm" variant="ghost">
                                    <Star className={`h-4 w-4 ${question.favorites?.length > 0 ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                  </Button>
                                  <Button size="sm" variant="ghost">
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500">
                              No completed problems found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="favorited">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Title</th>
                          <th className="text-left p-4">Difficulty</th>
                          <th className="text-left p-4">Company</th>
                          <th className="text-left p-4">Timeline</th>
                          <th className="text-left p-4">Favorited Date</th>
                          <th className="text-center p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterProblems('favorited').length > 0 ? (
                          filterProblems('favorited').map((question) => (
                            <tr key={question.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="p-4">
                                <a 
                                  href={question.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                  {question.title}
                                </a>
                              </td>
                              <td className="p-4">
                                <Badge className={difficultyColors[question.difficulty as keyof typeof difficultyColors] || ''}>
                                  {question.difficulty.toLowerCase()}
                                </Badge>
                              </td>
                              <td className="p-4">{question.company}</td>
                              <td className="p-4">
                                <Badge variant="outline" className="text-xs">
                                  {getTimelineText(question.timeline)}
                                </Badge>
                              </td>
                              <td className="p-4">{new Date(question.updatedAt).toLocaleDateString()}</td>
                              <td className="p-4 text-center">
                                <div className="flex justify-center space-x-2">
                                  <Button size="sm" variant="ghost">
                                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                  </Button>
                                  <Button size="sm" variant="ghost">
                                    <CheckCircle className={`h-4 w-4 ${question.progress?.[0]?.completed ? 'text-green-500' : ''}`} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500">
                              No favorited problems found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="remarks">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Title</th>
                          <th className="text-left p-4">Type</th>
                          <th className="text-left p-4">Problem</th>
                          <th className="text-left p-4">Created</th>
                          <th className="text-center p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterProblems('remarks').length > 0 ? (
                          filterProblems('remarks').map((remark) => (
                            <tr key={remark.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="p-4 font-medium">{remark.title}</td>
                              <td className="p-4">
                                <Badge variant="outline" className="text-xs">
                                  {remark.type || 'NOTE'}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <a 
                                  href={`/questions/${remark.questionId}`} 
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {remark.question?.title || 'Unknown Problem'}
                                </a>
                              </td>
                              <td className="p-4">{new Date(remark.createdAt).toLocaleDateString()}</td>
                              <td className="p-4 text-center">
                                <div className="flex justify-center space-x-2">
                                  <Button size="sm" variant="ghost">
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">
                              No remarks found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
