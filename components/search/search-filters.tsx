'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  companies: string[];
  topics: string[];
}

export function SearchFilters({ companies, topics }: SearchFiltersProps) {
  const { filters, searchTerm, setFilters, setSearchTerm } = useAppStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const clearFilter = (filterKey: string) => {
    setFilters({ [filterKey]: '' });
  };

  const clearAllFilters = () => {
    setFilters({
      company: '',
      difficulty: '',
      topic: '',
      status: '',
      timeline: ''
    });
    setSearchTerm('');
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search questions or topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      {isFilterOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Company</label>
            <Select value={filters.company} onValueChange={(value) => setFilters({ company: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <Select value={filters.difficulty} onValueChange={(value) => setFilters({ difficulty: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Difficulties</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Topic</label>
            <Select value={filters.topic} onValueChange={(value) => setFilters({ topic: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Topics</SelectItem>
                {topics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select value={filters.status} onValueChange={(value) => setFilters({ status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="favorite">Favorites</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Timeline</label>
            <Select value={filters.timeline} onValueChange={(value) => setFilters({ timeline: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Timelines</SelectItem>
                <SelectItem value="THIRTY_DAYS">30 Days</SelectItem>
                <SelectItem value="THREE_MONTHS">3 Months</SelectItem>
                <SelectItem value="SIX_MONTHS">6 Months</SelectItem>
                <SelectItem value="MORE_THAN_SIX_MONTHS">6+ Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchTerm}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSearchTerm('')}
              />
            </Badge>
          )}
          {Object.entries(filters).map(([key, value]) => 
            value && (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {key}: {value}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearFilter(key)}
                />
              </Badge>
            )
          )}
        </div>
      )}
    </div>
  );
}
