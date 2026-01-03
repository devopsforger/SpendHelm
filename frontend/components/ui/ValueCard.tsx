import { LucideIcon } from 'lucide-react';

interface ValueCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function ValueCard({ icon: Icon, title, description }: ValueCardProps) {
  return (
    <div className="p-6">
      <div className="w-12 h-12 bg-[#551931]/10 rounded-xl flex items-center justify-center mb-5">
        <Icon className="w-6 h-6 text-[#551931]" />
      </div>
      <h3 className="text-lg font-medium text-[#101828] mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}