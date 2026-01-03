export interface UserPreferences {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  preferred_currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export interface PreferencesFormData {
  preferred_currency: string;
  timezone: string;
}
