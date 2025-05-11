export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customer_payments: {
        Row: {
          id: string
          customer_id: string
          amount: number
          method: string
          payment_date: string
          reference: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          amount: number
          method: string
          payment_date: string
          reference?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          amount?: number
          method?: string
          payment_date?: string
          reference?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_payments_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_payments_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          name: string
          contact_name: string | null
          phone: string | null
          email: string | null
          customer_type: string
          credit_limit: number | null
          vat_number: string | null
          address: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          contact_name?: string | null
          phone?: string | null
          email?: string | null
          customer_type: string
          credit_limit?: number | null
          vat_number?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          contact_name?: string | null
          phone?: string | null
          email?: string | null
          customer_type?: string
          credit_limit?: number | null
          vat_number?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          id: string
          item_id: string
          warehouse_id: string
          quantity: number
          type: string
          related_doc: string | null
          remarks: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          warehouse_id: string
          quantity: number
          type: string
          related_doc?: string | null
          remarks?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          warehouse_id?: string
          quantity?: number
          type?: string
          related_doc?: string | null
          remarks?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      item_categories: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          id: string
          name: string
          code: string
          barcode: string | null
          category_id: string
          unit_id: string
          base_unit_qty: number
          price_wholesale: number
          price_retail: number
          vat_percent: number
          is_active: boolean
          image_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code: string
          barcode?: string | null
          category_id: string
          unit_id: string
          base_unit_qty: number
          price_wholesale: number
          price_retail: number
          vat_percent: number
          is_active?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string
          barcode?: string | null
          category_id?: string
          unit_id?: string
          base_unit_qty?: number
          price_wholesale?: number
          price_retail?: number
          vat_percent?: number
          is_active?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "item_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_unit_id_fkey"
            columns: ["unit_id"]
            referencedRelation: "units"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_order_items: {
        Row: {
          id: string
          purchase_order_id: string
          item_id: string
          quantity: number
          unit_price: number
          vat_percent: number
          line_total: number
          line_vat: number
          warehouse_id: string
        }
        Insert: {
          id?: string
          purchase_order_id: string
          item_id: string
          quantity: number
          unit_price: number
          vat_percent: number
          line_total: number
          line_vat: number
          warehouse_id: string
        }
        Update: {
          id?: string
          purchase_order_id?: string
          item_id?: string
          quantity?: number
          unit_price?: number
          vat_percent?: number
          line_total?: number
          line_vat?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_orders: {
        Row: {
          id: string
          supplier_id: string
          order_date: string
          delivery_date: string | null
          status: string
          total_amount: number
          total_vat: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          order_date: string
          delivery_date?: string | null
          status: string
          total_amount: number
          total_vat: number
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          order_date?: string
          delivery_date?: string | null
          status?: string
          total_amount?: number
          total_vat?: number
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sales_order_items: {
        Row: {
          id: string
          sales_order_id: string
          item_id: string
          quantity: number
          unit_price: number
          vat_percent: number
          line_total: number
          line_vat: number
          warehouse_id: string | null
        }
        Insert: {
          id?: string
          sales_order_id: string
          item_id: string
          quantity: number
          unit_price: number
          vat_percent: number
          line_total: number
          line_vat: number
          warehouse_id?: string | null
        }
        Update: {
          id?: string
          sales_order_id?: string
          item_id?: string
          quantity?: number
          unit_price?: number
          vat_percent?: number
          line_total?: number
          line_vat?: number
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_items_sales_order_id_fkey"
            columns: ["sales_order_id"]
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          }
        ]
      }
      sales_orders: {
        Row: {
          id: string
          customer_id: string
          warehouse_id: string
          status: string
          total_amount: number
          total_vat: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          warehouse_id: string
          status: string
          total_amount: number
          total_vat: number
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          warehouse_id?: string
          status?: string
          total_amount?: number
          total_vat?: number
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      supplier_payments: {
        Row: {
          id: string
          supplier_id: string
          amount: number
          method: string
          payment_date: string
          reference: string | null
        }
        Insert: {
          id?: string
          supplier_id: string
          amount: number
          method: string
          payment_date: string
          reference?: string | null
        }
        Update: {
          id?: string
          supplier_id?: string
          amount?: number
          method?: string
          payment_date?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_name: string | null
          phone: string | null
          email: string | null
          vat_number: string | null
          address: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          contact_name?: string | null
          phone?: string | null
          email?: string | null
          vat_number?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          contact_name?: string | null
          phone?: string | null
          email?: string | null
          vat_number?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      units: {
        Row: {
          id: string
          name: string
          conversion_to_base: number
        }
        Insert: {
          id?: string
          name: string
          conversion_to_base: number
        }
        Update: {
          id?: string
          name?: string
          conversion_to_base?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          assigned_warehouse_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role: string
          assigned_warehouse_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          assigned_warehouse_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_assigned_warehouse_id_fkey"
            columns: ["assigned_warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          }
        ]
      }
      warehouses: {
        Row: {
          id: string
          name: string
          location: string | null
          manager_id: string | null
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          manager_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          manager_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_manager_id_fkey"
            columns: ["manager_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      current_stock_by_item_and_warehouse: {
        Row: {
          item_id: string | null
          warehouse_id: string | null
          current_stock: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          }
        ]
      }
      outstanding_customer_balances: {
        Row: {
          customer_id: string | null
          customer_name: string | null
          total_sales: number | null
          total_payments: number | null
          balance: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      top_selling_items_by_month: {
        Row: {
          month: string | null
          item_id: string | null
          item_name: string | null
          total_quantity: number | null
          total_amount: number | null
        }
        Relationships: [
          {
            foreignKeyName: "items_id_fkey"
            columns: ["item_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      calculate_stock: {
        Args: {
          p_item_id: string
          p_warehouse_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}