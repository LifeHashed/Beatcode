'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const createFormSchema = (isPasswordChange: boolean) => {
  const baseSchema = {
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    username: z.string().min(3, { message: 'Username must be at least 3 characters' })
      .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
  };

  if (isPasswordChange) {
    return z.object({
      ...baseSchema,
      currentPassword: z.string().min(1, { message: 'Current password is required' }),
      newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
      confirmNewPassword: z.string().min(1, { message: 'Please confirm your new password' }),
    }).refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "New passwords don't match",
      path: ["confirmNewPassword"],
    });
  }

  return z.object(baseSchema);
};

type ProfileFormValues = {
  name: string;
  username: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
};

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { data: session, update } = useSession();
  const [isPasswordChange, setIsPasswordChange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const formSchema = createFormSchema(isPasswordChange);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  // Update form when session data is available
  useEffect(() => {
    if (session?.user) {
      form.reset({
        name: session.user.name || '',
        username: session.user.username || '',
        email: session.user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  }, [session, form]);

  // Reset password fields when checkbox is toggled
  useEffect(() => {
    if (!isPasswordChange) {
      form.setValue('currentPassword', '');
      form.setValue('newPassword', '');
      form.setValue('confirmNewPassword', '');
    }
  }, [isPasswordChange, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);

      const payload: any = {
        name: values.name,
        username: values.username,
        email: values.email,
      };

      if (isPasswordChange) {
        payload.currentPassword = values.currentPassword;
        payload.password = values.newPassword;
        payload.confirmPassword = values.confirmNewPassword;
      }

      const response = await fetch(`/api/user/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update session with new data
      await update({
        ...session,
        user: {
          ...session.user,
          name: values.name,
          username: values.username,
          email: values.email,
        },
      });

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      setIsPasswordChange(false);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) return;
    
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/user/${session.user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      toast({
        title: 'Account Deleted',
        description: 'Your account has been successfully deleted',
      });

      // Sign out user after account deletion
      window.location.href = '/auth/signin';
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
          <DialogDescription>
            Update your account information and settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
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
                    <Input placeholder="Enter your username" {...field} />
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
                    <Input placeholder="Enter your email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="changePassword"
                checked={isPasswordChange}
                onCheckedChange={setIsPasswordChange}
              />
              <label
                htmlFor="changePassword"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Change Password
              </label>
            </div>

            {isPasswordChange && (
              <div className="space-y-4 border-l-2 border-muted pl-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter current password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter new password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Confirm new password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter className="flex flex-col gap-3">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>

              {!isSuperAdmin && (
                <>
                  <Separator />
                  <Alert variant="destructive">
                    <AlertDescription>
                      Danger Zone: This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="w-full"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
