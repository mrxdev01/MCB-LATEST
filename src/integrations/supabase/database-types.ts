// Hand-written type shim (personal Supabase project, not Lovable Cloud).
// Regenerate later with:
//   npx supabase gen types typescript --project-id <ref> --schema public > src/integrations/supabase/database-types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "admin" | "customer";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string | null; full_name: string | null; created_at: string; updated_at?: string };
        Insert: { id: string; email?: string | null; full_name?: string | null };
        Update: { email?: string | null; full_name?: string | null };
        Relationships: [];
      };
      user_roles: {
        Row: { id: string; user_id: string; role: AppRole; created_at: string };
        Insert: { user_id: string; role: AppRole };
        Update: { role?: AppRole };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          hero_image: string | null;
          seo_title: string | null;
          seo_description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & { slug: string; name: string };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          image_url: string | null;
          is_featured: boolean;
          sort_order: number;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["collections"]["Row"]> & { slug: string; name: string };
        Update: Partial<Database["public"]["Tables"]["collections"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          title: string;
          short_description: string | null;
          description: string | null;
          price: number;
          mrp: number | null;
          sku: string;
          stock_status: string;
          category_id: string | null;
          sizes: Json;
          tags: string[];
          seo_title: string | null;
          seo_description: string | null;
          is_featured: boolean;
          is_bestseller: boolean;
          is_new_arrival: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          slug: string;
          title: string;
          sku: string;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: { product_id: string; url: string; alt?: string | null; sort_order?: number };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_collections: {
        Row: { product_id: string; collection_id: string; sort_order: number; created_at: string };
        Insert: { product_id: string; collection_id: string; sort_order?: number };
        Update: { sort_order?: number };
        Relationships: [
          {
            foreignKeyName: "product_collections_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_collections_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
        ];
      };
      announcements: {
        Row: {
          id: string;
          message: string;
          bg_color: string;
          text_color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["announcements"]["Row"]> & { message: string };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Row"]>;
        Relationships: [];
      };
      product_reviews: {
        Row: {
          id: string;
          product_id: string;
          reviewer_name: string;
          reviewer_email: string | null;
          rating: number;
          title: string | null;
          comment: string | null;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          product_id: string;
          reviewer_name: string;
          reviewer_email?: string | null;
          rating: number;
          title?: string | null;
          comment?: string | null;
          approved?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["product_reviews"]["Row"]>;
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content: string;
          cover_image: string | null;
          author: string | null;
          tags: string[] | null;
          seo_title: string | null;
          seo_description: string | null;
          published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["blog_posts"]["Row"]> & { slug: string; title: string; content: string };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      has_role: { Args: { _user_id: string; _role: AppRole }; Returns: boolean };
    };
    Enums: { app_role: AppRole };
    CompositeTypes: Record<string, never>;
  };
};
