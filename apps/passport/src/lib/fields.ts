export type FieldType = 'composition' | 'country' | 'percent' | 'care_symbols' | 'textarea' | 'text' | 'number' | 'date'

export interface FieldRenderInfo {
  component: string
  type: FieldType
}

export function getFieldRenderInfo(type: FieldType): FieldRenderInfo {
  const map: Record<FieldType, string> = {
    composition: 'CompositionSection',
    country: 'CountrySection',
    percent: 'PercentSection',
    care_symbols: 'CareSection',
    textarea: 'TextSection',
    text: 'TextSection',
    number: 'PercentSection',
    date: 'TextSection',
  }
  return { component: map[type], type }
}

export const FIELD_KEYS = [
  'composition',
  'country_weaving',
  'country_manufacture',
  'recycled_content',
  'care_instructions',
  'end_of_life',
  'svhc_substances',
  'durability',
  'certifications',
] as const

export type FieldKey = typeof FIELD_KEYS[number]
