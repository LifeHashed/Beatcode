'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, BookOpen, Calendar, Shield, 
  TrendingUp, Library, Settings 
} from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not logged in or not an admin
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    if (session && session.user && session.user.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
    }

    if (session?.user) {
      fetchStats();
    }
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Super Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Master control panel for BeatCode platform.</p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={loading ? null : stats?.totalUsers || 0} 
          description="Registered platform users" 
          icon={<Users className="h-6 w-6" />}
          color="bg-blue-100"
          iconColor="text-blue-600"
        />
        
        <StatCard 
          title="Total Questions" 
          value={loading ? null : stats?.totalQuestions || 0} 
          description="Available coding problems" 
          icon={<BookOpen className="h-6 w-6" />}
          color="bg-green-100"
          iconColor="text-green-600"
        />
        
        <StatCard 
          title="Questions Added" 
          value={loading ? null : stats?.questionsThisMonth || 0} 
          description="This month" 
          icon={<Calendar className="h-6 w-6" />}
          color="bg-amber-100"
          iconColor="text-amber-600"
        />
        
        <StatCard 
          title="Total Admins" 
          value={loading ? null : stats?.totalAdmins || 0} 
          description="Platform administrators" 
          icon={<Shield className="h-6 w-6" />}
          color="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Platform Overview */}
      <h2 className="text-2xl font-semibold mb-4">Platform Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : stats?.totalUsers || 0} total users</div>
            {!loading && stats?.monthlyGrowth && (
              <p className="text-sm text-muted-foreground mt-1">
                {stats.monthlyGrowth}% growth in the last 30 days
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Library className="mr-2 h-5 w-5 text-green-500" />
              Content Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : stats?.totalQuestions || 0} coding problems</div>
            {!loading && stats?.mostSolvedQuestion && (
              <p className="text-sm text-muted-foreground mt-1">
                Most solved: {stats.mostSolvedQuestion.substring(0, 25)}{stats.mostSolvedQuestion.length > 25 ? '...' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Settings className="mr-2 h-5 w-5 text-purple-500" />
              Administration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : stats?.totalAdmins || 0} active admins</div>
            {!loading && stats?.activeUsersToday !== undefined && (
              <p className="text-sm text-muted-foreground mt-1">
                {stats.activeUsersToday} users active today
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {!loading && stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {stats.recentActivity.map((activity: any) => (
                  <li key={activity.id} className="p-4 flex items-start">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 mr-3"></div>
                    <div>
                      <p>{activity.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, description, icon, color, iconColor }: { 
  title: string;
  value: number | null;
  description: string;
  icon: React.ReactNode;
  color: string;
  iconColor: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <div className="mt-1 text-3xl font-semibold">
              {value === null ? <Skeleton className="h-8 w-16" /> : value}
            </div>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <div className={`${color} p-3 rounded-full ${iconColor}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
