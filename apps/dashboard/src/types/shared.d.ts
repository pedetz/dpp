declare module "@passaporto/shared" {
  export type Plan = "trial" | "starter" | "pro" | "filiera";
  export type ProductStatus = "draft" | "published" | "archived";
  export type MemberRole = "owner" | "editor" | "viewer";
  export type Role = MemberRole;
  export type SubscriptionStatus =
    | "active"
    | "trialing"
    | "past_due"
    | "canceled"
    | "incomplete";

  export type FieldType =
    | "composition"
    | "country"
    | "percent"
    | "care_symbols"
    | "textarea";

  export interface TemplateField {
    key: string;
    label_it: string;
    type: FieldType;
    required: boolean;
  }

  export interface Organization {
    id: string;
    name: string;
    vat_number: string | null;
    logo_url: string | null;
    plan: Plan;
    created_at: string;
  }

  export interface OrgMember {
    org_id: string;
    user_id: string;
    role: MemberRole;
  }

  export interface FiberEntry {
    fiber: string;
    percent: number;
  }

  export type ProductData = Record<string, unknown>;

  export interface Product {
    id: string;
    org_id: string;
    sku: string | null;
    gtin: string | null;
    name: string;
    category: string;
    slug: string;
    status: ProductStatus;
    data: ProductData;
    images: string[];
    current_version: number;
    created_at: string;
    updated_at: string;
  }

  export interface PassportVersion {
    product_id: string;
    version: number;
    data: ProductData;
    published_by: string;
    published_at: string;
  }

  export interface Certification {
    id: string;
    product_id: string;
    kind: string;
    file_path: string;
    valid_until: string | null;
  }

  export interface Subscription {
    org_id: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    plan: Plan;
    status: SubscriptionStatus;
    current_period_end: string | null;
  }

  export interface PublicPassport {
    slug: string;
    gtin: string | null;
    name: string;
    category: string;
    images: string[];
    data: ProductData;
    version: number;
    published_at: string;
    brand_name: string;
    logo_url: string | null;
  }

  export interface PlanLimits {
    plan: Plan;
    maxProducts: number;
    csvImport: boolean;
    bulkExport: boolean;
    api: boolean;
    multiBrand: boolean;
  }
}
