import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-[#101828] mb-4">
          Ready to take control?
        </h2>
        <p className="text-gray-600 mb-8">
          Start tracking your expenses in under a minute.
        </p>
        <Link href="/register">
          <Button
            size="lg"
            className="bg-[#551931] hover:bg-[#6b2040] text-white px-10 h-12 text-base"
          >
            Create Free Account
          </Button>
        </Link>
      </div>
    </section>
  );
}