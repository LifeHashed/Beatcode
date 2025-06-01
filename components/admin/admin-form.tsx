'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface AdminFormProps {
  onClose: () => void;
  initialData?: any;
}

export function AdminForm({ onClose, initialData }: AdminFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    role: initialData?.role || 'ADMIN',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const endpoint = initialData ? `/api/admin/admins/${initialData.id}` : '/api/admin/admins';
      const method = initialData ? 'PUT' : 'POST';
      
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      
      // Only include password for new admins or if password is being changed
      if (!initialData || formData.password) {
        payload.password = formData.password;
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Something went wrong');
      }
      
      setSuccess('Admin saved successfully');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to save admin');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="w-full max-w-md max-h-[90vh] overflow-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{initialData ? 'Edit Admin' : 'Create Admin'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                  {success}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Admin name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {initialData ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  required={!initialData}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Role
                </label>
                <Select 
                  value={formData.role}
                  onValueChange={(value) => handleChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-5">
              <Button 
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : initialData ? 'Update Admin' : 'Create Admin'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
