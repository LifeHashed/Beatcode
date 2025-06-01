'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionForm } from '@/components/admin/question-form';
import { QuestionTable } from '@/components/admin/question-table';
import { UsersTable } from '@/components/admin/users-table';
import { PlusCircle, Users, Database, BarChart, Upload } from 'lucide-react';
import { CSVUploadModal } from '@/components/admin/csv-upload-modal';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false); // New state for CSV upload modal

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
        router.push('/dashboard/user');
      } else {
        // Remove the redirect to feedback - let admin dashboard load normally
        fetchStats();
      }
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle CSV upload completion
  const handleCSVUploadComplete = () => {
    setIsCSVUploadOpen(false);
    fetchStats(); // Refresh stats after upload
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 mt-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage questions, view statistics, and track user progress.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Questions"
              value={stats.totalQuestions}
              description="Across all companies"
              icon={<Database className="h-4 w-4 text-blue-600" />}
            />
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              description="Registered accounts"
              icon={<Users className="h-4 w-4 text-green-600" />}
            />
            <StatsCard
              title="Questions Added"
              value={stats.questionsAddedThisMonth}
              description="This month"
              icon={<PlusCircle className="h-4 w-4 text-purple-600" />}
            />
            <StatsCard
              title="Active Users"
              value={stats.activeUsersThisWeek}
              description="This week"
              icon={<BarChart className="h-4 w-4 text-yellow-600" />}
            />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-6">
            <Card>
              <CardHeader>
                {/* Add a flex container with justify-between to position title and buttons */}
                <div className="flex items-center justify-between">
                  <CardTitle>Question Management</CardTitle>
                  {/* Add buttons here next to the title */}
                  <div className="flex gap-2">
                    <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Add Question
                    </Button>
                    <Button 
                      onClick={() => setIsCSVUploadOpen(true)}
                      variant="outline" 
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload from CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <QuestionTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UsersTable />
          </TabsContent>
        </Tabs>

        {isFormOpen && <QuestionForm onClose={() => setIsFormOpen(false)} />}
        
        {/* Add CSV Upload Modal */}
        <CSVUploadModal 
          open={isCSVUploadOpen} 
          onOpenChange={setIsCSVUploadOpen}
          onUploadComplete={handleCSVUploadComplete}
        />
      </div>
    </div>
  );
}
