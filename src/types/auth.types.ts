export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'clerk';
  assigned_warehouse_id: string | null;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'clerk';
  assigned_warehouse_id?: string | null;
}