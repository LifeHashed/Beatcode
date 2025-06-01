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
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { UserFormSheet } from './user-form-sheet';
import { toast } from '@/components/ui/use-toast';

interface UsersTableProps {
  isUserFormOpen?: boolean;
  setIsUserFormOpen?: (open: boolean) => void;
  onUserCreated?: () => void;
  defaultRole?: string;
  isCreatingUser?: boolean;
}

// Define sort options type
type SortField = 'name' | 'email' | 'role' | 'createdAt' | '';
type SortDirection = 'asc' | 'desc';

export function UsersTable({ isUserFormOpen, setIsUserFormOpen, onUserCreated, defaultRole, isCreatingUser }: UsersTableProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [localFormOpen, setLocalFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [sortField, setSortField] = useState<SortField>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const usersPerPage = 10;

  // Use external state if provided, otherwise use local state
  const formOpen = isUserFormOpen !== undefined ? isUserFormOpen : localFormOpen;
  const setFormOpen = setIsUserFormOpen || setLocalFormOpen;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received user data:', data);
      
      // Ensure we always have an array of users
      const usersArray = Array.isArray(data) ? data : 
                        (data && Array.isArray(data.users) ? data.users : []);
      
      setUsers(usersArray);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive',
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter((user: any) => user.id !== userId));
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleUserSaved = (savedUser: any) => {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(user => user.id === editingUser.id ? savedUser : user));
    } else {
      // Add new user
      setUsers([savedUser, ...users]);
    }
    
    setEditingUser(null);
    if (onUserCreated) {
      onUserCreated();
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingUser(null);
  };

  const filteredUsers = Array.isArray(users) ? users.filter((user: any) =>
    user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Add sorting functionality
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle date sorting
    if (sortField === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
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
      case 'SUPER_ADMIN': return 'destructive';
      case 'ADMIN': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
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
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage registered users and their accounts
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {/* Sort dropdown */}
          <Select 
            value={sortField ? `${sortField}-${sortDirection}` : 'none'} 
            onValueChange={(value) => {
              if (value === 'none') {
                setSortField('');
                setSortDirection('asc');
              } else {
                const [field, direction] = value.split('-') as [SortField, SortDirection];
                setSortField(field);
                setSortDirection(direction);
              }
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="email-asc">Email (A-Z)</SelectItem>
              <SelectItem value="email-desc">Email (Z-A)</SelectItem>
              <SelectItem value="createdAt-asc">Date Created (Oldest First)</SelectItem>
              <SelectItem value="createdAt-desc">Date Created (Newest First)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Avatar</TableHead>
                <TableHead className="cursor-pointer" onClick={() => {
                  setSortField('name');
                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                }}>
                  Name
                  {sortField === 'name' && (
                    <Badge variant={sortDirection === 'asc' ? 'default' : 'secondary'} className="ml-2">
                      {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    </Badge>
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => {
                  setSortField('email');
                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                }}>
                  Email
                  {sortField === 'email' && (
                    <Badge variant={sortDirection === 'asc' ? 'default' : 'secondary'} className="ml-2">
                      {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    </Badge>
                  )}
                </TableHead>
                <TableHead>
                  Role
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => {
                  setSortField('createdAt');
                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                }}>
                  Date Created
                  {sortField === 'createdAt' && (
                    <Badge variant={sortDirection === 'asc' ? 'default' : 'secondary'} className="ml-2">
                      {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    </Badge>
                  )}
                </TableHead>
                <TableHead className="w-[150px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No users found
                  </TableCell>
                </TableRow>
              )}
              
              {sortedUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage).map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="w-[100px]">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <span className="text-muted-foreground">{user.name.charAt(0)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.name}
                  </TableCell>
                  <TableCell>
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <UserFormSheet
        open={formOpen}
        onOpenChange={() => {
          setFormOpen(false);
          setEditingUser(null);
        }}
        onUserCreated={handleUserSaved}
        editingUser={editingUser}
      />
    </Card>
  );
}
