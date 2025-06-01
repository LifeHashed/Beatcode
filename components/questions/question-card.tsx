'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, Building, Clock, ExternalLink, MessageSquare } from 'lucide-react';
import { RemarkModal } from './remark-modal';

// Add utility function for difficulty colors
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'EASY': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'HARD': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300';
  }
};

interface QuestionCardProps {
  question: {
    id: string;
    title: string;
    url: string;
    difficulty: string;
    company: string;
    timeline: string;
    frequency?: number;
    topics: { name: string }[];
    progress?: { completed: boolean }[];
    favorites?: any[];
  };
  onToggleComplete: (questionId: string, completed: boolean) => void;
  onToggleFavorite: (questionId: string) => void;
}

export function QuestionCard({ 
  question, 
  onToggleComplete, 
  onToggleFavorite 
}: QuestionCardProps) {
  const [isCompleted, setIsCompleted] = useState(
    question.progress?.[0]?.completed || false
  );
  const [isFavorited, setIsFavorited] = useState(
    (question.favorites?.length || 0) > 0
  );
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);

  const handleToggleComplete = () => {
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    onToggleComplete(question.id, newCompleted);
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    onToggleFavorite(question.id);
  };

  const getTimelineText = (timeline: string) => {
    switch (timeline) {
      case 'THIRTY_DAYS':
        return '30 Days';
      case 'THREE_MONTHS':
        return '3 Months';
      case 'SIX_MONTHS':
        return '6 Months';
      case 'MORE_THAN_SIX_MONTHS':
        return '6+ Months';
      default:
        return timeline;
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${
      isCompleted 
        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className={`text-lg font-semibold line-clamp-2 ${
            isCompleted 
              ? 'text-green-900 dark:text-green-100' 
              : 'text-gray-900 dark:text-gray-100'
          }`}>
            {question.title}
          </CardTitle>
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={isFavorited ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}
            >
              <Star className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleComplete}
              className={isCompleted ? 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge className={getDifficultyColor(question.difficulty)}>
            {question.difficulty.toLowerCase()}
          </Badge>
          
          <Badge variant="outline" className="flex items-center gap-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
            <Building className="h-3 w-3" />
            {question.company}
          </Badge>
          
          <Badge variant="outline" className="flex items-center gap-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
            <Clock className="h-3 w-3" />
            {getTimelineText(question.timeline)}
          </Badge>
          
          {question.frequency && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              Frequency: {question.frequency}%
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 mb-4">
          {question.topics.map((topic) => (
            <Badge key={topic.name} variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              {topic.name}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(question.url, '_blank')}
            className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ExternalLink className="h-4 w-4" />
            Solve Problem
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsRemarkModalOpen(true)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Notes
          </Button>
        </div>
      </CardContent>

      {isRemarkModalOpen && (
        <RemarkModal 
          questionId={question.id}
          questionTitle={question.title}
          onClose={() => setIsRemarkModalOpen(false)}
        />
      )}
    </Card>
  );
}
