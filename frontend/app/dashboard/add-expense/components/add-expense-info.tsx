import { CheckCircle } from 'lucide-react';

export default function AddExpenseInfo() {
  return (
    <div className="bg-gradient-to-br from-[#551931]/5 to-[#7a2547]/5 border border-[#551931]/20 rounded-xl p-4 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <CheckCircle className="w-5 h-5 text-[#551931] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm sm:text-base font-medium text-[#551931]">
            Expense will be recorded with your current timezone
          </p>
          <p className="text-xs sm:text-sm text-[#551931]/80 leading-relaxed">
            The date you select will be stored exactly as entered, ensuring accurate daily totals
            based on your timezone settings. All times are recorded in UTC for consistency.
          </p>
        </div>
      </div>
    </div>
  );
}