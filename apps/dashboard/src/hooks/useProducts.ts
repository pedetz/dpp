import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product, ProductData, ProductStatus } from "@passaporto/shared";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

export interface NewProductInput {
  name: string;
  sku: string | null;
  gtin: string | null;
  category: string;
  data: ProductData;
  images: string[];
}

export function useProducts(orgId: string | null) {
  return useQuery({
    queryKey: ["products", orgId],
    enabled: Boolean(orgId),
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("org_id", orgId!)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    enabled: Boolean(id),
    queryFn: async (): Promise<Product> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateProduct(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewProductInput): Promise<Product> => {
      const slug = `${slugify(input.name)}-${Date.now().toString(36)}`;
      const { data, error } = await supabase
        .from("products")
        .insert({
          org_id: orgId!,
          name: input.name,
          sku: input.sku,
          gtin: input.gtin,
          category: input.category,
          slug,
          status: "draft",
          data: input.data,
          images: input.images,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products", orgId] }),
  });
}

export function useUpdateProduct(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Product> }) => {
      const { error } = await supabase
        .from("products")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["products", orgId] });
      queryClient.invalidateQueries({ queryKey: ["product", vars.id] });
    },
  });
}

export function useDeleteProduct(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products", orgId] }),
  });
}

export function useSetProductStatus(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProductStatus }) => {
      const { error } = await supabase
        .from("products")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["products", orgId] });
      queryClient.invalidateQueries({ queryKey: ["product", vars.id] });
    },
  });
}

export function useBulkCreateProducts(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputs: NewProductInput[]) => {
      const rows = inputs.map((input) => ({
        org_id: orgId!,
        name: input.name,
        sku: input.sku,
        gtin: input.gtin,
        category: input.category,
        slug: `${slugify(input.name)}-${Math.random().toString(36).slice(2, 8)}`,
        status: "draft" as ProductStatus,
        data: input.data,
        images: input.images,
      }));
      const { error } = await supabase.from("products").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products", orgId] }),
  });
}
