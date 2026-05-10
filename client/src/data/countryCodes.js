export const COUNTRY_CODES = [
  { name: 'Afghanistan',   dialCode: '+93',  flag: '🇦🇫', minDigits: 9,  maxDigits: 9  },
  { name: 'Australia',     dialCode: '+61',  flag: '🇦🇺', minDigits: 9,  maxDigits: 9  },
  { name: 'Bangladesh',    dialCode: '+880', flag: '🇧🇩', minDigits: 10, maxDigits: 10 },
  { name: 'Brazil',        dialCode: '+55',  flag: '🇧🇷', minDigits: 10, maxDigits: 11 },
  { name: 'Canada',        dialCode: '+1',   flag: '🇨🇦', minDigits: 10, maxDigits: 10 },
  { name: 'China',         dialCode: '+86',  flag: '🇨🇳', minDigits: 11, maxDigits: 11 },
  { name: 'Egypt',         dialCode: '+20',  flag: '🇪🇬', minDigits: 10, maxDigits: 10 },
  { name: 'France',        dialCode: '+33',  flag: '🇫🇷', minDigits: 9,  maxDigits: 9  },
  { name: 'Germany',       dialCode: '+49',  flag: '🇩🇪', minDigits: 10, maxDigits: 11 },
  { name: 'India',         dialCode: '+91',  flag: '🇮🇳', minDigits: 10, maxDigits: 10 },
  { name: 'Indonesia',     dialCode: '+62',  flag: '🇮🇩', minDigits: 9,  maxDigits: 12 },
  { name: 'Italy',         dialCode: '+39',  flag: '🇮🇹', minDigits: 9,  maxDigits: 10 },
  { name: 'Japan',         dialCode: '+81',  flag: '🇯🇵', minDigits: 10, maxDigits: 11 },
  { name: 'Malaysia',      dialCode: '+60',  flag: '🇲🇾', minDigits: 9,  maxDigits: 10 },
  { name: 'Mexico',        dialCode: '+52',  flag: '🇲🇽', minDigits: 10, maxDigits: 10 },
  { name: 'Nepal',         dialCode: '+977', flag: '🇳🇵', minDigits: 10, maxDigits: 10 },
  { name: 'Netherlands',   dialCode: '+31',  flag: '🇳🇱', minDigits: 9,  maxDigits: 9  },
  { name: 'New Zealand',   dialCode: '+64',  flag: '🇳🇿', minDigits: 8,  maxDigits: 9  },
  { name: 'Nigeria',       dialCode: '+234', flag: '🇳🇬', minDigits: 10, maxDigits: 10 },
  { name: 'Pakistan',      dialCode: '+92',  flag: '🇵🇰', minDigits: 10, maxDigits: 10 },
  { name: 'Philippines',   dialCode: '+63',  flag: '🇵🇭', minDigits: 10, maxDigits: 10 },
  { name: 'Russia',        dialCode: '+7',   flag: '🇷🇺', minDigits: 10, maxDigits: 10 },
  { name: 'Saudi Arabia',  dialCode: '+966', flag: '🇸🇦', minDigits: 9,  maxDigits: 9  },
  { name: 'Singapore',     dialCode: '+65',  flag: '🇸🇬', minDigits: 8,  maxDigits: 8  },
  { name: 'South Africa',  dialCode: '+27',  flag: '🇿🇦', minDigits: 9,  maxDigits: 9  },
  { name: 'South Korea',   dialCode: '+82',  flag: '🇰🇷', minDigits: 9,  maxDigits: 10 },
  { name: 'Spain',         dialCode: '+34',  flag: '🇪🇸', minDigits: 9,  maxDigits: 9  },
  { name: 'Sri Lanka',     dialCode: '+94',  flag: '🇱🇰', minDigits: 9,  maxDigits: 9  },
  { name: 'Turkey',        dialCode: '+90',  flag: '🇹🇷', minDigits: 10, maxDigits: 10 },
  { name: 'UAE',           dialCode: '+971', flag: '🇦🇪', minDigits: 9,  maxDigits: 9  },
  { name: 'UK',            dialCode: '+44',  flag: '🇬🇧', minDigits: 10, maxDigits: 10 },
  { name: 'USA',           dialCode: '+1',   flag: '🇺🇸', minDigits: 10, maxDigits: 10 },
]

export const DEFAULT_COUNTRY = COUNTRY_CODES.find(c => c.name === 'India')

export function phoneErrorMsg(rawValue, country) {
  const digits = rawValue.replace(/\D/g, '')
  if (digits.length === 0) return undefined
  const { minDigits, maxDigits, name, dialCode } = country
  if (digits.length < minDigits || digits.length > maxDigits) {
    const range = minDigits === maxDigits ? `${minDigits}` : `${minDigits}–${maxDigits}`
    return `${name} (${dialCode}) numbers must be ${range} digits.`
  }
  return undefined
}
