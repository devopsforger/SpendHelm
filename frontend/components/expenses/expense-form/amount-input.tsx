import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}

export default function AmountInput({ value, onChange, isLoading }: AmountInputProps) {
  return (
    <div>
      <Label htmlFor="amount" className="text-sm font-medium text-[#101828] flex items-center gap-1">
        Amount <span className="text-[#F14926]">*</span>
      </Label>
      <div className="relative mt-1.5">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <DollarSign className="w-4 h-4 text-gray-400" />
        </div>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          required
          className="pl-10 text-lg border-gray-300 focus:border-[#551931] focus:ring-[#551931]/20"
          disabled={isLoading}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Enter the expense amount (minimum: 0.01)
      </p>
    </div>
  );
}