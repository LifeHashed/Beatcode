'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Search, Filter } from 'lucide-react';

interface Feedback {
  id: number;
  type: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
  fromUser: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  adminReply?: {
    message: string;
    createdAt: string;
    fromUser: {
      name: string;
      role: string;
    };
  };
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, [filter]);

  const fetchFeedbacks = async () => {
    try {
      const params = new URLSearchParams();
      if (filter) params.append('type', filter);
      
      const response = await fetch(`/api/admin/feedback?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.feedbacks);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback =>
    feedback.title.toLowerCase().includes(search.toLowerCase()) ||
    feedback.message.toLowerCase().includes(search.toLowerCase()) ||
    feedback.fromUser.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Feedback Management</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feedback Management</h1>
          <p className="text-muted-foreground">
            Review and respond to user feedback
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="FEEDBACK">Feedback</SelectItem>
            <SelectItem value="FEATURE_RECOMMENDATION">Feature Request</SelectItem>
            <SelectItem value="NEW_QUESTION">Question</SelectItem>
            <SelectItem value="BUG_REPORT">Bug Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredFeedbacks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No feedback found</h3>
            <p className="text-muted-foreground text-center">
              {search || filter ? 'No feedback matches your current filters.' : 'No feedback has been submitted yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFeedbacks.map((feedback) => (
            <Card key={feedback.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{feedback.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{feedback.type.replace('_', ' ')}</Badge>
                    <Badge variant={feedback.status === 'PENDING' ? 'secondary' : 'default'}>
                      {feedback.status}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  From {feedback.fromUser.name} ({feedback.fromUser.email}) •{' '}
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{feedback.message}</p>
                
                {feedback.adminReply ? (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Admin Response:</h4>
                    <p className="text-muted-foreground mb-2">{feedback.adminReply.message}</p>
                    <p className="text-xs text-muted-foreground">
                      Responded by {feedback.adminReply.fromUser.name} on{' '}
                      {new Date(feedback.adminReply.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <Button size="sm">
                    Reply to Feedback
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
