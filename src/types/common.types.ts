// Models
export interface Item {
  id: string;
  name: string;
  code: string;
  barcode: string | null;
  category_id: string;
  category?: ItemCategory;
  unit_id: string;
  unit?: Unit;
  base_unit_qty: number;
  price_wholesale: number;
  price_retail: number;
  vat_percent: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string | null;
  current_stock?: number;
}

export interface ItemCategory {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
  conversion_to_base: number;
}

export interface Customer {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  customer_type: 'retail' | 'distributor';
  credit_limit: number | null;
  vat_number: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  vat_number: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string | null;
  manager_id: string | null;
  manager?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'clerk';
  assigned_warehouse_id: string | null;
  warehouse?: Warehouse;
  created_at: string;
}

export interface SalesOrder {
  id: string;
  customer_id: string;
  customer?: Customer;
  warehouse_id: string;
  warehouse?: Warehouse;
  status: 'draft' | 'confirmed' | 'delivered';
  total_amount: number;
  total_vat: number;
  created_by: string;
  creator?: User;
  created_at: string;
  items?: SalesOrderItem[];
}

export interface SalesOrderItem {
  id: string;
  sales_order_id: string;
  item_id: string;
  item?: Item;
  quantity: number;
  unit_price: number;
  vat_percent: number;
  line_total: number;
  line_vat: number;
  warehouse_id: string | null;
  warehouse?: Warehouse;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  supplier?: Supplier;
  order_date: string;
  delivery_date: string | null;
  status: 'draft' | 'received' | 'invoiced';
  total_amount: number;
  total_vat: number;
  created_by: string;
  creator?: User;
  created_at: string;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  item_id: string;
  item?: Item;
  quantity: number;
  unit_price: number;
  vat_percent: number;
  line_total: number;
  line_vat: number;
  warehouse_id: string;
  warehouse?: Warehouse;
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  item?: Item;
  warehouse_id: string;
  warehouse?: Warehouse;
  quantity: number;
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer_in' | 'transfer_out';
  related_doc: string | null;
  remarks: string | null;
  created_by: string;
  creator?: User;
  created_at: string;
}

export interface CustomerPayment {
  id: string;
  customer_id: string;
  customer?: Customer;
  amount: number;
  method: 'cash' | 'bank' | 'credit_card' | 'check';
  payment_date: string;
  reference: string | null;
  created_by: string;
  creator?: User;
  created_at: string;
}

export interface SupplierPayment {
  id: string;
  supplier_id: string;
  supplier?: Supplier;
  amount: number;
  method: 'cash' | 'bank' | 'credit_card' | 'check';
  payment_date: string;
  reference: string | null;
}

// Dashboard types
export interface StockAlert {
  item_id: string;
  item_name: string;
  warehouse_id: string;
  warehouse_name: string;
  current_stock: number;
  min_stock: number;
}

export interface SalesPerformance {
  date: string;
  amount: number;
}

export interface TopSellingItem {
  item_id: string;
  item_name: string;
  total_quantity: number;
  total_amount: number;
}

export interface CustomerBalance {
  customer_id: string;
  customer_name: string;
  total_sales: number;
  total_payments: number;
  balance: number;
}

// Common types for filtering, pagination, etc.
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  field: string;
  value: string | number | boolean | null;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
}

export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Notification types
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  autoClose?: boolean;
  duration?: number;
}