import { useQuery, useMutation } from "@tanstack/react-query";
import type { Plan, Subscription } from "@passaporto/shared";
import { supabase } from "@/lib/supabase";

const functionsUrl = import.meta.env.VITE_EDGE_FUNCTIONS_URL;

export function useSubscription(orgId: string | null) {
  return useQuery({
    queryKey: ["subscription", orgId],
    enabled: Boolean(orgId),
    queryFn: async (): Promise<Subscription | null> => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("org_id", orgId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useCheckout(orgId: string | null) {
  return useMutation({
    mutationFn: async (plan: Plan): Promise<string> => {
      const headers = await authHeader();
      const response = await fetch(`${functionsUrl}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ orgId, plan }),
      });
      if (!response.ok) throw new Error("Checkout failed");
      const json = (await response.json()) as { url: string };
      return json.url;
    },
  });
}

export function useCustomerPortal(orgId: string | null) {
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const headers = await authHeader();
      const response = await fetch(`${functionsUrl}/create-portal-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ orgId }),
      });
      if (!response.ok) throw new Error("Portal failed");
      const json = (await response.json()) as { url: string };
      return json.url;
    },
  });
}
