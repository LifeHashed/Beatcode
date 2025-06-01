'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export function Logo({ className, width = 160, height = 60, showText = true }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative overflow-hidden">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border flex items-center justify-center">
          {!imageError ? (
            <Image
              src="/logo.png"
              alt="BeatCode Logo"
              width={width}
              height={height}
              className="object-contain rounded-lg"
              priority
              onError={() => setImageError(true)}
              style={{
                maxHeight: `${height}px`,
                maxWidth: `${width}px`,
              }}
            />
          ) : (
            <div
              className="flex items-center justify-center bg-primary/10 text-primary font-bold rounded-lg"
              style={{ width: `${width}px`, height: `${height}px` }}
            >
              BeatCode
            </div>
          )}
        </div>
      </div>
      {showText && (
        <span className="font-bold text-xl text-foreground hidden sm:block">BeatCode</span>
      )}
    </div>
  );
}
