'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Please enter a valid URL'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  company: z.string().min(1, 'Company is required'),
  timeline: z.enum(['THIRTY_DAYS', 'THREE_MONTHS', 'SIX_MONTHS', 'MORE_THAN_SIX_MONTHS']),
  topics: z.string().min(1, 'At least one topic is required'),
});

type QuestionFormValues = z.infer<typeof formSchema>;

interface QuestionFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionSaved?: (question: any) => void;
  editingQuestion?: any;
}

export function QuestionFormSheet({ open, onOpenChange, onQuestionSaved, editingQuestion }: QuestionFormSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      url: '',
      difficulty: 'EASY',
      company: '',
      timeline: 'THIRTY_DAYS',
      topics: '',
    },
  });

  useEffect(() => {
    if (editingQuestion) {
      const topicsString = editingQuestion.topics?.map((t: any) => t.name).join(', ') || '';
      form.reset({
        title: editingQuestion.title || '',
        url: editingQuestion.url || '',
        difficulty: editingQuestion.difficulty || 'EASY',
        company: editingQuestion.company || '',
        timeline: editingQuestion.timeline || 'THIRTY_DAYS',
        topics: topicsString,
      });
    } else {
      form.reset({
        title: '',
        url: '',
        difficulty: 'EASY',
        company: '',
        timeline: 'THIRTY_DAYS',
        topics: '',
      });
    }
  }, [editingQuestion, form]);
  
  const onSubmit = async (values: QuestionFormValues) => {
    try {
      setIsLoading(true);
      
      const endpoint = editingQuestion 
        ? `/api/admin/questions/${editingQuestion.id}` 
        : '/api/admin/questions';
      
      const method = editingQuestion ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to ${editingQuestion ? 'update' : 'create'} question`);
      }
      
      toast({
        title: 'Success',
        description: `Question ${editingQuestion ? 'updated' : 'created'} successfully`,
      });
      
      form.reset();
      onOpenChange(false);
      
      if (onQuestionSaved) {
        onQuestionSaved(responseData);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${editingQuestion ? 'update' : 'create'} question`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</SheetTitle>
          <SheetDescription>
            {editingQuestion 
              ? 'Update the question details below.' 
              : 'Add a new coding question to the platform.'
            }
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
                    <Input placeholder="Two Sum" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LeetCode URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://leetcode.com/problems/two-sum/" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Google" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeline</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="THIRTY_DAYS">30 Days</SelectItem>
                      <SelectItem value="THREE_MONTHS">3 Months</SelectItem>
                      <SelectItem value="SIX_MONTHS">6 Months</SelectItem>
                      <SelectItem value="MORE_THAN_SIX_MONTHS">6+ Months</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="topics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topics (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Array, Hash Table, Two Pointers" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <SheetFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (editingQuestion ? "Updating..." : "Creating...") : (editingQuestion ? "Update Question" : "Create Question")}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
