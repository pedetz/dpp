import type {
  Organization,
  OrgMember,
  Product,
  PassportVersion,
  Certification,
  Subscription,
  PublicPassport,
  TemplateField,
} from "@passaporto/shared";

type Indexed<T> = { [K in keyof T]: T[K] };

interface Table<Row, Insert, Update> {
  Row: Indexed<Row>;
  Insert: Indexed<Insert>;
  Update: Indexed<Update>;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      organizations: Table<
        Organization,
        Omit<Organization, "id" | "created_at"> & { id?: string },
        Partial<Organization>
      >;
      org_members: Table<OrgMember, OrgMember, Partial<OrgMember>>;
      products: Table<
        Product,
        Omit<Product, "id" | "created_at" | "updated_at" | "current_version"> & {
          id?: string;
        },
        Partial<Product>
      >;
      passport_versions: Table<
        PassportVersion,
        PassportVersion,
        Partial<PassportVersion>
      >;
      certifications: Table<
        Certification,
        Omit<Certification, "id"> & { id?: string },
        Partial<Certification>
      >;
      subscriptions: Table<Subscription, Subscription, Partial<Subscription>>;
      category_templates: Table<
        { id: string; category: string; version: number; fields: TemplateField[] },
        { id?: string; category: string; version?: number; fields: TemplateField[] },
        Partial<{ category: string; version: number; fields: TemplateField[] }>
      >;
    };
    Views: {
      public_passports: { Row: Indexed<PublicPassport>; Relationships: [] };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
