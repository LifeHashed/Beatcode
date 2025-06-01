'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const createFormSchema = (hideRoleSelection: boolean, isEditing: boolean) => {
  const baseSchema = {
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    username: z.string().min(3, { message: 'Username must be at least 3 characters' })
      .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    // Make password optional when editing, required when creating
    password: isEditing 
      ? z.string().optional().or(z.literal(''))
      : z.string().min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string().optional(),
  };

  // Only add role field if role selection is not hidden
  if (!hideRoleSelection) {
    (baseSchema as any).role = z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']);
  }

  const schema = z.object(baseSchema);
  
  // Only add password confirmation validation if password is provided and not empty
  return schema.refine((data) => {
    // If password is provided and not empty, check confirmation
    if (data.password && data.password.length > 0) {
      return data.password === data.confirmPassword;
    }
    // If we're creating a new user, password is required
    if (!isEditing && (!data.password || data.password.length === 0)) {
      return false;
    }
    return true;
  }, {
    message: isEditing ? "Passwords don't match" : "Password is required",
    path: ["confirmPassword"],
  });
};

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserSaved?: (user: any) => void;
  editingUser?: any;
  adminMode?: boolean;
  hideRoleSelection?: boolean;
  defaultRole?: string;
}

export function UserFormSheet({ 
  open, 
  onOpenChange, 
  onUserSaved, 
  editingUser, 
  adminMode = false, 
  hideRoleSelection = false,
  defaultRole = 'USER'
}: UserFormSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const formSchema = createFormSchema(hideRoleSelection, !!editingUser);
  type UserFormValues = z.infer<typeof formSchema>;
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      // Only include role if not hidden
      ...(hideRoleSelection ? {} : { role: adminMode ? 'ADMIN' : defaultRole }),
    },
  });

  // Reset form when editing user changes
  useEffect(() => {
    if (editingUser) {
      const resetValues: any = {
        name: editingUser.name || '',
        username: editingUser.username || '',
        email: editingUser.email || '',
        password: '',
        confirmPassword: '',
      };
      
      // Only include role if not hidden
      if (!hideRoleSelection) {
        resetValues.role = editingUser.role || (adminMode ? 'ADMIN' : defaultRole);
      }
      
      form.reset(resetValues);
    } else {
      const resetValues: any = {
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      };
      
      // Only include role if not hidden
      if (!hideRoleSelection) {
        resetValues.role = adminMode ? 'ADMIN' : defaultRole;
      }
      
      form.reset(resetValues);
    }
  }, [editingUser, form, adminMode, hideRoleSelection, defaultRole]);
  
  const onSubmit = async (values: UserFormValues) => {
    try {
      setIsLoading(true);
      const { confirmPassword, ...dataToSubmit } = values;
      
      // Add default role if it's hidden and we're creating a new user
      if (hideRoleSelection && !editingUser) {
        (dataToSubmit as any).role = defaultRole;
      }
      
      // Use the correct endpoint
      const endpoint = editingUser 
        ? `/api/user/${editingUser.id}` 
        : adminMode 
          ? '/api/admin/users/create-admin'
          : '/api/admin/users/create-user';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      // For updates, only include password if it's provided and not empty
      const payload = editingUser 
        ? { 
            name: dataToSubmit.name, 
            username: dataToSubmit.username, 
            email: dataToSubmit.email,
            // Only include password if it's provided and not empty
            ...(dataToSubmit.password && dataToSubmit.password.length > 0 ? { 
              password: dataToSubmit.password,
              confirmPassword: confirmPassword 
            } : {}),
            // Only include role if not hidden
            ...(!hideRoleSelection && { role: (dataToSubmit as any).role })
          }
        : {
            ...dataToSubmit,
            // Only include role if not hidden, otherwise use default
            ...(hideRoleSelection ? { role: defaultRole } : {})
          };
      
      console.log('Submitting to:', endpoint, 'with payload:', payload);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const htmlText = await response.text();
        console.error('Received HTML instead of JSON:', htmlText.substring(0, 200));
        throw new Error('Server returned an error page instead of JSON response');
      }
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || `Failed to ${editingUser ? 'update' : 'create'} user`);
      }
      
      toast({
        title: 'Success',
        description: `${adminMode ? 'Admin' : 'User'} ${editingUser ? 'updated' : 'created'} successfully`,
      });
      
      form.reset();
      onOpenChange(false);
      
      if (onUserSaved) {
        onUserSaved(responseData.user || responseData);
      }
    } catch (error: any) {
      console.error(`Error ${editingUser ? 'updating' : 'creating'} user:`, error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${editingUser ? 'update' : 'create'} user`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {editingUser 
              ? `Edit ${adminMode ? 'Admin' : 'User'}` 
              : `Add New ${adminMode ? 'Admin' : 'User'}`
            }
          </SheetTitle>
          <SheetDescription>
            {editingUser 
              ? `Update ${adminMode ? 'administrator' : 'user'} account details.` 
              : `Create a new ${adminMode ? 'administrator' : 'user'} account.`
            }
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Only show role selection if not hidden */}
            {!hideRoleSelection && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <SheetFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading 
                  ? (editingUser ? "Updating..." : "Creating...") 
                  : (editingUser 
                      ? `Update ${adminMode ? 'Admin' : 'User'}` 
                      : `Create ${adminMode ? 'Admin' : 'User'}`
                    )
                }
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
