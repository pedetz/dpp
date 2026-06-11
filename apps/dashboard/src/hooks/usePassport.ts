import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PassportVersion, Product, ProductData } from "@passaporto/shared";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useVersions(productId: string | undefined) {
  return useQuery({
    queryKey: ["versions", productId],
    enabled: Boolean(productId),
    queryFn: async (): Promise<PassportVersion[]> => {
      const { data, error } = await supabase
        .from("passport_versions")
        .select("*")
        .eq("product_id", productId!)
        .order("version", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export interface PublishInput {
  product: Product;
  changelog: string;
}

export function usePublish(orgId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ product }: PublishInput) => {
      const nextVersion = product.current_version + 1;
      const snapshot: ProductData = {
        ...product.data,
        name: product.name,
        gtin: product.gtin,
        category: product.category,
        images: product.images,
      };
      const { error: versionError } = await supabase.from("passport_versions").insert({
        product_id: product.id,
        version: nextVersion,
        data: snapshot,
        published_by: user!.id,
        published_at: new Date().toISOString(),
      });
      if (versionError) throw versionError;
      const { error } = await supabase
        .from("products")
        .update({
          status: "published",
          current_version: nextVersion,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["products", orgId] });
      queryClient.invalidateQueries({ queryKey: ["product", vars.product.id] });
      queryClient.invalidateQueries({ queryKey: ["versions", vars.product.id] });
    },
  });
}
