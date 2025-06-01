'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminManagementTable } from './admin-management-table';
import { QuestionTable } from './question-table';
import { UsersTable } from './users-table';
import { Button } from '@/components/ui/button';
import { Users, Shield, Code, Plus, Upload } from 'lucide-react';
import { QuestionFormSheet } from './question-form-sheet';
import { CSVUploadModal } from './csv-upload-modal';
import { useToast } from '@/components/ui/use-toast';

interface SuperAdminTabsProps {
  onRefreshStats?: () => void;
}

export function SuperAdminTabs({ onRefreshStats }: SuperAdminTabsProps) {
  const [activeTab, setActiveTab] = useState('admins');
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Add missing state variables
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    company: '',
    timeline: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    hasNext: false,
    hasPrev: false
  });
  
  const { toast } = useToast();

  const handleUserCreated = () => {
    setIsUserFormOpen(false);
    setIsCreatingUser(false);
    if (onRefreshStats) {
      onRefreshStats();
    }
  };

  const handleAddUser = () => {
    setIsCreatingUser(true);
    setIsUserFormOpen(true);
  };

  const handleQuestionSaved = () => {
    setIsQuestionFormOpen(false);
    setEditingQuestion(null);
    if (onRefreshStats) {
      onRefreshStats();
    }
  };

  const handleCSVUploadComplete = () => {
    setIsCSVUploadOpen(false);
    if (onRefreshStats) {
      onRefreshStats();
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuestions(questions.filter(q => q.id !== questionId));
        toast({
          title: 'Success',
          description: 'Question deleted successfully',
        });
      } else {
        throw new Error('Failed to delete question');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive',
      });
    }
  };

  const tabs = [
    {
      value: 'admins',
      label: 'Admins',
      icon: <Shield className="h-4 w-4" />,
      count: null
    },
    {
      value: 'questions',
      label: 'Questions',
      icon: <Code className="h-4 w-4" />,
      count: null
    },
    {
      value: 'users',
      label: 'Users',
      icon: <Users className="h-4 w-4" />,
      count: null
    }
  ];

  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: questionsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(sortBy && { sortBy }),
        ...(sortDirection && { sortDirection }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.company && { company: filters.company }),
        ...(filters.timeline && { timeline: filters.timeline })
      });

      const response = await fetch(`/api/admin/questions?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch questions',
        variant: 'destructive',
      });
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortBy(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting
  };

  useEffect(() => {
    if (activeTab === 'questions') {
      fetchQuestions();
    }
  }, [activeTab, currentPage, searchQuery, sortBy, sortDirection, filters]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">System Management</CardTitle>
          <div className="text-sm text-muted-foreground">
            Manage all aspects of the BeatCode platform
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pb-4 border-b">
            <TabsList className="grid w-full grid-cols-3 h-12">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value}
                  className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tab.icon}
                  {tab.label}
                  {tab.count && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-muted rounded-full">
                      {tab.count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="admins" className="mt-0">
              <AdminManagementTable onAdminCreated={onRefreshStats} />
            </TabsContent>

            <TabsContent value="questions" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Question Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage coding questions and practice problems
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsQuestionFormOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                    <Button
                      onClick={() => setIsCSVUploadOpen(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload from CSV
                    </Button>
                  </div>
                </div>
                <QuestionTable
                  questions={questions}
                  loading={questionsLoading}
                  onEdit={(question) => {
                    setEditingQuestion(question);
                    setIsQuestionFormOpen(true);
                  }}
                  onDelete={handleDeleteQuestion}
                  onSort={handleSort}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                />
              </div>
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <UsersTable 
                isUserFormOpen={isUserFormOpen}
                setIsUserFormOpen={setIsUserFormOpen}
                onUserCreated={handleUserCreated}
                defaultRole="USER"
                isCreatingUser={isCreatingUser}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>

      <QuestionFormSheet
        open={isQuestionFormOpen}
        onOpenChange={setIsQuestionFormOpen}
        onQuestionSaved={handleQuestionSaved}
        editingQuestion={editingQuestion}
      />

      <CSVUploadModal
        open={isCSVUploadOpen}
        onOpenChange={setIsCSVUploadOpen}
        onUploadComplete={handleCSVUploadComplete}
      />
    </Card>
  );
}
