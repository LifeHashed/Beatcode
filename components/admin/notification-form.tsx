'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  topic: z.string().min(1, 'Topic is required'),
  body: z.string().min(1, 'Body is required'),
  sendToAdmins: z.boolean().default(false),
  sendToUsers: z.boolean().default(false),
});

type NotificationFormValues = z.infer<typeof formSchema>;

interface NotificationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNotificationSent?: () => void;
}

export function NotificationForm({ open, onOpenChange, onNotificationSent }: NotificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      topic: '',
      body: '',
      sendToAdmins: false,
      sendToUsers: false,
    },
  });

  const onSubmit = async (values: NotificationFormValues) => {
    if (!values.sendToAdmins && !values.sendToUsers) {
      toast({
        title: 'Error',
        description: 'Please select at least one recipient group',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send notification');
      }

      toast({
        title: 'Success',
        description: 'Notification sent successfully',
      });

      form.reset();
      onOpenChange(false);
      
      if (onNotificationSent) {
        onNotificationSent();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Create New Notification</SheetTitle>
          <SheetDescription>
            Send announcements and updates to users and admins.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Notification title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="Notification topic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Send To</FormLabel>
              
              <FormField
                control={form.control}
                name="sendToAdmins"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>All Admins</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sendToUsers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>All Users</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your notification message..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Notification'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
