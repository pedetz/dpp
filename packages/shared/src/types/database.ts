export type Plan = 'trial' | 'starter' | 'pro' | 'filiera'

export type Role = 'owner' | 'editor' | 'viewer'

export type ProductStatus = 'draft' | 'published' | 'archived'

export type TemplateFieldType =
  | 'composition'
  | 'country'
  | 'percent'
  | 'care_symbols'
  | 'textarea'
  | 'text'
  | 'number'
  | 'date'

export interface TemplateField {
  key: string
  label_it: string
  label_en: string
  type: TemplateFieldType
  required: boolean
  help?: string
}

export interface PublicPassport {
  slug: string
  gtin: string | null
  name: string
  category: string
  images: string[]
  data: Record<string, unknown>
  version: number
  published_at: string
  brand_name: string
  logo_url: string | null
}

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          vat_number: string | null
          logo_url: string | null
          plan: Plan
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          vat_number?: string | null
          logo_url?: string | null
          plan?: Plan
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          vat_number?: string | null
          logo_url?: string | null
          plan?: Plan
          created_at?: string
        }
      }
      org_members: {
        Row: {
          org_id: string
          user_id: string
          role: Role
        }
        Insert: {
          org_id: string
          user_id: string
          role?: Role
        }
        Update: {
          org_id?: string
          user_id?: string
          role?: Role
        }
      }
      category_templates: {
        Row: {
          id: string
          category: string
          version: number
          fields: TemplateField[]
        }
        Insert: {
          id?: string
          category: string
          version?: number
          fields: TemplateField[]
        }
        Update: {
          id?: string
          category?: string
          version?: number
          fields?: TemplateField[]
        }
      }
      products: {
        Row: {
          id: string
          org_id: string
          sku: string
          gtin: string | null
          name: string
          category: string
          slug: string
          status: ProductStatus
          data: Record<string, unknown>
          images: string[]
          current_version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          sku: string
          gtin?: string | null
          name: string
          category: string
          slug: string
          status?: ProductStatus
          data?: Record<string, unknown>
          images?: string[]
          current_version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          sku?: string
          gtin?: string | null
          name?: string
          category?: string
          slug?: string
          status?: ProductStatus
          data?: Record<string, unknown>
          images?: string[]
          current_version?: number
          created_at?: string
          updated_at?: string
        }
      }
      passport_versions: {
        Row: {
          product_id: string
          version: number
          data: Record<string, unknown>
          published_by: string | null
          published_at: string
        }
        Insert: {
          product_id: string
          version: number
          data: Record<string, unknown>
          published_by?: string | null
          published_at?: string
        }
        Update: {
          product_id?: string
          version?: number
          data?: Record<string, unknown>
          published_by?: string | null
          published_at?: string
        }
      }
      certifications: {
        Row: {
          id: string
          product_id: string
          kind: string
          file_path: string
          valid_until: string | null
        }
        Insert: {
          id?: string
          product_id: string
          kind: string
          file_path: string
          valid_until?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          kind?: string
          file_path?: string
          valid_until?: string | null
        }
      }
      subscriptions: {
        Row: {
          org_id: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          plan: Plan
          status: string
          current_period_end: string | null
        }
        Insert: {
          org_id: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          plan: Plan
          status: string
          current_period_end?: string | null
        }
        Update: {
          org_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          plan?: Plan
          status?: string
          current_period_end?: string | null
        }
      }
    }
    Views: {
      public_passports: {
        Row: PublicPassport
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
