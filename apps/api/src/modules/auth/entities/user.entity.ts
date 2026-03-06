export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  password_hash: string;
  role_id: string;
  is_active: boolean;
}
