import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Certification } from "@passaporto/shared";
import { supabase } from "@/lib/supabase";

const BUCKET = "certifications";

export function useCertifications(productId: string | undefined) {
  return useQuery({
    queryKey: ["certifications", productId],
    enabled: Boolean(productId),
    queryFn: async (): Promise<Certification[]> => {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("product_id", productId!);
      if (error) throw error;
      return data;
    },
  });
}

export interface UploadCertInput {
  productId: string;
  kind: string;
  validUntil: string | null;
  file: File;
}

export function useUploadCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, kind, validUntil, file }: UploadCertInput) => {
      const path = `${productId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { error } = await supabase.from("certifications").insert({
        product_id: productId,
        kind,
        file_path: path,
        valid_until: validUntil,
      });
      if (error) throw error;
    },
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({ queryKey: ["certifications", vars.productId] }),
  });
}

export function useDeleteCertification(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cert: Certification) => {
      await supabase.storage.from(BUCKET).remove([cert.file_path]);
      const { error } = await supabase.from("certifications").delete().eq("id", cert.id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["certifications", productId] }),
  });
}

export async function signedCertUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}
