import {TimezoneOption} from "@/lib/types/preferences";

export const timezones: TimezoneOption[] = [
  {value: "UTC", label: "UTC (Coordinated Universal Time)", offset: "+00:00"},
  {
    value: "America/New_York",
    label: "Eastern Time (US & Canada)",
    offset: "-05:00",
  },
  {
    value: "America/Chicago",
    label: "Central Time (US & Canada)",
    offset: "-06:00",
  },
  {
    value: "America/Denver",
    label: "Mountain Time (US & Canada)",
    offset: "-07:00",
  },
  {
    value: "America/Los_Angeles",
    label: "Pacific Time (US & Canada)",
    offset: "-08:00",
  },
  {value: "America/Anchorage", label: "Alaska Time", offset: "-09:00"},
  {value: "Pacific/Honolulu", label: "Hawaii Time", offset: "-10:00"},
  {value: "Europe/London", label: "London", offset: "+00:00"},
  {value: "Europe/Paris", label: "Paris, Berlin, Rome", offset: "+01:00"},
  {value: "Europe/Moscow", label: "Moscow", offset: "+03:00"},
  {value: "Asia/Dubai", label: "Dubai", offset: "+04:00"},
  {value: "Asia/Kolkata", label: "India", offset: "+05:30"},
  {value: "Asia/Shanghai", label: "Beijing, Shanghai", offset: "+08:00"},
  {value: "Asia/Tokyo", label: "Tokyo", offset: "+09:00"},
  {value: "Australia/Sydney", label: "Sydney", offset: "+10:00"},
  {value: "Pacific/Auckland", label: "Auckland", offset: "+12:00"},
];

export const currencies = [
  {code: "USD", name: "US Dollar", symbol: "$"},
  {code: "EUR", name: "Euro", symbol: "€"},
  {code: "GBP", name: "British Pound", symbol: "£"},
  {code: "JPY", name: "Japanese Yen", symbol: "¥"},
  {code: "CAD", name: "Canadian Dollar", symbol: "CA$"},
  {code: "AUD", name: "Australian Dollar", symbol: "A$"},
  {code: "CHF", name: "Swiss Franc", symbol: "CHF"},
  {code: "CNY", name: "Chinese Yuan", symbol: "¥"},
  {code: "INR", name: "Indian Rupee", symbol: "₹"},
  {code: "MXN", name: "Mexican Peso", symbol: "MX$"},
  {code: "BRL", name: "Brazilian Real", symbol: "R$"},
  {code: "ZAR", name: "South African Rand", symbol: "R"},
];
