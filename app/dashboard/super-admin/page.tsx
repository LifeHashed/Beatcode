'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SuperAdminDashboard } from '@/components/admin/super-admin-dashboard';
import { SuperAdminTabs } from '@/components/admin/super-admin-tabs';

export default function SuperAdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'SUPER_ADMIN') {
        if (session?.user?.role === 'ADMIN') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/user');
        }
      } else {
        setLoading(false);
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

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              Loading super admin dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Stats Dashboard */}
        <div className="mb-6">
          <SuperAdminDashboard />
        </div>

        {/* Unified Management Interface */}
        <SuperAdminTabs onRefreshStats={fetchStats} />
      </div>
    </div>
  );
}
