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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
          user_name?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ai_products"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_products: {
        Row: {
          badge: string
          banner_url: string | null
          border_color: string
          button_text: string
          category: string
          created_at: string
          display_order: number
          features: string[]
          gradient_from: string
          gradient_to: string
          icon_name: string
          id: string
          is_active: boolean
          is_coming_soon: boolean
          is_featured: boolean
          logo_url: string | null
          name: string
          original_price: number | null
          price: number
          screenshots: string[]
          slug: string
          subtitle: string
          updated_at: string
        }
        Insert: {
          badge?: string
          banner_url?: string | null
          border_color?: string
          button_text?: string
          category?: string
          created_at?: string
          display_order?: number
          features?: string[]
          gradient_from?: string
          gradient_to?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          is_coming_soon?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name: string
          original_price?: number | null
          price?: number
          screenshots?: string[]
          slug: string
          subtitle?: string
          updated_at?: string
        }
        Update: {
          badge?: string
          banner_url?: string | null
          border_color?: string
          button_text?: string
          category?: string
          created_at?: string
          display_order?: number
          features?: string[]
          gradient_from?: string
          gradient_to?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          is_coming_soon?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name?: string
          original_price?: number | null
          price?: number
          screenshots?: string[]
          slug?: string
          subtitle?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          banner_url: string | null
          created_at: string
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean
          message: string | null
          product_ids: string[]
          scope: string
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          message?: string | null
          product_ids?: string[]
          scope?: string
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          message?: string | null
          product_ids?: string[]
          scope?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_releases: {
        Row: {
          app_name: string
          created_at: string
          download_url: string
          file_size_mb: number | null
          icon_url: string | null
          id: string
          is_published: boolean
          platform: string
          release_notes: string | null
          updated_at: string
          user_id: string | null
          version_code: number | null
          version_name: string
        }
        Insert: {
          app_name: string
          created_at?: string
          download_url: string
          file_size_mb?: number | null
          icon_url?: string | null
          id?: string
          is_published?: boolean
          platform?: string
          release_notes?: string | null
          updated_at?: string
          user_id?: string | null
          version_code?: number | null
          version_name: string
        }
        Update: {
          app_name?: string
          created_at?: string
          download_url?: string
          file_size_mb?: number | null
          icon_url?: string | null
          id?: string
          is_published?: boolean
          platform?: string
          release_notes?: string | null
          updated_at?: string
          user_id?: string | null
          version_code?: number | null
          version_name?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          budget_range: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          project_type: string | null
        }
        Insert: {
          budget_range?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          project_type?: string | null
        }
        Update: {
          budget_range?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          project_type?: string | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          author: string | null
          category: string | null
          content_type: string
          created_at: string
          css_code: string | null
          css_intro: string | null
          description: string | null
          download_count: number
          file_url: string | null
          html_code: string | null
          html_intro: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          is_premium: boolean
          js_code: string | null
          js_intro: string | null
          live_site_features: string[] | null
          live_site_file_url: string | null
          live_site_note: string | null
          live_site_original_price: number
          live_site_price: number
          original_price: number
          premium_features: string[] | null
          premium_note: string | null
          price: number
          publish_sections: string[]
          rating: number
          software_compatibility: string[] | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
          whats_included: string[] | null
          youtube_url: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content_type?: string
          created_at?: string
          css_code?: string | null
          css_intro?: string | null
          description?: string | null
          download_count?: number
          file_url?: string | null
          html_code?: string | null
          html_intro?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_premium?: boolean
          js_code?: string | null
          js_intro?: string | null
          live_site_features?: string[] | null
          live_site_file_url?: string | null
          live_site_note?: string | null
          live_site_original_price?: number
          live_site_price?: number
          original_price?: number
          premium_features?: string[] | null
          premium_note?: string | null
          price?: number
          publish_sections?: string[]
          rating?: number
          software_compatibility?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
          whats_included?: string[] | null
          youtube_url?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content_type?: string
          created_at?: string
          css_code?: string | null
          css_intro?: string | null
          description?: string | null
          download_count?: number
          file_url?: string | null
          html_code?: string | null
          html_intro?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_premium?: boolean
          js_code?: string | null
          js_intro?: string | null
          live_site_features?: string[] | null
          live_site_file_url?: string | null
          live_site_note?: string | null
          live_site_original_price?: number
          live_site_price?: number
          original_price?: number
          premium_features?: string[] | null
          premium_note?: string | null
          price?: number
          publish_sections?: string[]
          rating?: number
          software_compatibility?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
          whats_included?: string[] | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          plan_id: string | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_id: string | null
          payment_status: string | null
          product_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          product_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          product_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_files: {
        Row: {
          created_at: string
          file_url: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_files_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          download_count: number | null
          file_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          price: number
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price: number
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_status: string
          product_name: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_status?: string
          product_name: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_status?: string
          product_name?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      supporters: {
        Row: {
          amount: number
          created_at: string | null
          email: string | null
          id: string
          is_monthly: boolean | null
          message: string | null
          name: string
          payment_status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          email?: string | null
          id?: string
          is_monthly?: boolean | null
          message?: string | null
          name: string
          payment_status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          email?: string | null
          id?: string
          is_monthly?: boolean | null
          message?: string | null
          name?: string
          payment_status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_materials: {
        Args: { p_section?: string }
        Returns: {
          author: string
          category: string
          content_type: string
          created_at: string
          description: string
          download_count: number
          file_url: string
          id: string
          image_url: string
          is_featured: boolean
          is_premium: boolean
          live_site_features: string[]
          live_site_file_url: string
          live_site_note: string
          live_site_original_price: number
          live_site_price: number
          original_price: number
          premium_features: string[]
          premium_note: string
          price: number
          publish_sections: string[]
          rating: number
          tags: string[]
          title: string
          whats_included: string[]
          youtube_url: string
        }[]
      }
      get_public_products: {
        Args: never
        Returns: {
          category: string
          created_at: string
          description: string
          download_count: number
          id: string
          image_url: string
          is_active: boolean
          price: number
          title: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
