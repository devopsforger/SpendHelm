'use client';

import { Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { currencies, timezones } from './timezone-data';
import TimezoneInfo from './timezone-info';
import { PreferencesFormData } from '@/lib/types/preferences';

interface DisplaySettingsCardProps {
  formData: PreferencesFormData;
  onFormChange: (field: keyof PreferencesFormData, value: string) => void;
  onSave: () => void;
  hasChanges: boolean;
  isSaving: boolean;
}

export default function DisplaySettingsCard({
  formData,
  onFormChange,
  onSave,
  hasChanges,
  isSaving
}: DisplaySettingsCardProps) {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-[#101828] mb-6">
        Display Settings
      </h2>

      <div className="space-y-8">
        {/* Currency Selection */}
        <div className="space-y-3">
          <Label htmlFor="currency" className="text-sm font-medium text-[#101828]">
            Preferred Currency
          </Label>
          <p className="text-sm text-gray-500">
            Default currency for new expenses and display
          </p>
          <Select
            value={formData.preferred_currency}
            onValueChange={(val) => onFormChange('preferred_currency', val)}
          >
            <SelectTrigger className="border-gray-300 focus:border-[#551931] focus:ring-[#551931]/20">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currency.code}</span>
                    <span className="text-gray-500">-</span>
                    <span>{currency.name}</span>
                    <span className="text-gray-400">{currency.symbol}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timezone Selection */}
        <div className="space-y-3">
          <Label htmlFor="timezone" className="text-sm font-medium text-[#101828]">
            Timezone
          </Label>
          <p className="text-sm text-gray-500">
            Used to calculate daily expense totals and display dates
          </p>
          <Select
            value={formData.timezone}
            onValueChange={(val) => onFormChange('timezone', val)}
          >
            <SelectTrigger className="border-gray-300 focus:border-[#551931] focus:ring-[#551931]/20">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="max-h-75">
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{tz.label}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      UTC{tz.offset}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timezone Info */}
        <TimezoneInfo />

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              {hasChanges && (
                <p className="text-sm text-amber-600 font-medium">
                  You have unsaved changes
                </p>
              )}
            </div>
            <Button
              onClick={onSave}
              disabled={!hasChanges || isSaving}
              className="bg-linear-to-r from-[#551931] to-[#7a2547] hover:from-[#6b2040] hover:to-[#8a2c52] text-white px-8 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}