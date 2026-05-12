/**
 * Supabase `public` schema typings used by this app.
 *
 * Regenerate from your project (recommended when schema changes):
 *   npx supabase gen types typescript --project-id <ref> --schema public > lib/supabase/database.types.ts
 *
 * Until then, keep this file aligned with `supabase/migrations/*.sql`.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          created_at: string;
          customer_email: string | null;
          customer_name: string | null;
          track_name: string | null;
          service: string | null;
          status: string | null;
          notes: string | null;
          uploaded_file: string | null;
          mastered_file: string | null;
          price: number | string | null;
          delivery_access_token: string | null;
          delivery_completed_at: string | null;
          delivery_download_count: number;
          delivery_last_downloaded_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          customer_email?: string | null;
          customer_name?: string | null;
          track_name?: string | null;
          service?: string | null;
          status?: string | null;
          notes?: string | null;
          uploaded_file?: string | null;
          mastered_file?: string | null;
          price?: number | string | null;
          delivery_access_token?: string | null;
          delivery_completed_at?: string | null;
          delivery_download_count?: number;
          delivery_last_downloaded_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          customer_email?: string | null;
          customer_name?: string | null;
          track_name?: string | null;
          service?: string | null;
          status?: string | null;
          notes?: string | null;
          uploaded_file?: string | null;
          mastered_file?: string | null;
          price?: number | string | null;
          delivery_access_token?: string | null;
          delivery_completed_at?: string | null;
          delivery_download_count?: number;
          delivery_last_downloaded_at?: string | null;
        };
        Relationships: [];
      };
      order_master_versions: {
        Row: {
          id: string;
          order_id: string;
          storage_ref: string;
          version: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          storage_ref: string;
          version: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          storage_ref?: string;
          version?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_master_versions_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      order_revision_requests: {
        Row: {
          id: string;
          order_id: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          message?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_revision_requests_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_order_delivery_download: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type OrdersTableRow = Database["public"]["Tables"]["orders"]["Row"];
