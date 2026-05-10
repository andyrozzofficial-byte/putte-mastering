import { createSupabaseClient, type OrderInsert } from "@/lib/supabase";

export async function submitOrderToSupabase(row: OrderInsert): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("orders").insert(row);
  if (error) {
    throw new Error(error.message);
  }
}
