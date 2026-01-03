import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface NoteTextareaProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}

export default function NoteTextarea({ value, onChange, isLoading }: NoteTextareaProps) {
  return (
    <div>
      <Label htmlFor="note" className="text-sm font-medium text-[#101828]">
        Note <span className="text-gray-400 text-xs font-normal">(optional)</span>
      </Label>
      <div className="relative mt-1.5">
        <div className="absolute left-3 top-3">
          <FileText className="w-4 h-4 text-gray-400" />
        </div>
        <Textarea
          id="note"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add a note about this expense (e.g., location, purpose, details)..."
          rows={3}
          className="pl-10 border-gray-300 focus:border-[#551931] focus:ring-[#551931]/20 resize-none"
          disabled={isLoading}
          maxLength={500}
        />
      </div>
      <div className="flex justify-between">
        <p className="text-xs text-gray-500 mt-1">
          Optional details about the expense
        </p>
        <p className={`text-xs mt-1 ${value.length >= 450 ? 'text-[#F14926]' : 'text-gray-500'
          }`}>
          {value.length}/500
        </p>
      </div>
    </div>
  );
}