import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-semibold text-[#101828] tracking-tight leading-tight mb-6">
          Take command of your
          <span className="block text-[#551931]">personal finances</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          A simple, accurate expense tracker designed for people who value clarity over complexity.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-[#551931] hover:bg-[#d93d1d] text-white px-8 h-12 text-base"
            >
              Start Tracking
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-gray-200 text-[#101828] px-8 h-12 text-base hover:bg-gray-50"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}