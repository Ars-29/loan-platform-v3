import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GridDistortionBackground } from '@/components/ui/GridDistortionBackground';
import { LiquidChromeBackground } from '@/components/ui/LiquidChromeBackground';
import { PrismaticBurstBackground } from '@/components/ui/PrismaticBurstBackground';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#005b7c] via-[#008eab] to-[#01bcc6]">
      {/* Sophisticated Animated Background */}
      <LiquidChromeBackground />
      {/* Header */}
      <header className="bg-[#F7F1E9]/95 backdrop-blur-xl shadow-lg border-b border-[#F7F1E9]/30 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#005b7c] to-[#01bcc6] bg-clip-text text-transparent">
                  Loan Officer Platform
                </h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-10">
              <Link href="#features" className="text-[#005b7c] hover:text-[#01bcc6] font-medium transition-colors duration-300">
                Features
              </Link>
              <Link href="#pricing" className="text-[#005b7c] hover:text-[#01bcc6] font-medium transition-colors duration-300">
                Pricing
              </Link>
              <Link href="#contact" className="text-[#005b7c] hover:text-[#01bcc6] font-medium transition-colors duration-300">
                Contact
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="ghost" className="text-[#005b7c] hover:text-[#01bcc6] hover:bg-[#01bcc6]/10 font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-[#01bcc6] to-[#008eab] hover:from-[#008eab] hover:to-[#005b7c] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-40">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold text-[#F7F1E9] mb-12 leading-tight drop-shadow-lg">
              Build Stunning Landing Pages
              <span className="block bg-gradient-to-r from-[#F7F1E9] via-[#01bcc6] to-[#F7F1E9] bg-clip-text text-transparent animate-pulse drop-shadow-lg">
                for Loan Officers
              </span>
            </h1>
            <p className="text-2xl text-[#F7F1E9]/90 mb-16 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md">
              Create professional, customizable landing pages that convert visitors into leads. 
              No coding required.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link href="/auth">
                <Button size="lg" className="w-full sm:w-auto px-12 py-6 text-xl font-bold bg-[#F7F1E9] text-[#005b7c] hover:bg-[#F7F1E9]/90 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105">
                  Start Building Now
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto px-12 py-6 text-xl font-bold border-3 border-[#F7F1E9] text-[#F7F1E9] hover:bg-[#F7F1E9] hover:text-[#005b7c] transition-all duration-500 transform hover:scale-105 bg-transparent backdrop-blur-sm">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-32 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
              <h2 className="text-5xl font-bold text-[#F7F1E9] mb-8 drop-shadow-lg">
                Everything You Need to Succeed
              </h2>
              <p className="text-2xl text-[#F7F1E9]/90 max-w-3xl mx-auto font-light drop-shadow-md">
                Powerful features designed specifically for loan officers
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="bg-[#F7F1E9]/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-[#F7F1E9]/40 transform hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-[#01bcc6] to-[#01bcc6]/80 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
                  <svg className="w-10 h-10 text-[#F7F1E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-[#005b7c] mb-6">
                  Real-time Customization
                </h3>
                <p className="text-[#005b7c]/80 leading-relaxed text-lg">
                  Customize your landing pages with live preview. See changes instantly as you build.
                </p>
              </div>

              <div className="bg-[#F7F1E9]/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-[#F7F1E9]/40 transform hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-[#008eab] to-[#008eab]/80 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
                  <svg className="w-10 h-10 text-[#F7F1E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-[#005b7c] mb-6">
                  Lead Management
                </h3>
                <p className="text-[#005b7c]/80 leading-relaxed text-lg">
                  Track and manage leads from your landing pages. Never miss a potential customer.
                </p>
              </div>

              <div className="bg-[#F7F1E9]/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-[#F7F1E9]/40 transform hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-[#005b7c] to-[#005b7c]/80 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
                  <svg className="w-10 h-10 text-[#F7F1E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-[#005b7c] mb-6">
                  Rate Integration
                </h3>
                <p className="text-[#005b7c]/80 leading-relaxed text-lg">
                  Integrate live mortgage rates from Optimal Blue. Always show current rates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#F7F1E9]/95 backdrop-blur-xl rounded-3xl p-20 text-center relative overflow-hidden shadow-3xl border border-[#F7F1E9]/40">
              <div className="absolute inset-0 bg-gradient-to-br from-[#01bcc6]/10 to-[#008eab]/10"></div>
              <div className="relative z-10">
                <h2 className="text-5xl md:text-6xl font-bold mb-8 text-[#005b7c]">
                  Ready to Get Started?
                </h2>
                <p className="text-2xl mb-12 text-[#005b7c]/80 max-w-3xl mx-auto font-light">
                  Join thousands of loan officers who are already growing their business
                </p>
                <Link href="/auth">
                  <Button size="lg" className="px-16 py-6 text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 bg-gradient-to-r from-[#01bcc6] to-[#008eab] hover:from-[#008eab] hover:to-[#005b7c] text-[#F7F1E9]">
                    Create Your Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 relative z-10 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-8 text-[#F7F1E9] drop-shadow-lg">
              Loan Officer Platform
            </h3>
            <p className="text-[#F7F1E9]/90 mb-16 text-xl max-w-3xl mx-auto font-light drop-shadow-md">
              Building the future of loan officer marketing
            </p>
            <div className="border-t border-[#F7F1E9]/30 pt-12">
              <p className="text-[#F7F1E9]/70 text-lg">
                © 2024 Loan Officer Platform. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}