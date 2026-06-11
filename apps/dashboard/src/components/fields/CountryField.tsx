import { Select } from "@/components/ui/Select";
import { countries } from "@/lib/countries";
import { t } from "@/i18n";

interface CountryFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function CountryField({ value, onChange }: CountryFieldProps) {
  return (
    <Select
      value={value}
      placeholder={t("fields.selectCountry")}
      onChange={(e) => onChange(e.target.value)}
      options={countries.map((c) => ({ value: c.code, label: c.name_it }))}
    />
  );
}
