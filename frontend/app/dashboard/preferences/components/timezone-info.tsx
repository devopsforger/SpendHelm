import { Info } from 'lucide-react';

export default function TimezoneInfo() {
  return (
    <div className="bg-linear-to-br from-[#551931]/5 to-[#7a2547]/5 border border-[#551931]/20 rounded-xl p-4 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <Info className="w-5 h-5 text-[#551931] shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="text-sm sm:text-base font-medium text-[#551931]">
            About Timezone Settings
          </p>
          <div className="text-xs sm:text-sm text-[#551931]/80 space-y-2 leading-relaxed">
            <p>
              {`Your timezone determines when a "day" starts and ends for calculating daily totals.
              For example, if you're in New York and record an expense at 11 PM, it will be counted
              towards that day's total, not the next day's.`}
            </p>
            <p>
              All dates and times in the application will be displayed according to your selected
              timezone. This setting also affects export formats and report generation.
            </p>
            <p className="font-medium">
              Note: Changing your timezone will recalculate all daily totals based on the new timezone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}