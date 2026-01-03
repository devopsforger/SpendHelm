import { BarChart3, Calendar, Shield } from 'lucide-react';

interface TrustFeature {
  icon: React.ElementType;
  title: string;
  description: string;
}

export default function TrustSection() {
  const features: TrustFeature[] = [
    {
      icon: BarChart3,
      title: "Accurate Totals",
      description: "Your daily totals respect your timezone settings. No confusion about when a day starts or ends."
    },
    {
      icon: Calendar,
      title: "Predictable Behavior",
      description: "Same interface, same features, same reliability. Updates improve without disrupting."
    },
    {
      icon: Shield,
      title: "Your Data, Protected",
      description: "We don't analyze your spending for insights. We just store it accurately and show it clearly."
    }
  ];

  return (
    <section className="py-20 px-6 bg-[#101828]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-white mb-6">
          Designed for the long term
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
          SpendHelm is built to be a reliable companion in your financial journey.
          No trendy features that disappear. No experiments with your data.
          Just consistent, predictable behavior you can count on.
        </p>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="p-6">
                <Icon className="w-6 h-6 text-[#F14926] mb-4" />
                <h3 className="text-white font-medium mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}