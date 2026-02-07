export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  company_id: string | null;
  can_create_users: boolean;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}
