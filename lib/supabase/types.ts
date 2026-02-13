export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          show_on_homepage: boolean
          homepage_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          show_on_homepage?: boolean
          homepage_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          show_on_homepage?: boolean
          homepage_order?: number | null
          created_at?: string
        }
      }
      signs: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          quantity_available: number
          images: string[]
          sizes: string | null
          archived_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price: number
          quantity_available?: number
          images?: string[]
          sizes?: string | null
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          quantity_available?: number
          images?: string[]
          sizes?: string | null
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sign_tags: {
        Row: {
          sign_id: string
          tag_id: string
          display_order: number
        }
        Insert: {
          sign_id: string
          tag_id: string
          display_order?: number
        }
        Update: {
          sign_id?: string
          tag_id?: string
          display_order?: number
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          sign_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sign_id: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sign_id?: string
          quantity?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          stripe_session_id: string
          status: 'pending' | 'completed' | 'refunded'
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          stripe_session_id: string
          status?: 'pending' | 'completed' | 'refunded'
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          stripe_session_id?: string
          status?: 'pending' | 'completed' | 'refunded'
          total?: number
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          sign_id: string | null
          quantity: number
          price_at_purchase: number
        }
        Insert: {
          id?: string
          order_id: string
          sign_id?: string | null
          quantity: number
          price_at_purchase: number
        }
        Update: {
          id?: string
          order_id?: string
          sign_id?: string | null
          quantity?: number
          price_at_purchase?: number
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          message?: string
          created_at?: string
        }
      }
    }
  }
}
