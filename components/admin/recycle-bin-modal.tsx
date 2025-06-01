'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RecycleBinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore?: () => void;
}

export function RecycleBinModal({ open, onOpenChange, onRestore }: RecycleBinModalProps) {
  const [deletedQuestions, setDeletedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchDeletedQuestions();
    }
  }, [open]);

  const fetchDeletedQuestions = async () => {
    try {
      const response = await fetch('/api/admin/questions/deleted');
      const data = await response.json();
      setDeletedQuestions(data);
    } catch (error) {
      console.error('Error fetching deleted questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load deleted questions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}/restore`, {
        method: 'POST',
      });

      if (response.ok) {
        setDeletedQuestions(deletedQuestions.filter(q => q.id !== questionId));
        toast({
          title: 'Success',
          description: 'Question restored successfully',
        });
        if (onRestore) onRestore();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restore question',
        variant: 'destructive',
      });
    }
  };

  const handlePermanentDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to permanently delete this question? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/questions/${questionId}/permanent`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeletedQuestions(deletedQuestions.filter(q => q.id !== questionId));
        toast({
          title: 'Success',
          description: 'Question permanently deleted',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to permanently delete question',
        variant: 'destructive',
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'HARD': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Recycle Bin
          </DialogTitle>
          <DialogDescription>
            Restore or permanently delete questions. Restored questions will be visible to users again.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : deletedQuestions.length > 0 ? (
            <div className="space-y-4">
              {deletedQuestions.map((question) => (
                <div
                  key={question.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-muted-foreground line-through">
                        {question.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                      <span>Company: {question.company}</span>
                      <span>Deleted: {new Date(question.deletedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(question.id)}
                      title="Restore question"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePermanentDelete(question.id)}
                      title="Permanently delete"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Destroy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">Recycle bin is empty</h4>
              <p className="text-sm">No deleted questions to restore.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
