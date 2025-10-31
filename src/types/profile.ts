export interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  updatedAt: string | null;
  roleId: string | null; // UUID of the role
  role?: { // Nested role object for easier access
    id: string;
    name: string;
    description: string | null;
  } | null;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
}