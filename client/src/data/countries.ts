// FILE: client/src/data/countries.ts

export type Country = {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
  format: string;
  maxLength: number;
};

// Export the array directly
export const countries: Country[] = [
  {
    name: "Россия",
    code: "RU",
    flag: "🇷🇺",
    dialCode: "+7",
    format: "XXX XXX XX XX",
    maxLength: 10,
  },
  {
    name: "Таджикистан",
    code: "TJ",
    flag: "🇹🇯",
    dialCode: "+992",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Казахстан",
    code: "KZ",
    flag: "🇰🇿",
    dialCode: "+7",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "Украина",
    code: "UA",
    flag: "🇺🇦",
    dialCode: "+380",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Беларусь",
    code: "BY",
    flag: "🇧🇾",
    dialCode: "+375",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Afghanistan",
    code: "AF",
    flag: "🇦🇫",
    dialCode: "+93",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Albania",
    code: "AL",
    flag: "🇦🇱",
    dialCode: "+355",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Algeria",
    code: "DZ",
    flag: "🇩🇿",
    dialCode: "+213",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Andorra",
    code: "AD",
    flag: "🇦🇩",
    dialCode: "+376",
    format: "XXX XXX",
    maxLength: 6,
  },
  {
    name: "Angola",
    code: "AO",
    flag: "🇦🇴",
    dialCode: "+244",
    format: "XXX XXX XXX",
    maxLength: 9,
  },
  {
    name: "Argentina",
    code: "AR",
    flag: "🇦🇷",
    dialCode: "+54",
    format: "XX XXXX XXXX",
    maxLength: 10,
  },
  {
    name: "Armenia",
    code: "AM",
    flag: "🇦🇲",
    dialCode: "+374",
    format: "XX XXX XXX",
    maxLength: 8,
  },
  {
    name: "Australia",
    code: "AU",
    flag: "🇦🇺",
    dialCode: "+61",
    format: "XXX XXX XXX",
    maxLength: 9,
  },
  {
    name: "Austria",
    code: "AT",
    flag: "🇦🇹",
    dialCode: "+43",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "Azerbaijan",
    code: "AZ",
    flag: "🇦🇿",
    dialCode: "+994",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Bahamas",
    code: "BS",
    flag: "🇧🇸",
    dialCode: "+1242",
    format: "XXX XXXX",
    maxLength: 7,
  },
  {
    name: "Bahrain",
    code: "BH",
    flag: "🇧🇭",
    dialCode: "+973",
    format: "XXXX XXXX",
    maxLength: 8,
  },
  {
    name: "Bangladesh",
    code: "BD",
    flag: "🇧🇩",
    dialCode: "+880",
    format: "XXXX XXXX",
    maxLength: 10,
  },
  {
    name: "Belgium",
    code: "BE",
    flag: "🇧🇪",
    dialCode: "+32",
    format: "XXX XX XX XX",
    maxLength: 9,
  },
  {
    name: "Brazil",
    code: "BR",
    flag: "🇧🇷",
    dialCode: "+55",
    format: "XX XXXXX XXXX",
    maxLength: 11,
  },
  {
    name: "Bulgaria",
    code: "BG",
    flag: "🇧🇬",
    dialCode: "+359",
    format: "XXX XXX XXX",
    maxLength: 9,
  },
  {
    name: "Canada",
    code: "CA",
    flag: "🇨🇦",
    dialCode: "+1",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "China",
    code: "CN",
    flag: "🇨🇳",
    dialCode: "+86",
    format: "XXX XXXX XXXX",
    maxLength: 11,
  },
  {
    name: "Colombia",
    code: "CO",
    flag: "🇨🇴",
    dialCode: "+57",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "Croatia",
    code: "HR",
    flag: "🇭🇷",
    dialCode: "+385",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Czech Republic",
    code: "CZ",
    flag: "🇨🇿",
    dialCode: "+420",
    format: "XXX XXX XXX",
    maxLength: 9,
  },
  {
    name: "Denmark",
    code: "DK",
    flag: "🇩🇰",
    dialCode: "+45",
    format: "XX XX XX XX",
    maxLength: 8,
  },
  {
    name: "Egypt",
    code: "EG",
    flag: "🇪🇬",
    dialCode: "+20",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "Estonia",
    code: "EE",
    flag: "🇪🇪",
    dialCode: "+372",
    format: "XXXX XXXX",
    maxLength: 8,
  },
  {
    name: "Finland",
    code: "FI",
    flag: "🇫🇮",
    dialCode: "+358",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "France",
    code: "FR",
    flag: "🇫🇷",
    dialCode: "+33",
    format: "X XX XX XX XX",
    maxLength: 9,
  },
  {
    name: "Germany",
    code: "DE",
    flag: "🇩🇪",
    dialCode: "+49",
    format: "XXXX XXXXXXX",
    maxLength: 11,
  },
  {
    name: "Greece",
    code: "GR",
    flag: "🇬🇷",
    dialCode: "+30",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "Hungary",
    code: "HU",
    flag: "🇭🇺",
    dialCode: "+36",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Iceland",
    code: "IS",
    flag: "🇮🇸",
    dialCode: "+354",
    format: "XXX XXXX",
    maxLength: 7,
  },
  {
    name: "India",
    code: "IN",
    flag: "🇮🇳",
    dialCode: "+91",
    format: "XXXXX XXXXX",
    maxLength: 10,
  },
  {
    name: "Indonesia",
    code: "ID",
    flag: "🇮🇩",
    dialCode: "+62",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "Iran",
    code: "IR",
    flag: "🇮🇷",
    dialCode: "+98",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "Ireland",
    code: "IE",
    flag: "🇮🇪",
    dialCode: "+353",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Israel",
    code: "IL",
    flag: "🇮🇱",
    dialCode: "+972",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Italy",
    code: "IT",
    flag: "🇮🇹",
    dialCode: "+39",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "Japan",
    code: "JP",
    flag: "🇯🇵",
    dialCode: "+81",
    format: "XX XXXX XXXX",
    maxLength: 10,
  },
  {
    name: "Latvia",
    code: "LV",
    flag: "🇱🇻",
    dialCode: "+371",
    format: "XX XXX XXX",
    maxLength: 8,
  },
  {
    name: "Lithuania",
    code: "LT",
    flag: "🇱🇹",
    dialCode: "+370",
    format: "XXX XXXXX",
    maxLength: 8,
  },
  {
    name: "Luxembourg",
    code: "LU",
    flag: "🇱🇺",
    dialCode: "+352",
    format: "XXX XXX XXX",
    maxLength: 9,
  },
  {
    name: "Malaysia",
    code: "MY",
    flag: "🇲🇾",
    dialCode: "+60",
    format: "XX XXXX XXXX",
    maxLength: 10,
  },
  {
    name: "Mexico",
    code: "MX",
    flag: "🇲🇽",
    dialCode: "+52",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "Netherlands",
    code: "NL",
    flag: "🇳🇱",
    dialCode: "+31",
    format: "X XX XX XX XX",
    maxLength: 9,
  },
  {
    name: "New Zealand",
    code: "NZ",
    flag: "🇳🇿",
    dialCode: "+64",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "Norway",
    code: "NO",
    flag: "🇳🇴",
    dialCode: "+47",
    format: "XXX XX XXX",
    maxLength: 8,
  },
  {
    name: "Pakistan",
    code: "PK",
    flag: "🇵🇰",
    dialCode: "+92",
    format: "XXX XXXXXXX",
    maxLength: 10,
  },
  {
    name: "Poland",
    code: "PL",
    flag: "🇵🇱",
    dialCode: "+48",
    format: "XXX XXX XXX",
    maxLength: 9,
  },
  {
    name: "Portugal",
    code: "PT",
    flag: "🇵🇹",
    dialCode: "+351",
    format: "XXX XXX XXX",
    maxLength: 9,
  },
  {
    name: "Romania",
    code: "RO",
    flag: "🇷🇴",
    dialCode: "+40",
    format: "XXX XXX XXX",
    maxLength: 9,
  },
  {
    name: "Saudi Arabia",
    code: "SA",
    flag: "🇸🇦",
    dialCode: "+966",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Singapore",
    code: "SG",
    flag: "🇸🇬",
    dialCode: "+65",
    format: "XXXX XXXX",
    maxLength: 8,
  },
  {
    name: "Slovakia",
    code: "SK",
    flag: "🇸🇰",
    dialCode: "+421",
    format: "XXX XXX XXX",
    maxLength: 9,
  },
  {
    name: "Slovenia",
    code: "SI",
    flag: "🇸🇮",
    dialCode: "+386",
    format: "XX XXX XXX",
    maxLength: 8,
  },
  {
    name: "South Africa",
    code: "ZA",
    flag: "🇿🇦",
    dialCode: "+27",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "South Korea",
    code: "KR",
    flag: "🇰🇷",
    dialCode: "+82",
    format: "XX XXXX XXXX",
    maxLength: 10,
  },
  {
    name: "Spain",
    code: "ES",
    flag: "🇪🇸",
    dialCode: "+34",
    format: "XXX XXX XXX",
    maxLength: 9,
  },
  {
    name: "Sweden",
    code: "SE",
    flag: "🇸🇪",
    dialCode: "+46",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Switzerland",
    code: "CH",
    flag: "🇨🇭",
    dialCode: "+41",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "Thailand",
    code: "TH",
    flag: "🇹🇭",
    dialCode: "+66",
    format: "X XXXX XXXX",
    maxLength: 9,
  },
  {
    name: "Turkey",
    code: "TR",
    flag: "🇹🇷",
    dialCode: "+90",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    flag: "🇦🇪",
    dialCode: "+971",
    format: "XX XXX XXXX",
    maxLength: 9,
  },
  {
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    dialCode: "+44",
    format: "XXXX XXXXXX",
    maxLength: 10,
  },
  {
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    dialCode: "+1",
    format: "XXX XXX XXXX",
    maxLength: 10,
  },
  {
    name: "Vietnam",
    code: "VN",
    flag: "🇻🇳",
    dialCode: "+84",
    format: "XXX XXX XXX",
    maxLength: 9,
  },
];
