interface MockExpenseRowProps {
  category: string;
  amount: string;
  date: string;
}

export default function MockExpenseRow({ category, amount, date }: MockExpenseRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#551931]/10 rounded-lg"></div>
        <div>
          <p className="text-sm font-medium text-[#101828]">{category}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
      </div>
      <p className="font-medium text-[#101828]">{amount}</p>
    </div>
  );
}