'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function DifficultyFilter({ onFilterChange }) {
  return (
    <Select onValueChange={onFilterChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Difficulty" />
      </SelectTrigger>
      <SelectContent>
        {/* Fix: Don't use empty string values */}
        <SelectItem value="all">All Difficulties</SelectItem>
        <SelectItem value="easy">Easy</SelectItem>
        <SelectItem value="medium">Medium</SelectItem>
        <SelectItem value="hard">Hard</SelectItem>
        {/* Fix: If you need to represent "any" or "none", use a non-empty string */}
        {/* <SelectItem value="">Any</SelectItem> - THIS WOULD CAUSE THE ERROR */}
      </SelectContent>
    </Select>
  );
}
