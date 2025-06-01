'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertCircle, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CSVUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

export function CSVUploadModal({ open, onOpenChange, onUploadComplete }: CSVUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile && selectedFile.type !== 'text/csv') {
      setError('Please select a valid CSV file');
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/questions/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred while importing questions');
      }

      toast({
        title: 'Success',
        description: `Successfully imported ${data.imported || 0} questions`,
      });

      onOpenChange(false);
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during the upload');
      toast({
        title: 'Error',
        description: err.message || 'Failed to import questions',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Questions from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with question data. The file should contain columns for title, URL, difficulty, company, timeline, and topics.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="csvFile">
              Select CSV File
            </label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Maximum file size: 5MB
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-4 rounded-md">
            <h4 className="text-sm font-medium mb-3">Expected CSV Format</h4>
            <div className="bg-background p-3 rounded border overflow-x-auto">
              <code className="text-sm block whitespace-pre font-mono">
                title,url,difficulty,company,timeline,topics
                <br />
                "Two Sum","https://leetcode.com/problems/two-sum/","EASY","Google","THIRTY_DAYS","Array,Hash Table"
                <br />
                "Merge Intervals","https://leetcode.com/problems/merge-intervals/","MEDIUM","Amazon","THREE_MONTHS","Array,Sorting"
                <br />
                "Valid Parentheses","https://leetcode.com/problems/valid-parentheses/","EASY","Microsoft","SIX_MONTHS","String,Stack"
              </code>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <p><strong>Required columns:</strong> title, url, difficulty, company, timeline</p>
              <p><strong>Optional columns:</strong> topics, description, frequency, acceptance</p>
              <p><strong>Difficulty values:</strong> EASY, MEDIUM, HARD</p>
              <p><strong>Timeline values:</strong> THIRTY_DAYS, THREE_MONTHS, SIX_MONTHS, MORE_THAN_SIX_MONTHS</p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="flex items-center gap-2"
          >
            {uploading ? 'Uploading...' : (
              <>
                <Upload className="h-4 w-4" />
                Import Questions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
