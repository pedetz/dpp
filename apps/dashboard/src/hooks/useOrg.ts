import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Organization, OrgMember, Role } from "@passaporto/shared";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const ACTIVE_ORG_KEY = "passaporto.activeOrg";

interface OrgMemberWithOrg extends OrgMember {
  organizations: Organization;
}

export function useMyOrgs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["orgs", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<Organization[]> => {
      const { data, error } = await supabase
        .from("org_members")
        .select("org_id, user_id, role, organizations(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data as unknown as OrgMemberWithOrg[]).map((row) => row.organizations);
    },
  });
}

export function useActiveOrgId(orgs: Organization[] | undefined): string | null {
  const stored = localStorage.getItem(ACTIVE_ORG_KEY);
  if (!orgs || orgs.length === 0) return null;
  if (stored && orgs.some((o) => o.id === stored)) return stored;
  return orgs[0].id;
}

export function useOrg() {
  const queryClient = useQueryClient();
  const orgsQuery = useMyOrgs();
  const orgs = orgsQuery.data;
  const activeId = useActiveOrgId(orgs);
  const org = orgs?.find((o) => o.id === activeId) ?? null;

  const switchOrg = useCallback(
    (id: string) => {
      localStorage.setItem(ACTIVE_ORG_KEY, id);
      queryClient.invalidateQueries();
    },
    [queryClient],
  );

  return {
    org,
    orgs: orgs ?? [],
    orgId: activeId,
    loading: orgsQuery.isLoading,
    switchOrg,
  };
}

export function useOrgMembers(orgId: string | null) {
  return useQuery({
    queryKey: ["members", orgId],
    enabled: Boolean(orgId),
    queryFn: async (): Promise<OrgMember[]> => {
      const { data, error } = await supabase
        .from("org_members")
        .select("*")
        .eq("org_id", orgId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateMemberRole(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      const { error } = await supabase
        .from("org_members")
        .update({ role })
        .eq("org_id", orgId!)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members", orgId] }),
  });
}

export function useRemoveMember(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("org_members")
        .delete()
        .eq("org_id", orgId!)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members", orgId] }),
  });
}

export function useUpdateOrg(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Organization>) => {
      const { error } = await supabase
        .from("organizations")
        .update(patch)
        .eq("id", orgId!);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orgs"] }),
  });
}

export function useCreateOrg() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, vatNumber }: { name: string; vatNumber: string }) => {
      const { data, error } = await supabase
        .from("organizations")
        .insert({ name, vat_number: vatNumber || null, logo_url: null, plan: "trial" })
        .select()
        .single();
      if (error) throw error;
      const org = data as Organization;
      const { error: memberError } = await supabase
        .from("org_members")
        .upsert({ org_id: org.id, user_id: user!.id, role: "owner" });
      if (memberError) throw memberError;
      localStorage.setItem(ACTIVE_ORG_KEY, org.id);
      return org;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orgs"] }),
  });
}
