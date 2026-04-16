import { useEffect, useMemo, useRef, useState } from "react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";

type CountryOption = {
  iso2: string;
  label: string;
  dialCode: string;
};

type SplitPhone = {
  countryIso2: string;
  localNumber: string;
  countryCode: string;
};

const DEFAULT_COUNTRY_ISO2 = "RW";

function normalizeIso2(value?: string) {
  if (!value) return DEFAULT_COUNTRY_ISO2;
  return value.trim().toUpperCase();
}

function buildCountryOptions() {
  const displayNames =
    typeof Intl !== "undefined" && "DisplayNames" in Intl
      ? new Intl.DisplayNames(["en"], { type: "region" })
      : null;

  return getCountries()
    .map((iso2) => ({
      iso2,
      label: displayNames?.of(iso2) ?? iso2,
      dialCode: `+${getCountryCallingCode(iso2)}`,
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, "en", { sensitivity: "base" }),
    );
}

const COUNTRY_OPTIONS = buildCountryOptions();

function getDefaultCountry() {
  return (
    COUNTRY_OPTIONS.find((item) => item.iso2 === DEFAULT_COUNTRY_ISO2) ??
    COUNTRY_OPTIONS[0]
  );
}

function resolveCountryByIso2(iso2?: string) {
  const normalized = normalizeIso2(iso2);
  return (
    COUNTRY_OPTIONS.find((item) => item.iso2 === normalized) ??
    getDefaultCountry()
  );
}

export function splitInternationalPhone(
  value: string,
  fallbackIso2 = DEFAULT_COUNTRY_ISO2,
): SplitPhone {
  const fallbackCountry = resolveCountryByIso2(fallbackIso2);
  const raw = (value ?? "").trim();
  const digits = raw.replace(/\D/g, "");

  if (!digits) {
    return {
      countryIso2: fallbackCountry.iso2,
      localNumber: "",
      countryCode: fallbackCountry.dialCode,
    };
  }

  if (!raw.startsWith("+")) {
    return {
      countryIso2: fallbackCountry.iso2,
      localNumber: digits,
      countryCode: fallbackCountry.dialCode,
    };
  }

  const byDialCode = new Map<string, CountryOption>();
  for (const country of COUNTRY_OPTIONS) {
    const dialDigits = country.dialCode.replace("+", "");
    if (!byDialCode.has(dialDigits)) byDialCode.set(dialDigits, country);
  }

  const dialCodes = Array.from(byDialCode.keys()).sort(
    (a, b) => b.length - a.length,
  );
  const matched = dialCodes.find((dialCode) => digits.startsWith(dialCode));
  if (!matched) {
    return {
      countryIso2: fallbackCountry.iso2,
      localNumber: digits,
      countryCode: fallbackCountry.dialCode,
    };
  }

  const country = byDialCode.get(matched) ?? fallbackCountry;
  return {
    countryIso2: country.iso2,
    localNumber: digits.slice(matched.length),
    countryCode: country.dialCode,
  };
}

export function getCountryCodeFromIso2(iso2: string) {
  return resolveCountryByIso2(iso2).dialCode;
}

export function buildInternationalPhone(iso2: string, localNumber: string) {
  const digits = localNumber.replace(/\D/g, "");
  if (!digits) return "";
  return `${getCountryCodeFromIso2(iso2)}${digits}`;
}

type PhoneNumberInputProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  defaultCountryIso2?: string;
  placeholder?: string;
  className?: string;
};

export default function PhoneNumberInput({
  value,
  onChange,
  required,
  disabled,
  defaultCountryIso2 = DEFAULT_COUNTRY_ISO2,
  placeholder = "Phone number",
  className,
}: PhoneNumberInputProps) {
  const initial = useMemo(
    () => splitInternationalPhone(value, defaultCountryIso2),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryIso2, setCountryIso2] = useState(initial.countryIso2);
  const [localNumber, setLocalNumber] = useState(initial.localNumber);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedCountry = resolveCountryByIso2(countryIso2);

  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    if (!query) return COUNTRY_OPTIONS;

    return COUNTRY_OPTIONS.filter(
      (country) =>
        country.label.toLowerCase().includes(query) ||
        country.dialCode.includes(query) ||
        country.iso2.toLowerCase().includes(query),
    );
  }, [countrySearch]);

  useEffect(() => {
    const parsed = splitInternationalPhone(
      value,
      countryIso2 || defaultCountryIso2,
    );
    setCountryIso2(parsed.countryIso2);
    setLocalNumber(parsed.localNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, defaultCountryIso2]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setCountryMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div
      className={className ?? "grid grid-cols-[1fr_2fr] gap-2"}
      ref={containerRef}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            setCountryMenuOpen((current) => !current);
          }}
          disabled={disabled}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-[#1a1a2e] focus:ring-4 focus:ring-gray-100 transition-all bg-white flex items-center justify-between gap-2 disabled:cursor-not-allowed disabled:opacity-70"
          aria-haspopup="listbox"
          aria-expanded={countryMenuOpen}
        >
          <span className="flex min-w-0 items-center gap-2">
            <img
              src={`https://flagcdn.com/w20/${selectedCountry.iso2.toLowerCase()}.png`}
              alt={`${selectedCountry.label} flag`}
              className="h-4 w-5 rounded-sm object-cover"
              loading="lazy"
            />
            <span className="truncate">
              {selectedCountry.label} {selectedCountry.dialCode}
            </span>
          </span>
          <span className="text-gray-500">▾</span>
        </button>

        {countryMenuOpen && !disabled && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            <div className="sticky top-0 bg-white px-2 pb-1">
              <input
                value={countrySearch}
                onChange={(event) => setCountrySearch(event.target.value)}
                placeholder="Search country or code"
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-[#1a1a2e]"
              />
            </div>
            {filteredCountries.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-500">
                No country found.
              </p>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={`${country.iso2}-${country.dialCode}`}
                  type="button"
                  onClick={() => {
                    const nextIso2 = country.iso2;
                    setCountryIso2(nextIso2);
                    setCountrySearch("");
                    setCountryMenuOpen(false);
                    onChange(buildInternationalPhone(nextIso2, localNumber));
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${countryIso2 === country.iso2 ? "bg-gray-100" : ""}`}
                  role="option"
                  aria-selected={countryIso2 === country.iso2}
                >
                  <img
                    src={`https://flagcdn.com/w20/${country.iso2.toLowerCase()}.png`}
                    alt={`${country.label} flag`}
                    className="h-4 w-5 rounded-sm object-cover"
                    loading="lazy"
                  />
                  <span className="truncate">
                    {country.label} {country.dialCode}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-600">
          {selectedCountry.dialCode}
        </span>
        <input
          type="tel"
          value={localNumber}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            setLocalNumber(digits);
            onChange(buildInternationalPhone(countryIso2, digits));
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full border-2 border-gray-200 rounded-xl pl-16 pr-4 py-3 text-sm outline-none focus:border-[#1a1a2e] focus:ring-4 focus:ring-gray-100 transition-all disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>
    </div>
  );
}
