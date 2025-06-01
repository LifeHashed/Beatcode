'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';
import { QuestionFormSheet } from '@/components/admin/question-form-sheet';
import { useToast } from '@/components/ui/use-toast';

interface Question {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  company: string;
  topics: string;
  timeline: string;
  url: string;
  leetcodeLink: string;
  description: string;
  _count?: {
    progress: number;
    favorites: number;
  };
}

const ITEMS_PER_PAGE = 50;

export default function AdminProblemsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState<string>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  const { toast } = useToast();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...(searchQuery && { search: searchQuery }),
        ...(sortBy && { sortBy }),
        ...(sortDirection && { sortDirection })
      });

      const response = await fetch(`/api/admin/questions?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/admin/problems/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        toast({
          title: 'Success',
          description: 'Question deleted successfully',
        });
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive',
      });
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormOpen(true);
  };

  const handleQuestionSaved = () => {
    setFormOpen(false);
    setEditingQuestion(null);
    fetchQuestions();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortBy(field);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, searchQuery, sortBy, sortDirection]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Problem Management</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Problem
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Difficulties</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Problems ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading questions...</div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{question.title}</h3>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Company: {question.company}</div>
                        <div>Topics: {question.topics}</div>
                        <div>Timeline: {question.timeline}</div>
                        {question._count && (
                          <div className="flex gap-4">
                            <span>Progress: {question._count.progress} users</span>
                            <span>Favorites: {question._count.favorites} users</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(question.leetcodeLink || question.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Form Modal */}
      <QuestionFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        onQuestionSaved={handleQuestionSaved}
        editingQuestion={editingQuestion}
      />
    </div>
  );
}
