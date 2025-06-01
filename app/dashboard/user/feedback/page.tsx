'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { FeedbackModal } from '@/components/feedback/feedback-modal';

interface Feedback {
  id: number;
  type: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
  adminReply?: {
    message: string;
    createdAt: string;
    fromUser: {
      name: string;
      role: string;
    };
  };
}

export default function UserFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('/api/feedback');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'RESOLVED':
        return 'bg-green-500';
      case 'REJECTED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Feedback</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold">My Feedback</h1>
          <p className="text-muted-foreground">
            View and manage your submitted feedback
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Submit Feedback
        </Button>
      </div>

      {feedbacks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No feedback submitted</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't submitted any feedback yet. Share your thoughts to help us improve!
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Your First Feedback
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{feedback.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{feedback.type.replace('_', ' ')}</Badge>
                    <Badge className={getStatusColor(feedback.status)}>
                      {getStatusIcon(feedback.status)}
                      <span className="ml-1">{feedback.status}</span>
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{feedback.message}</p>
                
                {feedback.adminReply && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Admin Response:</h4>
                    <p className="text-muted-foreground mb-2">{feedback.adminReply.message}</p>
                    <p className="text-xs text-muted-foreground">
                      Responded by {feedback.adminReply.fromUser.name} on{' '}
                      {new Date(feedback.adminReply.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FeedbackModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
