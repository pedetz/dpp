import { Select } from '@/components/ui/Select'
import { countries } from '@/lib/countries'

interface CountryFieldProps {
  label?: string
  value: string
  onChange: (v: string) => void
  error?: string
}

const options = countries.map((c) => ({ value: c.code, label: c.name_it }))

export function CountryField({ label, value, onChange, error }: CountryFieldProps) {
  return (
    <Select
      label={label}
      options={options}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      placeholder="Seleziona paese"
    />
  )
}
