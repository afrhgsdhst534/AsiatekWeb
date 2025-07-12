// FILE: client/src/components/ui/phone-input.tsx (Import countries, keep suppressChrome)
// Replace ENTIRE file content

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
// --- NEW: Import countries and type from the data file ---
import { countries, type Country } from "@/data/countries";
// ---

interface PhoneInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  countryCode: string | undefined;
  onCountryCodeChange: (code: string) => void;
  error?: string;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  suppressChrome?: boolean;
}

// --- REMOVED the large 'countries' array definition ---

const PhoneInput: React.FC<PhoneInputProps> = ({
  value = "",
  onChange,
  countryCode,
  onCountryCodeChange,
  error,
  placeholder: inputPlaceholder,
  label,
  className,
  disabled = false,
  suppressChrome = false,
}) => {
  // --- Logic remains the same, using the imported 'countries' array ---
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    return (
      countries.find((country) => country.dialCode === (countryCode || "+7")) ||
      countries[0]
    );
  });
  const [countryCodeInput, setCountryCodeInput] = useState<string>(
    countryCode || "+7",
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const safeCountryCode = countryCode || "+7";
    const country = countries.find((c) => c.dialCode === safeCountryCode);
    if (country && country.dialCode !== selectedCountry.dialCode) {
      setSelectedCountry(country);
      setCountryCodeInput(country.dialCode);
    }
  }, [countryCode, selectedCountry.dialCode]);

  const formatPhoneNumber = (input: string, country: Country): string => {
    const digitsOnly = input.replace(/\D/g, "");
    const limitedDigits = digitsOnly.substring(0, country.maxLength);
    let formatted = "";
    let patternIndex = 0;
    let digitIndex = 0;
    while (
      patternIndex < country.format.length &&
      digitIndex < limitedDigits.length
    ) {
      const patternChar = country.format[patternIndex];
      if (patternChar === "X") {
        formatted += limitedDigits[digitIndex];
        digitIndex++;
        patternIndex++;
      } else {
        formatted += patternChar;
        patternIndex++;
        if (
          patternIndex === country.format.length &&
          digitIndex < limitedDigits.length
        ) {
        }
      }
    }
    return formatted;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    if (digitsOnly.length <= selectedCountry.maxLength) {
      const formatted = formatPhoneNumber(e.target.value, selectedCountry);
      onChange(formatted);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setCountryCodeInput(country.dialCode);
    onCountryCodeChange(country.dialCode);
    onChange("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCountryCodeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let newCode = e.target.value;
    if (newCode && !newCode.startsWith("+")) {
      newCode = "+" + newCode;
    }
    newCode = newCode.substring(0, 5);
    setCountryCodeInput(newCode);
    const matchingCountry = countries.find((c) => c.dialCode === newCode);
    if (matchingCountry) {
      setSelectedCountry(matchingCountry);
      onCountryCodeChange(matchingCountry.dialCode);
      onChange("");
    }
  };

  const handleCountryCodeBlur = () => {
    const matchingCountry = countries.find(
      (c) => c.dialCode === countryCodeInput,
    );
    if (!matchingCountry) {
      setCountryCodeInput(selectedCountry.dialCode);
      onCountryCodeChange(selectedCountry.dialCode);
    } else if (countryCodeInput !== selectedCountry.dialCode) {
      onCountryCodeChange(countryCodeInput);
      setSelectedCountry(matchingCountry);
      onChange("");
    }
  };

  const actualPlaceholder = inputPlaceholder || selectedCountry.format;

  return (
    <div className={className}>
      {!suppressChrome && label && (
        <Label
          htmlFor="phone"
          className="block text-foreground font-medium mb-2"
        >
          {label} {error && <span className="text-destructive text-sm">*</span>}
        </Label>
      )}

      <div className="relative flex">
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center px-3 py-2 border border-border rounded-l-md h-10"
                disabled={disabled}
              >
                <span className="mr-1">{selectedCountry.flag}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-60 overflow-y-auto"
            >
              {countries.map(
                (
                  country, // Use imported 'countries'
                ) => (
                  <DropdownMenuItem
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
                    className="flex items-center px-4 py-2 cursor-pointer"
                  >
                    <span className="mr-2">{country.flag}</span>
                    <span>
                      {country.name} ({country.dialCode})
                    </span>
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            ref={codeInputRef}
            value={countryCodeInput}
            onChange={handleCountryCodeInputChange}
            onBlur={handleCountryCodeBlur}
            className="w-20 border-l-0 border-r-0 rounded-none h-10"
            disabled={disabled}
            aria-label="Country Code"
          />
        </div>
        <Input
          id="phone"
          ref={inputRef}
          value={value || ""}
          onChange={handleInputChange}
          className={cn(
            "w-full rounded-l-none focus:z-10 h-10",
            error && "border-destructive focus:ring-destructive",
          )}
          placeholder={actualPlaceholder}
          aria-invalid={!!error}
          disabled={disabled}
          type="tel"
          autoComplete="tel-national"
        />
      </div>

      {!suppressChrome &&
        (error ? (
          <p className="text-destructive text-sm mt-1">{error}</p>
        ) : (
          <p className="text-muted-foreground text-sm mt-1">
            Формат: {selectedCountry.format}
          </p>
        ))}
    </div>
  );
};

export default PhoneInput;
