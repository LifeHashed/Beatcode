'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (searchParams?.get('registered')) {
      setMessage('Account created! Please sign in with your new credentials.');
    }
    if (searchParams?.get('reset')) {
      setMessage('Password reset successful! You can now sign in with your new password.');
    }
    if (searchParams?.get('error')) {
      const errorType = searchParams.get('error');
      switch (errorType) {
        case 'CredentialsSignin':
          setError('Invalid email/username or password. Please try again.');
          break;
        case 'Configuration':
          setError('There was a problem with the server configuration.');
          break;
        default:
          setError('Authentication failed. Please try again.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email/username and password.');
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔐 Attempting signin with:", { 
        email: email.trim(), 
        hasPassword: !!password.trim(),
        isEmail: email.includes('@')
      });
      
      const result = await signIn('credentials', {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      });

      console.log("🔐 SignIn result:", result);

      if (result?.error) {
        console.error("❌ Authentication error:", result.error);
        switch (result.error) {
          case 'CredentialsSignin':
            setError('Invalid email/username or password. Please check your credentials and try again.');
            break;
          case 'Configuration':
            setError('Authentication service is not properly configured. Please contact support.');
            break;
          case 'AccessDenied':
            setError('Access denied. Please check your account status.');
            break;
          default:
            setError(`Authentication failed: ${result.error}. Please try again.`);
        }
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        console.log("✅ Sign in successful, getting session...");
        
        // Get fresh session
        const session = await getSession();
        console.log("📋 Session after signin:", session);
        
        if (session?.user) {
          // Redirect based on user role
          let redirectPath = '/dashboard/user'; // default
          
          switch (session.user.role) {
            case 'SUPER_ADMIN':
              redirectPath = '/dashboard/super-admin';
              break;
            case 'ADMIN':
              redirectPath = '/dashboard/admin';
              break;
            case 'USER':
            default:
              redirectPath = '/dashboard/user';
              break;
          }
          
          console.log(`🚀 Redirecting to: ${redirectPath}`);
          router.push(redirectPath);
          router.refresh();
        } else {
          console.log("🚀 Redirecting to default dashboard");
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        setError('Sign in failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Unexpected authentication error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
    } catch (error) {
      setError('Google sign-in failed');
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    router.push('/guest/dashboard');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign In to BeatCode</CardTitle>
        <CardDescription>
          Enter your email or username to sign in to your account
        </CardDescription>
        {(searchParams?.get("registered") || searchParams?.get("reset")) && (
          <Alert className="mt-4 bg-green-50 text-green-600 border-green-200">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 bg-red-50 text-red-600 border-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email or Username</Label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or username"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleGuestAccess}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Guest
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Register
          </Link>
          {' '}|{' '}
          <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
