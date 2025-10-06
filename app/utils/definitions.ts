export interface CryolipolisiCard {
  id: number;
  title: string;
  description: string;
  price: number;
}

export interface MenuCard {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export type User = {
    id: number;
    username: string;
    email: string;
    password: string;
    is_verified: boolean;
    created_at: Date;
};

export type VerificationToken = {
    id: number;
    user_id: number;
    token: string;
    created_at: Date;
    expires_at: Date;
};