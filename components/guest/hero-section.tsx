'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code2, CheckCircle } from 'lucide-react';
import { GuestNavbar } from '@/components/guest/guest-navbar';

const benefits = [
  'Save your progress and track completed problems',
  'Mark problems as favorites for quick access',
  'Add personal remarks and notes',
  'Access advanced filtering options'
];

export function HeroSection() {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Welcome to BeatCode';
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <GuestNavbar />
      <section className="py-8 px-4 pt-24 relative">
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Main content */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg animate-pulse">
                  <Code2 className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent min-h-[3rem] md:min-h-[4rem] lg:min-h-[5rem]">
                {displayedText}
                <span className="animate-pulse">|</span>
              </h1>
              
              <p className="text-base md:text-lg text-muted-foreground mb-4 font-bold bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-300 dark:to-slate-400 bg-clip-text text-transparent">
                Your Ultimate LeetCode Companion
              </p>
              
              <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Track your progress, filter problems by company and difficulty, 
                add personal remarks, and discover new challenges with our smart recommendation system.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-4">
                <Button asChild size="sm" className="text-sm px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg">
                  <Link href="/guest/problems">
                    Browse Problems
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="sm" className="text-sm px-6 py-3 hover:scale-105 transition-transform border-2 border-blue-200 hover:border-blue-300">
                  <Link href="/auth/register">
                    Sign Up Free
                  </Link>
                </Button>
              </div>

              <div className="text-center lg:text-left">
                <p className="text-xs text-muted-foreground font-medium">
                  Already have an account? <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-semibold">Sign In</Link>
                </p>
              </div>
            </div>

            {/* Right side - Benefits */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl p-6 border-0">
              <h3 className="text-lg font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Why Choose BeatCode?
              </h3>
              
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-2 group animate-fadeIn" style={{animationDelay: `${index * 200}ms`}}>
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
                <p className="text-center text-xs text-muted-foreground font-medium">
                  Join <span className="font-bold text-blue-600">thousands of developers</span> who use BeatCode to ace their interviews
                </p>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            opacity: 0;
            animation: fadeIn 0.6s ease-out forwards;
          }
        `}</style>
      </section>
    </>
  );
}
