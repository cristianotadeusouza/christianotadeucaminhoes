export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type BaseRow = {
  id: string;
  user_id: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: BaseRow & {
          name: string;
          company_name: string | null;
          phone: string | null;
          email: string | null;
          source: string | null;
          status: string;
          truck_interest: string | null;
          notes: string | null;
          external_source: string | null;
          external_key: string | null;
          segment: string;
          portfolio_category: string;
          priority: string;
          temperature: string;
          person_type: string | null;
          document_masked: string | null;
          document_hash: string | null;
          last_contact_at: string | null;
          needs_requalification: boolean;
          metadata: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          company_name?: string | null;
          phone?: string | null;
          email?: string | null;
          source?: string | null;
          status?: string;
          truck_interest?: string | null;
          notes?: string | null;
          external_source?: string | null;
          external_key?: string | null;
          segment?: string;
          portfolio_category?: string;
          priority?: string;
          temperature?: string;
          person_type?: string | null;
          document_masked?: string | null;
          document_hash?: string | null;
          last_contact_at?: string | null;
          needs_requalification?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      inventory_items: {
        Row: BaseRow & {
          title: string;
          model: string | null;
          model_year: number | null;
          price: number | null;
          status: string;
          is_public: boolean;
          details: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          title: string;
          model?: string | null;
          model_year?: number | null;
          price?: number | null;
          status?: string;
          is_public?: boolean;
          details?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inventory_items"]["Insert"]>;
        Relationships: [];
      };
      follow_up_tasks: {
        Row: BaseRow & {
          customer_id: string | null;
          lead_id: string | null;
          title: string;
          due_at: string | null;
          status: string;
          priority: string;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          customer_id?: string | null;
          lead_id?: string | null;
          title: string;
          due_at?: string | null;
          status?: string;
          priority?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["follow_up_tasks"]["Insert"]>;
        Relationships: [];
      };
      contact_interactions: {
        Row: BaseRow & {
          customer_id: string | null;
          lead_id: string | null;
          channel: string;
          interaction_at: string;
          notes: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id?: string;
          customer_id?: string | null;
          lead_id?: string | null;
          channel?: string;
          interaction_at?: string;
          notes?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_interactions"]["Insert"]>;
        Relationships: [];
      };
      sales_proposals: {
        Row: BaseRow & {
          lead_id: string;
          inventory_item_id: string | null;
          title: string;
          model: string | null;
          amount: number | null;
          status: string;
          valid_until: string | null;
          conditions: string | null;
          notes: string | null;
          sent_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          lead_id: string;
          inventory_item_id?: string | null;
          title: string;
          model?: string | null;
          amount?: number | null;
          status?: string;
          valid_until?: string | null;
          conditions?: string | null;
          notes?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sales_proposals"]["Insert"]>;
        Relationships: [];
      };
      sales_documents: {
        Row: BaseRow & {
          lead_id: string | null;
          proposal_id: string | null;
          name: string;
          storage_path: string;
          mime_type: string | null;
          size_bytes: number;
          category: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          lead_id?: string | null;
          proposal_id?: string | null;
          name: string;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number;
          category?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sales_documents"]["Insert"]>;
        Relationships: [];
      };
      customers: {
        Row: BaseRow & {
          name: string;
          company_name: string | null;
          phone: string | null;
          email: string | null;
          city: string | null;
          state: string | null;
          status: string;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          company_name?: string | null;
          phone?: string | null;
          email?: string | null;
          city?: string | null;
          state?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };
      legacy_crm_events: {
        Row: BaseRow & {
          lead_id: string;
          external_source: string;
          external_id: string;
          event_type: string | null;
          status_original: string | null;
          origin_original: string | null;
          portfolio_category: string;
          loss_reason: string;
          included_at: string | null;
          concluded_at: string | null;
          last_contact_at: string | null;
          summary: string | null;
          next_action: string | null;
          history: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          lead_id: string;
          external_source: string;
          external_id: string;
          event_type?: string | null;
          status_original?: string | null;
          origin_original?: string | null;
          portfolio_category?: string;
          loss_reason?: string;
          included_at?: string | null;
          concluded_at?: string | null;
          last_contact_at?: string | null;
          summary?: string | null;
          next_action?: string | null;
          history?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["legacy_crm_events"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: { id: string; full_name: string | null; created_at: string; updated_at: string };
        Insert: { id: string; full_name?: string | null; created_at?: string; updated_at?: string };
        Update: {
          id?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
