
export type UserRole = 'client' | 'house_owner' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_approved: boolean;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  type: 'House' | 'Apartment' | 'Guesthouse';
  status: 'Pending' | 'Published' | 'Rejected';
  address: string;
  city: string;
  governorate: string;
  main_image_url: string | null;
  created_at: string;
}
