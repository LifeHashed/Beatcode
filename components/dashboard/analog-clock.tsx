'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AnalogClockProps {
  compact?: boolean;
}

export function AnalogClock({ compact = false }: AnalogClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const secondDegrees = (time.getSeconds() * 6);
  const minuteDegrees = (time.getMinutes() * 6) + (time.getSeconds() * 0.1);
  const hourDegrees = (time.getHours() % 12 * 30) + (time.getMinutes() * 0.5);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-100 dark:via-blue-100 dark:to-purple-100 border-blue-200 dark:border-blue-300 h-full relative overflow-hidden group shadow-lg">
      {/* Light animated backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-purple-100/40 to-pink-100/30 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/20 via-blue-100/30 to-indigo-100/20 animate-pulse" style={{animationDelay: '1s'}} />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent animate-pulse" style={{animationDelay: '2s'}} />
      
      {/* Moving gradient waves */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300/20 to-transparent animate-pulse" style={{animationDelay: '0.5s'}} />
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-purple-300/15 to-transparent animate-pulse" style={{animationDelay: '1.5s'}} />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-pink-300/10 to-transparent animate-pulse" style={{animationDelay: '2.5s'}} />
      
      {/* Enhanced light floating orbs */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-blue-300/60 rounded-full animate-ping" />
      <div className="absolute bottom-6 left-4 w-1.5 h-1.5 bg-purple-300/60 rounded-full animate-ping" style={{animationDelay: '1s'}} />
      <div className="absolute top-8 left-6 w-1 h-1 bg-pink-300/60 rounded-full animate-ping" style={{animationDelay: '2s'}} />
      
      <CardContent className="flex flex-col items-center justify-center space-y-3 h-full p-3 relative z-10">
        {/* Circular Analog Clock */}
        <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-white via-blue-50 to-purple-50 border-4 border-blue-300/50 shadow-xl group-hover:scale-105 transition-transform duration-500">
          {/* Outer glow ring */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-full blur-sm opacity-30 animate-pulse" />
          
          {/* Clock face */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white via-blue-50 to-purple-50 border-2 border-blue-200/50 overflow-hidden">
            {/* Hour markers - circular layout */}
            {[...Array(12)].map((_, i) => {
              const isMainHour = i % 3 === 0;
              const angle = i * 30;
              
              return (
                <div
                  key={i}
                  className={`absolute ${isMainHour ? 'w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500' : 'w-0.5 h-3 bg-gradient-to-b from-blue-400 to-purple-400'} rounded-full shadow-sm`}
                  style={{
                    top: '6px',
                    left: '50%',
                    transformOrigin: '50% 74px',
                    transform: `translateX(-50%) rotate(${angle}deg)`
                  }}
                />
              );
            })}
            
            {/* Glowing center with rings */}
            <div className="absolute top-1/2 left-1/2 w-3 h-3 transform -translate-x-1/2 -translate-y-1/2 z-40">
              <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg shadow-blue-400/50 animate-pulse" />
              <div className="absolute inset-0.5 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full" />
              <div className="absolute inset-1 bg-white rounded-full" />
            </div>
            
            {/* Enhanced hour hand */}
            <div
              className="absolute bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-full z-30 shadow-lg shadow-blue-400/50"
              style={{
                width: '3px',
                height: '30px',
                top: '50%',
                left: '50%',
                transformOrigin: '50% 100%',
                transform: `translate(-50%, -100%) rotate(${hourDegrees}deg)`,
                transition: 'transform 0.5s ease-in-out'
              }}
            />
            
            {/* Enhanced minute hand */}
            <div
              className="absolute bg-gradient-to-t from-purple-600 via-purple-400 to-purple-300 rounded-full z-30 shadow-lg shadow-purple-400/50"
              style={{
                width: '2px',
                height: '42px',
                top: '50%',
                left: '50%',
                transformOrigin: '50% 100%',
                transform: `translate(-50%, -100%) rotate(${minuteDegrees}deg)`,
                transition: 'transform 0.5s ease-in-out'
              }}
            />
            
            {/* Enhanced second hand */}
            <div
              className="absolute bg-gradient-to-t from-red-400 via-orange-300 to-yellow-300 rounded-full z-30 shadow-lg shadow-red-300/50"
              style={{
                width: '1px',
                height: '48px',
                top: '50%',
                left: '50%',
                transformOrigin: '50% 100%',
                transform: `translate(-50%, -100%) rotate(${secondDegrees}deg)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
          </div>
        </div>

        {/* Enhanced Digital time display */}
        <div className="text-center space-y-1">
          <div className="text-xl font-mono font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-none tracking-wide">
            {formatTime(time)}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-700 leading-tight font-medium">
            {formatDate(time)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
