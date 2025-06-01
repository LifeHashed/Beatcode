'use client';

import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const SignInForm = dynamic(
  () => import('@/components/auth/signin-form').then(mod => ({ default: mod.SignInForm })),
  {
    loading: () => <div className="flex items-center justify-center p-8">Loading...</div>,
    ssr: true,
  }
);

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      // Redirect based on user role
      switch (session.user.role) {
        case 'SUPER_ADMIN':
          router.push('/dashboard/super-admin');
          break;
        case 'ADMIN':
          router.push('/dashboard/admin');
          break;
        case 'USER':
        default:
          router.push('/dashboard/user');
          break;
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="fixed inset-0 min-h-screen w-full bg-black overflow-hidden">
      {/* Animated coding background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {/* Floating code block 1 */}
        <div className="absolute top-[10%] left-[8%] animate-float-slow">
          <div className="bg-gray-900 text-green-400 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'const login = (user, pass) => { ... }'}
          </div>
        </div>
        
        {/* Additional code blocks distributed across the page */}
        <div className="absolute top-[25%] left-[20%] animate-float-medium">
          <div className="bg-gray-900 text-yellow-300 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'function authenticate() { return true; }'}
          </div>
        </div>
        
        <div className="absolute top-[15%] right-[15%] animate-float-slow">
          <div className="bg-gray-900 text-cyan-400 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'import { useState } from "react";'}
          </div>
        </div>
        
        {/* Existing code blocks with adjusted positioning */}
        <div className="absolute bottom-[20%] right-[18%] animate-float-fast">
          <div className="bg-gray-800 text-blue-300 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'authenticate(credentials);'}
          </div>
        </div>
        
        <div className="absolute top-[40%] right-[30%] animate-float-medium">
          <div className="bg-gray-900 text-pink-300 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'if (isAuthenticated) { return <Dashboard /> }'}
          </div>
        </div>
        
        <div className="absolute bottom-[30%] left-[25%] animate-float-slow">
          <div className="bg-gray-800 text-green-300 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'export default function App() { ... }'}
          </div>
        </div>
        
        <div className="absolute bottom-[15%] left-[10%] animate-float-medium">
          <div className="bg-gray-900 text-purple-300 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'const [user, setUser] = useState(null);'}
          </div>
        </div>
        
        {/* Enhanced animated shapes with wider distribution */}
        <div className="absolute left-1/4 top-1/5 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute right-1/4 top-1/3 w-32 h-32 bg-purple-500 rounded-full filter blur-2xl opacity-15 animate-pulse delay-150"></div>
        <div className="absolute left-1/3 bottom-1/4 w-36 h-36 bg-green-500 rounded-full filter blur-3xl opacity-10 animate-pulse delay-300"></div>
        <div className="absolute right-1/5 bottom-1/3 w-48 h-48 bg-pink-500 rounded-full filter blur-3xl opacity-10 animate-pulse delay-500"></div>
        <div className="absolute left-2/3 top-2/3 w-28 h-28 bg-yellow-500 rounded-full filter blur-2xl opacity-15 animate-pulse delay-700"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="flex items-center justify-center p-8 text-white">Loading sign-in form...</div>}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
