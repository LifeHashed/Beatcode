import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
  compact?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  className, 
  onClick,
  animated = true,
  compact = true // Changed default to true for thinner cards
}: StatsCardProps) {
  return (
    <Card 
      className={cn(
        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300",
        animated && "hover:scale-105 hover:shadow-lg cursor-pointer",
        "group relative overflow-hidden",
        compact && "h-24", // Reduced from h-20 to h-24 for better balance
        className
      )}
      onClick={onClick}
    >
      {/* Enhanced animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent dark:via-gray-700/20 opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-pulse" />
      
      {/* Floating particles animation */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-2 left-2 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0s'}} />
        <div className="absolute top-4 right-3 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}} />
        <div className="absolute bottom-3 left-4 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-2 right-2 w-1 h-1 bg-indigo-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}} />
      </div>
      
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0 relative z-10",
        compact ? "pb-0 pt-2 px-4" : "pb-2" // Adjusted padding for better spacing
      )}>
        <CardTitle className={cn(
          "font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors duration-300",
          compact ? "text-sm" : "text-sm" // Consistent text size
        )}>
          {title}
        </CardTitle>
        <div className={cn(
          "text-primary/70 group-hover:text-primary transition-all duration-300",
          "group-hover:rotate-12 group-hover:scale-125 group-hover:animate-pulse",
          compact && "scale-90" // Slightly larger icon for better balance
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className={cn(
        "relative z-10",
        compact ? "pt-0 px-4 pb-2" : "" // Adjusted padding
      )}>
        <div className={cn(
          "font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors duration-300",
          compact ? "text-xl" : "text-2xl" // Slightly larger for better readability
        )}>
          {value || '0'}
        </div>
        {description && (
          <p className={cn(
            "text-muted-foreground dark:text-gray-400 group-hover:text-primary/80 transition-colors duration-300",
            compact ? "text-xs leading-tight mt-0.5" : "text-xs" // Added margin for spacing
          )}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
