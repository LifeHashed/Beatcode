'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { FeedbackModal } from './feedback-modal';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </Button>
      
      <FeedbackModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
