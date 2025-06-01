'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ConditionalNavbar } from '@/components/layout/conditional-navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Code, Play, CheckCircle, Clock } from 'lucide-react';

export default function LearnPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      setIsLoading(false);
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const learningPaths = [
    {
      id: 1,
      title: "Data Structures Fundamentals",
      description: "Master arrays, linked lists, stacks, and queues",
      duration: "2-3 weeks",
      difficulty: "Beginner",
      topics: ["Arrays", "Linked Lists", "Stacks", "Queues"],
      progress: 0
    },
    {
      id: 2,
      title: "Algorithm Design Patterns",
      description: "Learn common algorithmic patterns and techniques",
      duration: "4-5 weeks",
      difficulty: "Intermediate",
      topics: ["Two Pointers", "Sliding Window", "Binary Search", "DFS/BFS"],
      progress: 0
    },
    {
      id: 3,
      title: "Advanced Data Structures",
      description: "Explore trees, graphs, heaps, and hash tables",
      duration: "3-4 weeks",
      difficulty: "Advanced",
      topics: ["Binary Trees", "Graphs", "Heaps", "Hash Tables"],
      progress: 0
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ConditionalNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Learn Programming</h1>
          <p className="text-muted-foreground mt-2">
            Structured learning paths to master data structures and algorithms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {learningPaths.map((path) => (
            <Card key={path.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={
                    path.difficulty === 'Beginner' ? 'secondary' :
                    path.difficulty === 'Intermediate' ? 'default' : 'destructive'
                  }>
                    {path.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {path.duration}
                  </div>
                </div>
                <CardTitle className="text-xl">{path.title}</CardTitle>
                <CardDescription>{path.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {path.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{path.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <Button className="w-full" variant={path.progress > 0 ? "default" : "outline"}>
                    <Play className="h-4 w-4 mr-2" />
                    {path.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Tutorials</h3>
              <p className="text-sm text-muted-foreground">Step-by-step guides</p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <Code className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Code Examples</h3>
              <p className="text-sm text-muted-foreground">Working implementations</p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Practice Problems</h3>
              <p className="text-sm text-muted-foreground">Hands-on exercises</p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <Play className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Interactive Demos</h3>
              <p className="text-sm text-muted-foreground">Visual learning</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
