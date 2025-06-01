'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Lightbulb, Zap, Star, Sparkles, Code, Heart } from 'lucide-react';

const motivationalQuotes = [
  { text: "The only way to do great work is to love what you do. - Steve Jobs", icon: Heart },
  { text: "Code is like humor. When you have to explain it, it's bad. - Cory House", icon: Code },
  { text: "First, solve the problem. Then, write the code. - John Johnson", icon: Lightbulb },
  { text: "Experience is the name everyone gives to their mistakes. - Oscar Wilde", icon: Star },
  { text: "In order to be irreplaceable, one must always be different. - Coco Chanel", icon: Sparkles },
  { text: "Talk is cheap. Show me the code. - Linus Torvalds", icon: Zap },
  { text: "The best error message is the one that never shows up. - Thomas Fuchs", icon: Code },
  { text: "Debugging is twice as hard as writing the code in the first place. - Brian Kernighan", icon: Lightbulb },
  { text: "Code never lies, comments sometimes do. - Ron Jeffries", icon: Star }
];

interface MotivationalQuotesProps {
  className?: string;
  interval?: number;
}

export function MotivationalQuotes({ className, interval = 5000 }: MotivationalQuotesProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentQuoteIndex((prevIndex) => 
          (prevIndex + 1) % motivationalQuotes.length
        );
        setIsVisible(true);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  const currentQuote = motivationalQuotes[currentQuoteIndex];
  const IconComponent = currentQuote.icon;

  return (
    <Card className={cn(
      "bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20",
      "border-emerald-200 dark:border-emerald-700 h-16 relative overflow-hidden group",
      className
    )}>
      {/* Enhanced moving colorful background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-emerald-400/30 to-teal-400/30 rounded-full animate-bounce"></div>
        <div className="absolute -top-1 -right-3 w-6 h-6 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-2 -left-3 w-7 h-7 bg-gradient-to-r from-teal-400/30 to-emerald-400/30 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-1 -right-2 w-5 h-5 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-emerald-300/10 to-cyan-300/10 rounded-full animate-spin" style={{animationDuration: '15s'}}></div>
        
        {/* New moving gradient waves */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-200/20 to-transparent animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-teal-200/15 to-transparent animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <CardContent className="p-3 h-full flex items-center justify-center relative z-10">
        <div className="flex items-center gap-3 w-full">
          <div className={cn(
            "flex-shrink-0 transition-all duration-500",
            isVisible ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 rotate-180"
          )}>
            <IconComponent className="w-6 h-6 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
          </div>
          
          <p className={cn(
            "text-sm font-medium bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 dark:from-emerald-300 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent",
            "italic leading-tight flex-1 transition-all duration-500 transform",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}>
            {currentQuote.text}
          </p>
          
          <div className={cn(
            "flex-shrink-0 transition-all duration-500",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}>
            <Sparkles className="w-5 h-5 text-cyan-500 dark:text-cyan-400 animate-pulse drop-shadow-sm" style={{animationDelay: '0.5s'}} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
