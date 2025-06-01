'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Plus, Edit, Save, X } from 'lucide-react';

interface Remark {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface RemarkModalProps {
  questionId: string;
  questionTitle: string;
  onClose: () => void;
}

export function RemarkModal({ questionId, questionTitle, onClose }: RemarkModalProps) {
  const { data: session } = useSession();
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [newRemark, setNewRemark] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRemarks();
  }, [questionId]);

  const fetchRemarks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/questions/${questionId}/remarks`);
      if (response.ok) {
        const data = await response.json();
        setRemarks(data.remarks || []);
      }
    } catch (error) {
      console.error('Error fetching remarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRemark = async () => {
    if (!newRemark.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/questions/${questionId}/remarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newRemark }),
      });

      if (response.ok) {
        const data = await response.json();
        setRemarks([...remarks, data.remark]);
        setNewRemark('');
        toast({
          title: 'Success',
          description: 'Note added successfully',
        });
      } else {
        throw new Error('Failed to save note');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save note',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRemark = async (id: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/questions/${questionId}/remarks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        const data = await response.json();
        setRemarks(remarks.map(r => r.id === id ? data.remark : r));
        setEditingId(null);
        setEditContent('');
        toast({
          title: 'Success',
          description: 'Note updated successfully',
        });
      } else {
        throw new Error('Failed to update note');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update note',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRemark = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/questions/${questionId}/remarks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRemarks(remarks.filter(r => r.id !== id));
        toast({
          title: 'Success',
          description: 'Note deleted successfully',
        });
      } else {
        throw new Error('Failed to delete note');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      });
    }
  };

  const startEditing = (remark: Remark) => {
    setEditingId(remark.id);
    setEditContent(remark.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notes for "{questionTitle}"
          </DialogTitle>
          <DialogDescription>
            Add personal notes and observations about this problem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new remark */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Write your thoughts, approach, or observations about this problem..."
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                className="min-h-[80px]"
              />
              <Button 
                onClick={handleSubmitRemark}
                disabled={!newRemark.trim() || isSubmitting}
                size="sm"
              >
                {isSubmitting ? 'Saving...' : 'Save Note'}
              </Button>
            </CardContent>
          </Card>

          {/* Existing remarks */}
          {isLoading ? (
            <div className="text-center py-4">Loading notes...</div>
          ) : remarks.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Your Notes</h4>
              {remarks.map((remark) => (
                <Card key={remark.id}>
                  <CardContent className="pt-4">
                    {editingId === remark.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditRemark(remark.id)}
                            disabled={!editContent.trim()}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm whitespace-pre-wrap mb-3">{remark.content}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(remark.createdAt).toLocaleDateString()} at{' '}
                            {new Date(remark.createdAt).toLocaleTimeString()}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(remark)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteRemark(remark.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notes yet. Add your first note above!</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
