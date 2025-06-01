'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface QuestionFormProps {
  onClose: () => void;
  initialData?: any;
}

export function QuestionForm({ onClose, initialData }: QuestionFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    url: initialData?.url || '',
    difficulty: initialData?.difficulty || 'MEDIUM',
    company: initialData?.company || 'General',
    timeline: initialData?.timeline || 'THREE_MONTHS',
    topics: initialData?.topics?.map((t: any) => t.name) || [],
    newTopic: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const addTopic = () => {
    if (!formData.newTopic) return;
    
    if (!formData.topics.includes(formData.newTopic)) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, prev.newTopic],
        newTopic: ''
      }));
    }
  };
  
  const removeTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(t => t !== topic)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const endpoint = initialData ? `/api/questions/${initialData.id}` : '/api/questions';
      const method = initialData ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          url: formData.url,
          difficulty: formData.difficulty,
          company: formData.company,
          timeline: formData.timeline,
          topics: formData.topics
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Something went wrong');
      }
      
      setSuccess('Question saved successfully');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to save question');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{initialData ? 'Edit Question' : 'Add New Question'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                  {success}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Question title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  URL
                </label>
                <Input
                  value={formData.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://leetcode.com/problems/question-slug/"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Difficulty
                  </label>
                  <Select 
                    value={formData.difficulty}
                    onValueChange={(value) => handleChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Company
                  </label>
                  <Input
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="Company name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Timeline
                  </label>
                  <Select 
                    value={formData.timeline}
                    onValueChange={(value) => handleChange('timeline', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THIRTY_DAYS">30 Days</SelectItem>
                      <SelectItem value="THREE_MONTHS">3 Months</SelectItem>
                      <SelectItem value="SIX_MONTHS">6 Months</SelectItem>
                      <SelectItem value="MORE_THAN_SIX_MONTHS">More Than 6 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Topics
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.newTopic}
                    onChange={(e) => handleChange('newTopic', e.target.value)}
                    placeholder="Enter topic name"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={addTopic}
                  >
                    Add
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.topics.map((topic: string) => (
                    <div 
                      key={topic}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs flex items-center gap-1"
                    >
                      {topic}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTopic(topic)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-5">
              <Button 
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Question'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
