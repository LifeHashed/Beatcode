'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, ExternalLink, RotateCcw, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { QuestionFormSheet } from './question-form-sheet';

interface Question {
  id: string;
  title: string;
  url: string;
  difficulty: string;
  company: string;
  timeline: string;
  topics?: string | { id: string; name: string }[];
  _count?: {
    progress: number;
    favorites: number;
  };
}

// Define sort options type
type SortField = 'difficulty' | 'company' | 'title' | '';
type SortDirection = 'asc' | 'desc';

export function QuestionTable() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [timelineFilter, setTimelineFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSeeding, setIsSeeding] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, [searchTerm, difficultyFilter, companyFilter, timelineFilter, page, sortField, sortDirection]);

  const fetchQuestions = async (page = 1, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/admin/questions?page=${page}&limit=10`;
      
      // Add filters to URL if they exist
      if (searchTerm && searchTerm.trim()) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (difficultyFilter && difficultyFilter !== '') url += `&difficulty=${encodeURIComponent(difficultyFilter)}`;
      if (companyFilter && companyFilter.trim()) url += `&company=${encodeURIComponent(companyFilter)}`;
      if (timelineFilter && timelineFilter !== '') url += `&timeline=${encodeURIComponent(timelineFilter)}`;
      
      // Add sort parameters if they exist
      if (sortField) url += `&sortBy=${sortField}&sortDirection=${sortDirection}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch questions');
      }
      
      const data = await response.json();
      
      // Handle different response structures
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Ensure questions array has proper structure with default values
      const questionsArray = Array.isArray(data) ? data : (data.questions || []);
      const questionsWithDefaults = questionsArray.map((question: any) => ({
        ...question,
        topics: question.topics || [],
        _count: question._count || { progress: 0, favorites: 0 }
      }));
      
      setQuestions(questionsWithDefaults);
      setTotalPages(data.pagination?.totalPages || 1);
      console.log('Set questions:', questionsWithDefaults);
    } catch (error) {
      console.error('Error fetching questions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load questions';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedQuestions = async () => {
    try {
      setIsSeeding(true);
      const response = await fetch('/api/admin/seed-questions', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to seed questions');
      }

      const data = await response.json();

      toast({
        title: 'Success',
        description: `${data.summary.created} questions added, ${data.summary.skipped} already existed`,
      });
      
      // Refresh the questions list
      fetchQuestions();
    } catch (error) {
      console.error('Error seeding questions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to seed questions',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setIsQuestionFormOpen(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question? It will be moved to recycle bin.')) return;

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuestions(questions.filter((question: any) => question.id !== questionId));
        toast({
          title: 'Success',
          description: 'Question moved to recycle bin',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive',
      });
    }
  };

  const handleQuestionSaved = (savedQuestion: any) => {
    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === editingQuestion.id ? savedQuestion : q));
    } else {
      setQuestions([savedQuestion, ...questions]);
    }
    setEditingQuestion(null);
    setIsQuestionFormOpen(false);
  };

  const handleFormClose = () => {
    setIsQuestionFormOpen(false);
    setEditingQuestion(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Add timeline mapping function
  const getTimelineLabel = (timeline: string) => {
    switch (timeline) {
      case 'THIRTY_DAYS': return '30 Days';
      case 'THREE_MONTHS': return '3 Months';
      case 'SIX_MONTHS': return '6 Months';
      case 'MORE_THAN_SIX_MONTHS': return '6+ Months';
      case 'OLD': return 'All';
      default: return timeline;
    }
  };

  // Add function to parse topics
  const parseTopics = (topics: string | { id: string; name: string }[] | undefined): string[] => {
    if (!topics) return [];
    
    if (typeof topics === 'string') {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(topics);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        // If not an array, treat as comma-separated string
        return topics.split(',').map(topic => topic.trim()).filter(Boolean);
      } catch {
        // If JSON parsing fails, treat as comma-separated string
        return topics.split(',').map(topic => topic.trim()).filter(Boolean);
      }
    }
    
    if (Array.isArray(topics)) {
      return topics.map(topic => typeof topic === 'string' ? topic : topic.name);
    }
    
    return [];
  };

  // Handle sorting changes
  const handleSort = (field: string) => {
    const isCurrentField = sortField === field;
    const newDirection = isCurrentField && sortDirection === 'asc' ? 'desc' : 'asc';
    
    setSortField(field);
    setSortDirection(newDirection);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" /> 
      : <ArrowDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading questions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-destructive mb-4">Error loading questions: {error}</p>
            <Button onClick={fetchQuestions} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-10"
            />
          </div>
          <Select value={difficultyFilter} onValueChange={(value) => setDifficultyFilter(value === 'all' ? '' : value)}>
            <SelectTrigger className="w-[170px] h-10">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Company"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-[170px] h-10"
          />
          <Select value={timelineFilter} onValueChange={(value) => setTimelineFilter(value === 'all' ? '' : value)}>
            <SelectTrigger className="w-[170px] h-10">
              <SelectValue placeholder="Timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Timelines</SelectItem>
              <SelectItem value="THIRTY_DAYS">30 Days</SelectItem>
              <SelectItem value="THREE_MONTHS">3 Months</SelectItem>
              <SelectItem value="SIX_MONTHS">6 Months</SelectItem>
              <SelectItem value="MORE_THAN_SIX_MONTHS">6+ Months</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Sort dropdown */}
          <Select 
            value={sortField ? `${sortField}-${sortDirection}` : 'none'} 
            onValueChange={(value) => {
              if (value === 'none') {
                setSortField('');
              } else {
                const [field, direction] = value.split('-') as [SortField, SortDirection];
                setSortField(field);
                setSortDirection(direction);
              }
            }}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Sort..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No sorting</SelectItem>
              <SelectItem value="title-asc">Title (A to Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z to A)</SelectItem>
              <SelectItem value="difficulty-asc">Difficulty (Easy to Hard)</SelectItem>
              <SelectItem value="difficulty-desc">Difficulty (Hard to Easy)</SelectItem>
              <SelectItem value="company-asc">Company (A to Z)</SelectItem>
              <SelectItem value="company-desc">Company (Z to A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {questions.length > 0 ? (
            questions.map((question) => (
              <div
                key={question.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{question.title}</h3>
                    <a 
                      href={question.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    <span>Company: {question.company}</span>
                    <span>Timeline: {getTimelineLabel(question.timeline)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {parseTopics(question.topics).map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right text-sm text-muted-foreground mr-4">
                    <div>Completed: {question._count?.progress || 0}</div>
                    <div>Favorites: {question._count?.favorites || 0}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditQuestion(question)}
                    title="Edit question"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id)}
                    title="Delete question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No questions found matching your filters.</p>
              <p className="text-sm mt-2">Try adjusting your search criteria or add some sample questions to get started.</p>
              <Button onClick={handleSeedQuestions} disabled={isSeeding} className="mt-4">
                {isSeeding ? 'Adding Sample Questions...' : 'Add Sample Questions'}
              </Button>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>

      {/* Question Form Sheet */}
      <QuestionFormSheet
        open={isQuestionFormOpen}
        onOpenChange={handleFormClose}
        onQuestionSaved={handleQuestionSaved}
        editingQuestion={editingQuestion}
      />
    </Card>
  );
}
