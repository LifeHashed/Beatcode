'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, Filter, BookOpen, ExternalLink, Star, Heart, CheckCircle, StickyNote, Calendar, Shuffle, ChevronDown, Target, Trophy, Zap, Timer, Award, Bookmark } from 'lucide-react';
import { RemarkModal } from '@/components/questions/remark-modal';
import { useToast } from '@/components/ui/use-toast';

interface Question {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  url: string;
  company: string;
  timeline: string;
  topics: { name: string }[];
  progress?: { completed: boolean }[];
  favorites?: any[];
}

export default function ProblemsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [paginatedQuestions, setPaginatedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title-asc');
  const [questionOfDay, setQuestionOfDay] = useState<Question | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [totalPages, setTotalPages] = useState(1);
  
  // Popover states
  const [companyPopoverOpen, setCompanyPopoverOpen] = useState(false);
  const [topicPopoverOpen, setTopicPopoverOpen] = useState(false);
  
  // Modal states
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterAndSortQuestions();
  }, [questions, searchQuery, selectedDifficulty, selectedCompanies, selectedTopics, statusFilter, sortBy]);

  useEffect(() => {
    paginateQuestions();
  }, [filteredQuestions, currentPage]);

  // Calculate stats when questions change
  useEffect(() => {
    if (questions.length > 0) {
      calculateStats();
    }
  }, [questions]);

  // Set question of the day - make it consistent across sessions
  useEffect(() => {
    if (questions.length > 0) {
      // Use a fixed date seed to ensure same question of the day for all users
      const today = new Date();
      const dateString = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      const seed = dateString.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const questionIndex = Math.abs(seed) % questions.length;
      setQuestionOfDay(questions[questionIndex]);
    }
  }, [questions]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/questions');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch questions');
      }
      
      const data = await response.json();
      
      // Ensure we have an array of questions
      if (!Array.isArray(data)) {
        console.error('Expected array of questions, got:', data);
        throw new Error('Invalid data format received');
      }
      
      console.log('Fetched questions:', data.length);
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load questions",
        variant: "destructive",
      });
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortQuestions = () => {
    let filtered = questions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topics.some(topic => topic.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Difficulty filter
    if (selectedDifficulty && selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    // Company filter
    if (selectedCompanies.length > 0) {
      filtered = filtered.filter(q => selectedCompanies.includes(q.company));
    }

    // Topic filter
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(q => 
        q.topics.some(topic => selectedTopics.includes(topic.name))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'solved':
          filtered = filtered.filter(q => q.progress?.[0]?.completed);
          break;
        case 'unsolved':
          filtered = filtered.filter(q => !q.progress?.[0]?.completed);
          break;
        case 'favorites':
          filtered = filtered.filter(q => (q.favorites?.length || 0) > 0);
          break;
        case 'remarked':
          filtered = filtered.filter(q => q.remarks && q.remarks.length > 0);
          break;
      }
    }

    // Sorting
    const [sortField, sortOrder] = sortBy.split('-');
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortField) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'difficulty':
          const difficultyOrder = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
          valueA = difficultyOrder[a.difficulty];
          valueB = difficultyOrder[b.difficulty];
          break;
        case 'company':
          valueA = a.company.toLowerCase();
          valueB = b.company.toLowerCase();
          break;
        default:
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
      }

      if (typeof valueA === 'string') {
        return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      } else {
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }
    });

    setFilteredQuestions(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const paginateQuestions = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedQuestions(filteredQuestions.slice(startIndex, endIndex));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRandomQuestion = () => {
    if (filteredQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      const randomQuestion = filteredQuestions[randomIndex];
      // Use LeetCode link if available, otherwise use internal link
      if (randomQuestion.leetcodeLink) {
        window.open(randomQuestion.leetcodeLink, '_blank');
      } else if (randomQuestion.url) {
        window.open(randomQuestion.url, '_blank');
      } else {
        router.push(`/dashboard/user/question/${randomQuestion.id}`);
      }
    }
  };

  const handleQuestionOfDayClick = () => {
    if (questionOfDay) {
      // Use LeetCode link if available, otherwise use internal link
      if (questionOfDay.leetcodeLink) {
        window.open(questionOfDay.leetcodeLink, '_blank');
      } else if (questionOfDay.url) {
        window.open(questionOfDay.url, '_blank');
      } else {
        router.push(`/dashboard/user/question/${questionOfDay.id}`);
      }
    }
  };

  const calculateStats = async () => {
    try {
      // Fetch user stats from API
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const userStats = await response.json();
        
        const solvedQuestions = questions.filter(q => q.progress?.[0]?.completed);
        const favoritedQuestions = questions.filter(q => (q.favorites?.length || 0) > 0);
        const remarkedQuestions = questions.filter(q => q.remarks && q.remarks.length > 0);
        
        // Count by difficulty
        const easySolved = solvedQuestions.filter(q => q.difficulty === 'EASY').length;
        const mediumSolved = solvedQuestions.filter(q => q.difficulty === 'MEDIUM').length;
        const hardSolved = solvedQuestions.filter(q => q.difficulty === 'HARD').length;
        
        // Find most solved difficulty
        const difficultyStats = [
          { name: 'Easy', count: easySolved, color: 'green' },
          { name: 'Medium', count: mediumSolved, color: 'yellow' },
          { name: 'Hard', count: hardSolved, color: 'red' }
        ];
        const mostSolvedDifficulty = difficultyStats.sort((a, b) => b.count - a.count)[0];
        
        // Most company solved from
        const companyCounts = solvedQuestions.reduce((acc, q) => {
          acc[q.company] = (acc[q.company] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const mostSolvedCompanyEntry = Object.entries(companyCounts).sort(([,a], [,b]) => b - a)[0];
        const mostSolvedCompany = mostSolvedCompanyEntry ? mostSolvedCompanyEntry[0] : 'None';
        const mostSolvedCompanyCount = mostSolvedCompanyEntry ? mostSolvedCompanyEntry[1] : 0;
        
        // Most topic solved in
        const topicCounts = solvedQuestions.reduce((acc, q) => {
          q.topics.forEach(topic => {
            acc[topic.name] = (acc[topic.name] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>);
        const mostSolvedTopicEntry = Object.entries(topicCounts).sort(([,a], [,b]) => b - a)[0];
        const mostSolvedTopic = mostSolvedTopicEntry ? mostSolvedTopicEntry[0] : 'None';
        const mostSolvedTopicCount = mostSolvedTopicEntry ? mostSolvedTopicEntry[1] : 0;
        
        // Calculate current streak
        const currentStreak = userStats.currentStreak || 0;
        
        setStats({
          totalQuestions: questions.length,
          solvedCount: solvedQuestions.length,
          mostSolvedDifficulty,
          mostSolvedCompany,
          mostSolvedCompanyCount,
          mostSolvedTopic,
          mostSolvedTopicCount,
          favoritedCount: favoritedQuestions.length,
          remarkedCount: remarkedQuestions.length,
          currentStreak
        });
      } else {
        // Fallback to local calculation if API fails
        const solvedQuestions = questions.filter(q => q.progress?.[0]?.completed);
        const favoritedQuestions = questions.filter(q => (q.favorites?.length || 0) > 0);
        const remarkedQuestions = questions.filter(q => q.remarks && q.remarks.length > 0);
        
        const easySolved = solvedQuestions.filter(q => q.difficulty === 'EASY').length;
        const mediumSolved = solvedQuestions.filter(q => q.difficulty === 'MEDIUM').length;
        const hardSolved = solvedQuestions.filter(q => q.difficulty === 'HARD').length;
        
        // Find most solved difficulty
        const difficultyStats = [
          { name: 'Easy', count: easySolved, color: 'green' },
          { name: 'Medium', count: mediumSolved, color: 'yellow' },
          { name: 'Hard', count: hardSolved, color: 'red' }
        ];
        const mostSolvedDifficulty = difficultyStats.sort((a, b) => b.count - a.count)[0];
        
        // Most company solved from
        const companyCounts = solvedQuestions.reduce((acc, q) => {
          acc[q.company] = (acc[q.company] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const mostSolvedCompanyEntry = Object.entries(companyCounts).sort(([,a], [,b]) => b - a)[0];
        const mostSolvedCompany = mostSolvedCompanyEntry ? mostSolvedCompanyEntry[0] : 'None';
        const mostSolvedCompanyCount = mostSolvedCompanyEntry ? mostSolvedCompanyEntry[1] : 0;
        
        // Most topic solved in
        const topicCounts = solvedQuestions.reduce((acc, q) => {
          q.topics.forEach(topic => {
            acc[topic.name] = (acc[topic.name] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>);
        const mostSolvedTopicEntry = Object.entries(topicCounts).sort(([,a], [,b]) => b - a)[0];
        const mostSolvedTopic = mostSolvedTopicEntry ? mostSolvedTopicEntry[0] : 'None';
        const mostSolvedTopicCount = mostSolvedTopicEntry ? mostSolvedTopicEntry[1] : 0;
        
        setStats({
          totalQuestions: questions.length,
          solvedCount: solvedQuestions.length,
          mostSolvedDifficulty,
          mostSolvedCompany,
          mostSolvedCompanyCount,
          mostSolvedTopic,
          mostSolvedTopicCount,
          favoritedCount: favoritedQuestions.length,
          remarkedCount: remarkedQuestions.length,
          currentStreak: 0
        });
      }
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'HARD': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getUniqueCompanies = () => {
    return [...new Set(questions.map(q => q.company))].sort();
  };

  const getUniqueTopics = () => {
    const allTopics = questions.flatMap(q => q.topics.map(t => t.name));
    return [...new Set(allTopics)].sort();
  };

  const handleCompanyToggle = (company: string) => {
    setSelectedCompanies(prev => 
      prev.includes(company) 
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleToggleComplete = async (questionId: string, completed: boolean) => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, completed })
      });
      
      // Update local state
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, progress: [{ completed }] }
          : q
      ));
      
      toast({
        title: completed ? "Marked as completed" : "Marked as incomplete",
        description: "Progress updated successfully!",
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async (questionId: string) => {
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId })
      });
      
      // Update local state
      setQuestions(prev => prev.map(q => {
        if (q.id === questionId) {
          const isFavorited = (q.favorites?.length || 0) > 0;
          return { ...q, favorites: isFavorited ? [] : [{}] };
        }
        return q;
      }));
      
      toast({
        title: "Favorite updated",
        description: "Favorite status updated successfully!",
      });
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite.",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = (question: Question) => {
    setSelectedQuestion(question);
    setRemarkModalOpen(true);
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-8">
      {/* Question of the Day & Random Question - Reduced Height */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {questionOfDay && (
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 group" onClick={handleQuestionOfDayClick}>
            <CardContent className="p-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-700/20 animate-pulse"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-3 w-3 animate-bounce" />
                  <span className="text-xs font-semibold">Question of the Day</span>
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  </div>
                </div>
                <h3 className="font-semibold mb-1 text-sm truncate group-hover:text-yellow-200 transition-colors">{questionOfDay.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs py-0 px-1 backdrop-blur-sm">
                    {questionOfDay.difficulty}
                  </Badge>
                  <span className="text-xs opacity-90 truncate">{questionOfDay.company}</span>
                </div>
                <Button asChild variant="secondary" size="sm" className="text-xs h-6 group-hover:bg-white/90 transition-colors">
                  <span>
                    <ExternalLink className="h-2 w-2 mr-1 animate-pulse" />
                    Solve Now
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 group" onClick={handleRandomQuestion}>
          <CardContent className="p-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Shuffle className="h-3 w-3 animate-spin" />
                <span className="text-xs font-semibold">Random Challenge</span>
                <div className="ml-auto">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
              <p className="text-xs opacity-90 mb-2 group-hover:text-yellow-200 transition-colors">Pick a random problem from filtered results!</p>
              <Button variant="secondary" size="sm" disabled={filteredQuestions.length === 0} className="text-xs h-6 group-hover:bg-white/90 transition-colors">
                <Shuffle className="h-2 w-2 mr-1 group-hover:animate-spin" />
                Get Random
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid - 8x1 layout */}
      {stats && (
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-6">
          <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">Solved</div>
            </div>
            <div className="text-sm font-bold text-green-600">{stats.solvedCount}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-1">
              <Target className="h-3 w-3 text-blue-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div className="text-sm font-bold text-blue-600">{stats.totalQuestions}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-1">
              <Trophy className="h-3 w-3 text-purple-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">Top Difficulty</div>
            </div>
            <div className="text-xs font-bold text-purple-600 truncate">
              {stats.mostSolvedDifficulty?.name || 'None'} ({stats.mostSolvedDifficulty?.count || 0})
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-1">
              <Award className="h-3 w-3 text-indigo-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">Top Company</div>
            </div>
            <div className="text-xs font-bold text-indigo-600 truncate">
              {stats.mostSolvedCompany} ({stats.mostSolvedCompanyCount})
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-1">
              <Bookmark className="h-3 w-3 text-teal-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">Top Topic</div>
            </div>
            <div className="text-xs font-bold text-teal-600 truncate">
              {stats.mostSolvedTopic} ({stats.mostSolvedTopicCount})
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-1">
              <Heart className="h-3 w-3 text-pink-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">Favorites</div>
            </div>
            <div className="text-sm font-bold text-pink-600">{stats.favoritedCount}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-1">
              <StickyNote className="h-3 w-3 text-purple-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">Remarked</div>
            </div>
            <div className="text-sm font-bold text-purple-600">{stats.remarkedCount}</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="h-3 w-3 text-orange-600" />
              <div className="text-xs text-gray-600 dark:text-gray-400">Streak</div>
            </div>
            <div className="text-sm font-bold text-orange-600">{stats.currentStreak}</div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Practice Problems</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Solve coding problems to improve your skills
        </p>
      </div>

      {/* Enhanced Single Line Filters */}
      <div className="mb-6 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>
          
          {/* Difficulty */}
          <div className="min-w-[140px]">
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All difficulties</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Company Multi-select */}
          <div className="min-w-[160px]">
            <Popover open={companyPopoverOpen} onOpenChange={setCompanyPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 w-full justify-between text-sm">
                  {selectedCompanies.length === 0 ? "Companies" : `${selectedCompanies.length} selected`}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search companies..." />
                  <CommandList>
                    <CommandEmpty>No company found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                      <div 
                        className="flex items-center space-x-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        onClick={() => {
                          setSelectedCompanies([]);
                        }}
                      >
                        <Checkbox 
                          checked={selectedCompanies.length === 0} 
                          className="mr-2" 
                        />
                        All Companies
                      </div>
                      {getUniqueCompanies().map((company) => (
                        <div 
                          key={company}
                          className="flex items-center space-x-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCompanyToggle(company);
                          }}
                        >
                          <Checkbox 
                            checked={selectedCompanies.includes(company)} 
                            className="mr-2" 
                          />
                          {company}
                        </div>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Topic Multi-select */}
          <div className="min-w-[140px]">
            <Popover open={topicPopoverOpen} onOpenChange={setTopicPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 w-full justify-between text-sm">
                  {selectedTopics.length === 0 ? "Topics" : `${selectedTopics.length} selected`}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search topics..." />
                  <CommandList>
                    <CommandEmpty>No topic found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                      <div 
                        className="flex items-center space-x-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        onClick={() => {
                          setSelectedTopics([]);
                        }}
                      >
                        <Checkbox 
                          checked={selectedTopics.length === 0} 
                          className="mr-2" 
                        />
                        All Topics
                      </div>
                      {getUniqueTopics().map((topic) => (
                        <div 
                          key={topic}
                          className="flex items-center space-x-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleTopicToggle(topic);
                          }}
                        >
                          <Checkbox 
                            checked={selectedTopics.includes(topic)} 
                            className="mr-2" 
                          />
                          {topic}
                        </div>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Status Filter */}
          <div className="min-w-[120px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="solved">Solved</SelectItem>
                <SelectItem value="unsolved">Unsolved</SelectItem>
                <SelectItem value="favorites">Favorites</SelectItem>
                <SelectItem value="remarked">Remarked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="min-w-[140px]">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
                <SelectItem value="difficulty-asc">Easy to Hard</SelectItem>
                <SelectItem value="difficulty-desc">Hard to Easy</SelectItem>
                <SelectItem value="company-asc">Company A-Z</SelectItem>
                <SelectItem value="company-desc">Company Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedDifficulty('all');
              setSelectedCompanies([]);
              setSelectedTopics([]);
              setStatusFilter('all');
              setSortBy('title-asc');
              setCurrentPage(1);
            }}
            className="h-9 px-3 text-sm"
          >
            <Filter className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Pagination Controls - Moved above the results */}
      {totalPages > 1 && (
        <div className="mb-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages} • Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} problems
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-2"
              >
                ««
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3"
              >
                Previous
              </Button>
              
              {getVisiblePages().map((page, index) => (
                <Button
                  key={index}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={typeof page !== 'number'}
                  className="min-w-[36px] px-2"
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3"
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2"
              >
                »»
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="grid gap-4">
        {paginatedQuestions.map((question) => {
          const isCompleted = question.progress?.[0]?.completed || false;
          const isFavorited = (question.favorites?.length || 0) > 0;
          
          return (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{question.title}</CardTitle>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                      <Badge variant="outline">{question.company}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {question.topics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {topic.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleComplete(question.id, !isCompleted)}
                      className={isCompleted ? 'text-green-600' : 'text-gray-400'}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(question.id)}
                      className={isFavorited ? 'text-red-600' : 'text-gray-400'}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddNote(question)}
                    >
                      <StickyNote className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={question.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Pagination Controls - Moved outside and improved */}
      {totalPages > 1 && (
        <div className="mt-8 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages} • Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} problems
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-2"
              >
                ««
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3"
              >
                Previous
              </Button>
              
              {getVisiblePages().map((page, index) => (
                <Button
                  key={index}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={typeof page !== 'number'}
                  className="min-w-[36px] px-2"
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3"
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2"
              >
                »»
              </Button>
            </div>
          </div>
        </div>
      )}

      {filteredQuestions.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No problems found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}

      {/* Remark Modal */}
      {selectedQuestion && (
        <RemarkModal
          isOpen={remarkModalOpen}
          onClose={() => {
            setRemarkModalOpen(false);
            setSelectedQuestion(null);
          }}
          questionId={selectedQuestion.id}
          questionTitle={selectedQuestion.title}
        />
      )}
    </div>
  );
}
