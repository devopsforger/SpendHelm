interface MockStatCardProps {
  label: string;
  value: string;
}

export default function MockStatCard({ label, value }: MockStatCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[#101828]">{value}</p>
    </div>
  );
}