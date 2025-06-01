'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Code } from 'lucide-react';

interface ShowAllProblemsButtonProps {
  className?: string;
}

export function ShowAllProblemsButton({ className }: ShowAllProblemsButtonProps) {
  const router = useRouter();

  const handleShowAllProblems = (e: React.MouseEvent) => {
    // Prevent event bubbling that might interfere with the click
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Navigating to problems page...');
    // Force a hard navigation to ensure it works
    window.location.href = '/dashboard/user/problems';
    // Keep the router.push as fallback
    router.push('/dashboard/user/problems');
  };

  return (
    <Button 
      type="button"
      onClick={handleShowAllProblems}
      variant="outline"
      // Add pointer-events-auto and z-index to ensure clickability
      className={`
        group flex items-center gap-2 
        bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700
        border-blue-200 dark:border-gray-600
        hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-700 dark:hover:to-gray-600
        text-blue-700 dark:text-blue-300
        transition-all duration-300
        cursor-pointer pointer-events-auto relative z-10
        ${className}
      `}
    >
      <Code className="w-4 h-4" />
      Show All Problems
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
    </Button>
  );
}
