import { Metadata } from 'next';
import { HeroSection } from '@/components/guest/hero-section';
import { FeaturesSection } from '@/components/guest/features-section';
import { SampleProblemsSection } from '@/components/guest/sample-problems-section';

export const metadata: Metadata = {
  title: 'Guest Dashboard - BeatCode',
  description: 'Welcome to BeatCode - Your Ultimate LeetCode Companion',
};

export default function GuestDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Unified animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orbs */}
        <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Medium floating elements */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-400/8 to-blue-400/8 rounded-full blur-2xl animate-bounce delay-500"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-400/8 to-purple-400/8 rounded-full blur-2xl animate-bounce delay-1500"></div>

        {/* Small floating dots */}
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-300/5 rounded-full blur-xl animate-ping delay-2000"></div>
        <div className="absolute top-3/4 right-1/3 w-24 h-24 bg-purple-300/5 rounded-full blur-lg animate-ping delay-3000"></div>
        <div className="absolute top-1/6 right-1/2 w-20 h-20 bg-cyan-300/5 rounded-full blur-lg animate-ping delay-1000"></div>

        {/* Gradient mesh overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent animate-pulse"></div>
      </div>

      {/* Content with relative positioning */}
      <div className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <SampleProblemsSection />
      </div>
    </div>
  );
}
