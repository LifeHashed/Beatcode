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
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Only validate password match if password is provided
  if (data.password && data.password.length > 0) {
    if (data.password.length < 8) {
      return false;
    }
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Password must be at least 8 characters and passwords must match",
  path: ["confirmPassword"],
});

type AdminFormValues = z.infer<typeof formSchema>;

interface AdminFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdminCreated?: (admin: any) => void;
  editingAdmin?: any;
}

export function AdminFormSheet({ open, onOpenChange, onAdminCreated, editingAdmin }: AdminFormSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Reset form when editing admin changes
  useEffect(() => {
    if (editingAdmin) {
      form.reset({
        name: editingAdmin.name || '',
        username: editingAdmin.username || '',
        email: editingAdmin.email || '',
        password: '',
        confirmPassword: '',
      });
    } else {
      form.reset({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [editingAdmin, form]);
  
  const onSubmit = async (values: AdminFormValues) => {
    try {
      setIsLoading(true);
      const { confirmPassword, ...dataToSubmit } = values;
      
      const endpoint = editingAdmin 
        ? `/api/admin/users/${editingAdmin.id}` 
        : '/api/admin/users/create-admin';
      
      const method = editingAdmin ? 'PUT' : 'POST';
      
      // For updates, only include password if it's provided and not empty
      let payload: any = {
        name: dataToSubmit.name,
        username: dataToSubmit.username,
        email: dataToSubmit.email
      };

      // Only include password if it's provided and not empty
      if (dataToSubmit.password && dataToSubmit.password.trim().length > 0) {
        payload.password = dataToSubmit.password;
      }

      // For new admins, ensure we have a password
      if (!editingAdmin) {
        if (!dataToSubmit.password || dataToSubmit.password.trim().length === 0) {
          throw new Error('Password is required for new admins');
        }
        payload.role = 'ADMIN';
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to ${editingAdmin ? 'update' : 'create'} admin`);
      }
      
      toast({
        title: 'Success',
        description: `Admin ${editingAdmin ? 'updated' : 'created'} successfully`,
      });
      
      form.reset();
      onOpenChange(false);
      
      if (onAdminCreated) {
        onAdminCreated(responseData.admin || responseData);
      }
    } catch (error: any) {
      console.error(`Error ${editingAdmin ? 'updating' : 'creating'} admin:`, error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${editingAdmin ? 'update' : 'create'} admin`,
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
          <SheetTitle>{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</SheetTitle>
          <SheetDescription>
            {editingAdmin 
              ? 'Update administrator account details.' 
              : 'Create a new administrator account. They will receive an email with login instructions.'
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
                    <Input placeholder="admin@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {editingAdmin ? 'New Password (leave blank to keep current)' : 'Password'}
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
                  <FormLabel>
                    {editingAdmin ? 'Confirm New Password' : 'Confirm Password'}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <SheetFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (editingAdmin ? "Updating..." : "Creating...") : (editingAdmin ? "Update Admin" : "Create Admin")}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
