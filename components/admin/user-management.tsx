'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, UserMinus, Shield, Plus, Edit } from 'lucide-react';
import { UserFormSheet } from './user-form-sheet';

interface UserManagementProps {
  adminOnly?: boolean;
}

export function UserManagement({ adminOnly = false }: UserManagementProps) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, [adminOnly]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const endpoint = adminOnly ? '/api/admin/users?adminsOnly=true' : '/api/admin/users';
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'destructive';
      case 'ADMIN': return 'default';
      default: return 'secondary';
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
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
      setUsers(users.map(user => user.id === editingUser.id ? savedUser : user));
    } else {
      setUsers([savedUser, ...users]);
    }
    setEditingUser(null);
    setIsUserFormOpen(false);
  };

  const handleFormClose = () => {
    setIsUserFormOpen(false);
    setEditingUser(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage registered users and their accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and filter controls */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsUserFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Users list */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">No users found</h4>
            <p className="text-sm">
              {searchQuery ? 'No users match your search criteria.' : 'No users have been added yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{user.name}</h3>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.username && (
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                    title="Edit user"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    title="Delete user"
                    className="text-destructive"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* User Form Sheet */}
      <UserFormSheet
        open={isUserFormOpen}
        onOpenChange={handleFormClose}
        onUserSaved={handleUserSaved}
        editingUser={editingUser}
        adminMode={adminOnly}
      />
    </Card>
  );
}
