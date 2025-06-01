'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export function SystemSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Settings
        </CardTitle>
        <CardDescription>
          Configure system-wide settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">System settings interface coming soon...</p>
      </CardContent>
    </Card>
  );
}
