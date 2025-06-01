'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  Trophy, 
  Target, 
  Users, 
  ArrowRight, 
  Smartphone, 
  Zap,
  TrendingUp,
  BookOpen,
  Award,
  CheckCircle,
  Star,
  Calendar,
  BarChart3,
  Globe,
  Rocket,
  Shield,
  Timer,
  Brain,
  Coffee,
  ChevronRight
} from 'lucide-react';

export default function Page() {
  return (
    <SessionProvider>
      <Home />
    </SessionProvider>
  );
}

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      // Redirect based on role
      switch (session.user?.role) {
        case 'SUPER_ADMIN':
          router.push('/dashboard/super-admin');
          break;
        case 'ADMIN':
          router.push('/dashboard/admin');
          break;
        default:
          router.push('/dashboard/user');
      }
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-20 -left-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-75"></div>
          <div className="absolute bottom-20 right-20 w-36 h-36 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-150"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-12 pb-8 sm:pb-12 md:pb-16 lg:pb-20">
            <main className="mt-8 mx-auto max-w-7xl sm:mt-10 md:mt-12 lg:mt-16">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-6">
                  <div className="flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full">
                    <Rocket className="h-5 w-5 text-blue-600 animate-bounce" />
                    <span className="text-blue-700 font-medium text-sm">Level up your coding skills</span>
                  </div>
                </div>
                
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                  <div className="lg:col-span-1">
                    <h1 className="text-3xl tracking-tight font-bold text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
                      <span className="block">Master</span>
                      <span className="block text-blue-600 animate-pulse">LeetCode</span>
                      <span className="block">with BeatCode</span>
                    </h1>
                    
                    <p className="mt-4 text-base text-gray-600 sm:text-lg sm:max-w-xl sm:mx-auto md:text-xl lg:mx-0 lg:max-w-lg">
                      Practice coding problems by company, timeline, and topic. Track your progress, 
                      build streaks, and ace your technical interviews.
                    </p>
                    
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center lg:justify-start">
                      <Link href="/auth/signin">
                        <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                          <Zap className="mr-2 h-4 w-4" />
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 px-6 py-3 text-base font-semibold rounded-lg transition-all duration-200 hover:bg-gray-50"
                      >
                        <Smartphone className="mr-2 h-4 w-4" />
                        Install PWA
                      </Button>
                    </div>

                    {/* Quick stats */}
                    <div className="mt-8 flex justify-center lg:justify-start">
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-blue-600" />
                          <span className="font-medium">Free</span>  Usage
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1 text-green-600" />
                          <span className="font-medium">500+</span> Problems
                        </div>
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 mr-1 text-yellow-600" />
                          <span className="font-medium">50+</span> Companies
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side visual element */}
                  <div className="lg:col-span-1 mt-10 lg:mt-0 relative">
                    <div className="relative max-w-lg mx-auto lg:max-w-none">
                      {/* Code Editor Mockup */}
                      <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-300">
                        {/* Editor Header */}
                        <div className="bg-gray-800 px-4 py-3 flex items-center space-x-2">
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <div className="text-gray-400 text-sm ml-4">two-sum.py</div>
                        </div>
                        
                        {/* Code Content */}
                        <div className="p-4 text-sm font-mono">
                          <div className="text-purple-400">def <span className="text-blue-400">twoSum</span>(<span className="text-orange-400">nums, target</span>):</div>
                          <div className="text-gray-500 ml-4"># Your solution here</div>
                          <div className="text-gray-300 ml-4">hash_map = {}</div>
                          <div className="text-purple-400 ml-4">for <span className="text-orange-400">i, num</span> <span className="text-purple-400">in</span> <span className="text-blue-400">enumerate</span>(<span className="text-orange-400">nums</span>):</div>
                          <div className="text-gray-300 ml-8">complement = target - num</div>
                          <div className="text-purple-400 ml-8">if <span className="text-orange-400">complement</span> <span className="text-purple-400">in</span> <span className="text-orange-400">hash_map</span>:</div>
                          <div className="text-purple-400 ml-12">return <span className="text-gray-300">[hash_map[complement], i]</span></div>
                          <div className="text-gray-300 ml-8">hash_map[num] = i</div>
                          <div className="animate-pulse text-gray-400">|</div>
                        </div>
                      </div>

                      {/* Floating elements */}
                      <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg animate-bounce">
                        ✓ Solved
                      </div>
                      
                      <div className="absolute -bottom-4 -left-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg transform -rotate-12 animate-pulse">
                        <div className="flex items-center space-x-1">
                          <Trophy className="h-4 w-4" />
                          <span className="text-sm font-semibold">+50 XP</span>
                        </div>
                      </div>

                      {/* Progress indicators */}
                      <div className="absolute top-16 -left-8 bg-white rounded-lg shadow-lg p-3 transform -rotate-6 animate-pulse delay-75">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Progress</div>
                            <div className="text-sm font-bold text-gray-900">75%</div>
                          </div>
                        </div>
                      </div>

                      {/* Streak indicator */}
                      <div className="absolute bottom-16 -right-8 bg-orange-500 text-white rounded-lg shadow-lg p-3 transform rotate-12 animate-bounce delay-150">
                        <div className="flex items-center space-x-2">
                          <div className="text-lg">🔥</div>
                          <div>
                            <div className="text-xs">Streak</div>
                            <div className="text-sm font-bold">7 days</div>
                          </div>
                        </div>
                      </div>

                      {/* Company badges */}
                      <div className="absolute top-32 right-0 space-y-2 transform rotate-3">
                        <div className="bg-white rounded-lg shadow-md px-2 py-1 text-xs font-semibold text-gray-700 animate-pulse">Google</div>
                        <div className="bg-white rounded-lg shadow-md px-2 py-1 text-xs font-semibold text-gray-700 animate-pulse delay-75">Meta</div>
                        <div className="bg-white rounded-lg shadow-md px-2 py-1 text-xs font-semibold text-gray-700 animate-pulse delay-150">Amazon</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-3">
              <Star className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-sm font-semibold text-blue-600 tracking-wide uppercase">Features</h2>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Everything you need to succeed
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to accelerate your coding interview preparation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Code className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  Company-wise Practice
                  <ChevronRight className="h-4 w-4 ml-1 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Practice questions from top tech companies like Google, Facebook, Amazon, and more.
                </p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-green-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  Timeline-based Learning
                  <ChevronRight className="h-4 w-4 ml-1 text-gray-400 group-hover:text-green-600 transition-colors" />
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Organize study plans with 30-day, 3-month, and 6-month timelines.
                </p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  Progress Tracking
                  <ChevronRight className="h-4 w-4 ml-1 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Track progress, maintain streaks, and visualize improvement with detailed analytics.
                </p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-orange-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  Multi-role Access
                  <ChevronRight className="h-4 w-4 ml-1 text-gray-400 group-hover:text-orange-600 transition-colors" />
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Different access levels for users, admins, and super admins with role-based features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 relative">
        {/* Additional floating shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-8 left-8 w-20 h-20 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-ping"></div>
          <div className="absolute bottom-0 right-12 w-24 h-24 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center gap-8 text-white">
          <div className="flex flex-col items-center space-y-2 p-4 bg-white bg-opacity-10 rounded-xl shadow-lg hover:scale-105 transform transition">
            <Trophy className="h-10 w-10 text-yellow-400 animate-bounce" />
            <span className="font-medium">Company-wise Questions</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 bg-white bg-opacity-10 rounded-xl shadow-lg hover:scale-105 transform transition">
            <CheckCircle className="h-10 w-10 text-green-400 animate-spin-slow" />
            <span className="font-medium">Mark Question</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 bg-white bg-opacity-10 rounded-xl shadow-lg hover:scale-105 transform transition">
            <Star className="h-10 w-10 text-blue-400 animate-pulse" />
            <span className="font-medium">Give Feedback</span>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 bg-white bg-opacity-10 rounded-xl shadow-lg hover:scale-105 transform transition">
            <BookOpen className="h-10 w-10 text-purple-400 animate-bounce" />
            <span className="font-medium">Suggest / Provide Questions</span>
          </div>
        </div>
      </div>

      {/* PWA Features */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-3">
              <Globe className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Practice Anywhere, Anytime
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              BeatCode is a Progressive Web App that works seamlessly across all your devices
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">📱</div>
              <div className="flex items-center justify-center mb-2">
                <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Mobile Ready</h3>
              </div>
              <p className="text-gray-600">Install on your phone for on-the-go practice and seamless mobile experience</p>
            </div>
            
            <div className="group text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">💻</div>
              <div className="flex items-center justify-center mb-2">
                <Brain className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Desktop Optimized</h3>
              </div>
              <p className="text-gray-600">Full-featured experience on desktop with advanced tools and analytics</p>
            </div>
            
            <div className="group text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">🔄</div>
              <div className="flex items-center justify-center mb-2">
                <Coffee className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Offline Support</h3>
              </div>
              <p className="text-gray-600">Access your progress and practice problems even without internet connection</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-12">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <Award className="h-8 w-8 text-yellow-400 mr-3 animate-bounce" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Ready to Start Your Journey?
            </h2>
          </div>
          <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
            
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <Rocket className="mr-2 h-5 w-5" />
                Start Coding Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
