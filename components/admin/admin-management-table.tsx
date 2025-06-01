'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Shield } from 'lucide-react';
import { AdminFormSheet } from './admin-form-sheet';
import { toast } from '@/components/ui/use-toast';

interface Admin {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: string;
  createdAt: string;
}

interface AdminManagementTableProps {
  onAdminCreated?: () => void;
}

export function AdminManagementTable({ onAdminCreated }: AdminManagementTableProps) {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/admins', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch admins',
        variant: 'destructive',
      });
      setAdmins([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'SUPER_ADMIN') {
      fetchAdmins();
    }
  }, [session]);

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }

      setAdmins(admins.filter(admin => admin.id !== adminId));
      toast({
        title: 'Success',
        description: 'Admin deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete admin',
        variant: 'destructive',
      });
    }
  };

  const handleAdminSaved = () => {
    setIsFormOpen(false);
    setEditingAdmin(null);
    fetchAdmins();
    if (onAdminCreated) {
      onAdminCreated();
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedAdmins = [...filteredAdmins].sort((a, b) => {
    const aValue = a[sortField as keyof Admin];
    const bValue = b[sortField as keyof Admin];

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'destructive';
      case 'ADMIN':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (session?.user?.role !== 'SUPER_ADMIN') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Access denied. Super admin role required.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Management
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage system administrators and their permissions
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select 
            value={sortField ? `${sortField}-${sortDirection}` : 'none'} 
            onValueChange={(value) => {
              if (value === 'none') {
                setSortField('');
              } else {
                const [field, direction] = value.split('-') as [keyof Admin, 'asc' | 'desc'];
                setSortField(field);
                setSortDirection(direction);
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No sorting</SelectItem>
              <SelectItem value="name-asc">Name (A to Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z to A)</SelectItem>
              <SelectItem value="username-asc">Username (A to Z)</SelectItem>
              <SelectItem value="username-desc">Username (Z to A)</SelectItem>
              <SelectItem value="email-asc">Email (A to Z)</SelectItem>
              <SelectItem value="email-desc">Email (Z to A)</SelectItem>
              <SelectItem value="createdAt-asc">Date Created (Oldest)</SelectItem>
              <SelectItem value="createdAt-desc">Date Created (Newest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading admins...</p>
          </div>
        ) : sortedAdmins.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery ? 'No admins found matching your search.' : 'No admins found.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.username || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(admin.role)}>
                      {admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingAdmin(admin);
                          setIsFormOpen(true);
                        }}
                        title="Edit admin"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {admin.role !== 'SUPER_ADMIN' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-destructive"
                          title="Delete admin"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AdminFormSheet
        open={isFormOpen}
        onOpenChange={() => {
          setIsFormOpen(false);
          setEditingAdmin(null);
        }}
        onAdminCreated={handleAdminSaved}
        editingAdmin={editingAdmin}
      />
    </Card>
  );
}
