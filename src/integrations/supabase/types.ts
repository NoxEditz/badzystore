export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      orders: {
        Row: {
          city: string
          created_at: string
          customer_name: string
          email: string
          governorate: string
          id: string
          items: Json
          landmark: string | null
          order_number: string
          order_status: string
          payment_method: string
          payment_reference: string | null
          payment_status: string
          phone: string
          shipping_egp: number
          street: string
          subtotal_egp: number
          total_egp: number
        }
        Insert: {
          city: string
          created_at?: string
          customer_name: string
          email: string
          governorate: string
          id: string
          items: Json
          landmark?: string | null
          order_number: string
          order_status?: string
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          phone: string
          shipping_egp: number
          street: string
          subtotal_egp: number
          total_egp: number
        }
        Update: {
          city?: string
          created_at?: string
          customer_name?: string
          email?: string
          governorate?: string
          id?: string
          items?: Json
          landmark?: string | null
          order_number?: string
          order_status?: string
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          phone?: string
          shipping_egp?: number
          street?: string
          subtotal_egp?: number
          total_egp?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: string | null
          badge_color: string | null
          badge_style: string | null
          badge_text_color: string | null
          category: string
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          image: string
          images: string[] | null
          name: string
          name_ar: string | null
          old_price_egp: number | null
          price_egp: number
          rating: number | null
          reviews_count: number | null
          sku: string | null
          slug: string
          specs: Json | null
          stock: number
          tags: string[] | null
        }
        Insert: {
          badge?: string | null
          badge_color?: string | null
          badge_style?: string | null
          badge_text_color?: string | null
          category: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id: string
          image: string
          images?: string[] | null
          name: string
          name_ar?: string | null
          old_price_egp?: number | null
          price_egp: number
          rating?: number | null
          reviews_count?: number | null
          sku?: string | null
          slug: string
          specs?: Json | null
          stock?: number
          tags?: string[] | null
        }
        Update: {
          badge?: string | null
          badge_color?: string | null
          badge_style?: string | null
          badge_text_color?: string | null
          category?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image?: string
          images?: string[] | null
          name?: string
          name_ar?: string | null
          old_price_egp?: number | null
          price_egp?: number
          rating?: number | null
          reviews_count?: number | null
          sku?: string | null
          slug?: string
          specs?: Json | null
          stock?: number
          tags?: string[] | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
