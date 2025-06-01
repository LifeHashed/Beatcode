'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';

export function ProblemManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Problem Management
        </CardTitle>
        <CardDescription>
          Manage coding problems, categories, and difficulty levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Problem management interface coming soon...</p>
      </CardContent>
    </Card>
  );
}
