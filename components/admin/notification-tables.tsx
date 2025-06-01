'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ArrowUpDown, Bell, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NotificationTablesProps {
  refreshTrigger?: number;
}

export function NotificationTables({ refreshTrigger }: NotificationTablesProps) {
  const [sentNotifications, setSentNotifications] = useState<any[]>([]);
  const [receivedNotifications, setReceivedNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, [refreshTrigger]);

  const fetchNotifications = async () => {
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        fetch('/api/admin/notifications/sent'),
        fetch('/api/admin/notifications/received'),
      ]);

      if (sentResponse.ok) {
        const sentData = await sentResponse.json();
        setSentNotifications(sentData.notifications || []);
      }

      if (receivedResponse.ok) {
        const receivedData = await receivedResponse.json();
        setReceivedNotifications(receivedData.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortNotifications = (notifications: any[]) => {
    let filtered = notifications.filter((notification) =>
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.body?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const NotificationList = ({ notifications, type }: { notifications: any[], type: 'sent' | 'received' }) => (
    <div className="space-y-4">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div
            key={notification.id}
            className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold">{notification.title}</h4>
                <Badge variant="outline">{notification.topic}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(notification.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {notification.body}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {type === 'sent' ? (
                  <>
                    <Send className="h-3 w-3" />
                    <span>Sent by {notification.sender?.name || 'System'}</span>
                  </>
                ) : (
                  <>
                    <Bell className="h-3 w-3" />
                    <span>From {notification.sender?.name || 'System'}</span>
                  </>
                )}
              </div>
              {type === 'sent' && (
                <Badge variant="secondary" className="text-xs">
                  {notification.recipients?.length || 0} recipients
                </Badge>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-medium mb-2">
            No {type} notifications
          </h4>
          <p className="text-sm">
            {type === 'sent' 
              ? 'You haven\'t sent any notifications yet.' 
              : 'You have no received notifications.'
            }
          </p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="topic">Topic</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Received ({receivedNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Sent ({sentNotifications.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="received" className="mt-6">
            <NotificationList 
              notifications={filterAndSortNotifications(receivedNotifications)} 
              type="received" 
            />
          </TabsContent>
          
          <TabsContent value="sent" className="mt-6">
            <NotificationList 
              notifications={filterAndSortNotifications(sentNotifications)} 
              type="sent" 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
