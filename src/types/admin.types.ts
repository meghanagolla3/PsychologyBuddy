export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  school?: {
    id: string;
    name: string;
    address: string;
  };
  adminProfile?: {
    department?: string;
    lastActive?: string;
    status?: string;
  };
  createdAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  _count?: {
    students: number;
  };
}
