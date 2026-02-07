export interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  company_id: string | null;
  password_reset_requested_at: string | null;
  last_password_change: string | null;
  can_create_users: boolean;
  is_super_admin?: boolean;
}

export interface Company {
  id: string;
  name: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  can_create_users?: boolean;
  company_id?: string; // Super admin pode especificar
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  can_create_users?: boolean;
  company_id?: string; // Super admin pode alterar
}
