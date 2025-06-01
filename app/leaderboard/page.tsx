'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  totalSolved: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  currentStreak: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      
      if (response.ok) {
        setLeaderboard(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return 'default';
      case 2:
        return 'secondary';
      case 3:
        return 'outline';
      default:
        return 'outline';
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600 mt-2">See how you rank against other coders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading leaderboard...</div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-4">
              {leaderboard.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    user.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getRankIcon(user.rank)}
                      <Badge variant={getRankBadgeVariant(user.rank)}>
                        Rank {user.rank}
                      </Badge>
                    </div>

                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image || ''} alt={user.name} />
                      <AvatarFallback>
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-bold">{user.totalSolved}</div>
                      <div className="text-xs text-gray-600">Total Solved</div>
                    </div>

                    <div className="flex gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        {user.easyCount} Easy
                      </Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {user.mediumCount} Medium
                      </Badge>
                      <Badge className="bg-red-100 text-red-800">
                        {user.hardCount} Hard
                      </Badge>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold">{user.currentStreak}</div>
                      <div className="text-xs text-gray-600">Day Streak</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No data available
              </h3>
              <p className="text-gray-600">
                Be the first to solve some problems!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
