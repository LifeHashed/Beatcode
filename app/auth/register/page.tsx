import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Register - BeatCode',
  description: 'Create a new account on BeatCode',
};

export default function RegisterPage() {
  return (
    <div className="fixed inset-0 min-h-screen w-full bg-black overflow-hidden">
      {/* Animated coding background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {/* Floating code block 1 */}
        <div className="absolute top-[12%] left-[15%] animate-float-slow">
          <div className="bg-gray-900 text-green-400 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'const sum = (a, b) => a + b;'}
          </div>
        </div>
        
        {/* Additional code blocks distributed across the page */}
        <div className="absolute top-[22%] left-[35%] animate-float-medium">
          <div className="bg-gray-800 text-orange-300 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'class User { constructor(name) { this.name = name; } }'}
          </div>
        </div>
        
        <div className="absolute top-[18%] right-[20%] animate-float-slow">
          <div className="bg-gray-900 text-teal-400 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'import React from "react";'}
          </div>
        </div>
        
        {/* Existing code blocks with adjusted positioning */}
        <div className="absolute bottom-[25%] right-[18%] animate-float-fast">
          <div className="bg-gray-800 text-blue-300 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'print("Hello, World!")'}
          </div>
        </div>
        
        <div className="absolute top-[45%] right-[32%] animate-float-medium">
          <div className="bg-gray-900 text-pink-300 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'for (let i = 0; i < 10; i++) { ... }'}
          </div>
        </div>
        
        <div className="absolute bottom-[35%] left-[22%] animate-float-slow">
          <div className="bg-gray-800 text-blue-300 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'function createUser(data) { return new User(data); }'}
          </div>
        </div>
        
        <div className="absolute bottom-[18%] left-[38%] animate-float-medium">
          <div className="bg-gray-900 text-violet-300 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'const API_URL = "/api/users";'}
          </div>
        </div>
        
        <div className="absolute top-[65%] right-[15%] animate-float-fast">
          <div className="bg-gray-800 text-emerald-300 font-mono text-xs rounded-lg shadow-lg px-4 py-2 opacity-80">
            {'try { await register(user); } catch (e) { ... }'}
          </div>
        </div>
        
        {/* Enhanced animated shapes with wider distribution */}
        <div className="absolute left-1/5 top-1/4 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute right-1/4 top-1/5 w-36 h-36 bg-purple-500 rounded-full filter blur-2xl opacity-15 animate-pulse delay-200"></div>
        <div className="absolute left-2/5 bottom-1/3 w-44 h-44 bg-green-500 rounded-full filter blur-3xl opacity-10 animate-pulse delay-300"></div>
        <div className="absolute right-1/3 bottom-1/4 w-48 h-48 bg-pink-500 rounded-full filter blur-3xl opacity-10 animate-pulse delay-450"></div>
        <div className="absolute left-3/4 top-3/5 w-32 h-32 bg-yellow-500 rounded-full filter blur-2xl opacity-15 animate-pulse delay-600"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <RegisterForm />
      </div>
    </div>
  );
}
