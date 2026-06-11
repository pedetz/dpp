import { supabase } from "@/lib/supabase";

const PUBLIC_BUCKET = "public-assets";

export async function uploadPublicImage(prefix: string, file: File): Promise<string> {
  const path = `${prefix}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from(PUBLIC_BUCKET)
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
