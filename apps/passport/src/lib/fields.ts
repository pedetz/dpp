export type FieldType = 'composition' | 'country' | 'percent' | 'care_symbols' | 'textarea' | 'certifications'

export interface FieldRenderInfo {
  component: string
  fieldType: FieldType
}

export function getFieldRenderInfo(key: string, value: unknown): FieldRenderInfo | null {
  if (key === 'composition' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return { component: 'CompositionSection', fieldType: 'composition' }
  }

  if ((key === 'country_weaving' || key === 'country_manufacture') && typeof value === 'string') {
    return { component: 'CountrySection', fieldType: 'country' }
  }

  if (key === 'recycled_content' && typeof value === 'number') {
    return { component: 'PercentSection', fieldType: 'percent' }
  }

  if (key === 'care_instructions' && Array.isArray(value)) {
    return { component: 'CareSection', fieldType: 'care_symbols' }
  }

  if (key === 'certifications' && Array.isArray(value)) {
    return { component: 'CertificationsSection', fieldType: 'certifications' }
  }

  if (typeof value === 'string') {
    return { component: 'TextSection', fieldType: 'textarea' }
  }

  return null
}
