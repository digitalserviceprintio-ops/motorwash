import { supabase } from "@/integrations/supabase/client";

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getBusinessSettings = async (userId: string) => {
  const { data, error } = await (supabase as any)
    .from("business_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const ensureBusinessSettings = async (userId: string) => {
  const existing = await getBusinessSettings(userId);
  if (existing) return existing;
  const { data, error } = await (supabase as any)
    .from("business_settings")
    .insert({ user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
};
