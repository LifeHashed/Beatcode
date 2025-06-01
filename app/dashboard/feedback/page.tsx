'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedbackButton } from '@/components/feedback/feedback-button';
import { useToast } from '@/components/ui/use-toast';
import { 
  MessageSquare, 
  Send, 
  Inbox, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Lightbulb,
  Bug,
  HelpCircle
} from 'lucide-react';

interface Feedback {
  id: number;
  type: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  fromUser: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  toUser?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  replies: any[];
}

export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [sentFeedback, setSentFeedback] = useState<Feedback[]>([]);
  const [receivedFeedback, setReceivedFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchFeedback();
    }
  }, [status, router]);

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback');
      if (!response.ok) throw new Error('Failed to fetch feedback');
      
      const data = await response.json();
      setSentFeedback(data.sent || []);
      setReceivedFeedback(data.received || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load feedback. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FEATURE_RECOMMENDATION': return <Lightbulb className="h-4 w-4" />;
      case 'BUG_REPORT': return <Bug className="h-4 w-4" />;
      case 'NEW_QUESTION': return <HelpCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Feedback Center</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage and respond to user feedback' : 'Share your thoughts and track your feedback'}
          </p>
        </div>
        {!isAdmin && (
          <FeedbackButton variant="default" />
        )}
      </div>

      <Tabs defaultValue="sent" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            {isAdmin ? 'All Feedback' : 'Sent Feedback'}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Received Messages
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                {isAdmin ? 'All User Feedback' : 'Your Feedback'}
              </CardTitle>
              <CardDescription>
                {isAdmin 
                  ? 'All feedback submitted by users'
                  : 'Feedback you\'ve submitted to the administrators'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentFeedback.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isAdmin ? 'No feedback received yet' : 'You haven\'t submitted any feedback yet'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentFeedback.map((feedback) => (
                    <Card key={feedback.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(feedback.type)}
                          <h3 className="font-semibold">{feedback.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(feedback.status)}
                          <Badge className={getStatusColor(feedback.status)}>
                            {feedback.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{feedback.message}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {isAdmin && `From: ${feedback.fromUser.name} (${feedback.fromUser.email})`}
                          {!isAdmin && `Type: ${feedback.type.replace('_', ' ')}`}
                        </span>
                        <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="received" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Inbox className="h-5 w-5" />
                  Received Messages
                </CardTitle>
                <CardDescription>
                  Messages and replies from other administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {receivedFeedback.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages received yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedFeedback.map((feedback) => (
                      <Card key={feedback.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(feedback.type)}
                            <h3 className="font-semibold">{feedback.title}</h3>
                          </div>
                          <Badge className={getStatusColor(feedback.status)}>
                            {feedback.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{feedback.message}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>From: {feedback.fromUser.name} ({feedback.fromUser.email})</span>
                          <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
