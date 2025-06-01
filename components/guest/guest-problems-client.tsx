'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Search, Shuffle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data - replace with real API data
const mockProblems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    company: "Amazon",
    tags: ["Array", "Hash Table"],
    url: "https://leetcode.com/problems/two-sum/"
  },
  {
    id: 2,
    title: "Add Two Numbers", 
    difficulty: "Medium",
    company: "Microsoft",
    tags: ["Linked List", "Math"],
    url: "https://leetcode.com/problems/add-two-numbers/"
  },
  // Add more mock problems...
];

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
}

export function GuestProblemsClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [filteredProblems, setFilteredProblems] = useState(mockProblems);

  const getRandomProblem = () => {
    const randomIndex = Math.floor(Math.random() * filteredProblems.length);
    const randomProblem = filteredProblems[randomIndex];
    if (randomProblem) {
      window.open(randomProblem.url, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Browse Problems
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore thousands of coding problems from top tech companies. 
          <span className="text-primary"> Sign up to track your progress!</span>
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            {/* Company Filter */}
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="microsoft">Microsoft</SelectItem>
                <SelectItem value="meta">Meta</SelectItem>
                <SelectItem value="apple">Apple</SelectItem>
              </SelectContent>
            </Select>

            {/* Random Problem Button */}
            <Button onClick={getRandomProblem} variant="outline" className="w-full">
              <Shuffle className="mr-2 h-4 w-4" />
              Random Problem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Problems List */}
      <div className="grid gap-4">
        {filteredProblems.map((problem) => (
          <Card key={problem.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold">{problem.title}</h3>
                    <Badge className={getDifficultyColor(problem.difficulty)}>
                      {problem.difficulty}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {problem.company}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {problem.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Locked features for guests */}
                  <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
                    <Lock className="h-4 w-4 mr-1" />
                    Mark Complete
                  </Button>
                  
                  <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
                    <Lock className="h-4 w-4 mr-1" />
                    Favorite
                  </Button>

                  {/* Open problem link */}
                  <Button asChild variant="outline" size="sm">
                    <a href={problem.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Solve
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sign up prompt */}
      <Card className="mt-12 border-primary/20 bg-primary/5">
        <CardContent className="p-8 text-center">
          <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Want to track your progress?
          </h3>
          <p className="text-muted-foreground mb-4">
            Sign up to mark problems as complete, add to favorites, and track your coding journey!
          </p>
          <Button asChild>
            <a href="/auth/register">Sign Up Free</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
