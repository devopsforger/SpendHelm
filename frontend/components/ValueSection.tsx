import { TrendingUp, PieChart, Shield } from 'lucide-react';
import ValueCard from './ui/ValueCard';

export default function ValueSection() {
  const valueCards = [
    {
      icon: TrendingUp,
      title: "Track with precision",
      description: "Log expenses in seconds. Every entry is timestamped and categorized for accurate reporting."
    },
    {
      icon: PieChart,
      title: "See patterns clearly",
      description: "Daily, weekly, and monthly views help you understand where your money actually goes."
    },
    {
      icon: Shield,
      title: "Trust your data",
      description: "No estimates or guesses. Your numbers are your numbers, exactly as you entered them."
    }
  ];

  return (
    <section className="py-20 px-6 bg-gray-50/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-[#101828] mb-4">
            Built for accuracy, not engagement
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            No gamification. No social features. Just a reliable tool that helps you understand your spending.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {valueCards.map((card, index) => (
            <ValueCard
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}