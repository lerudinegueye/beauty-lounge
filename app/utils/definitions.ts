import { RowDataPacket } from 'mysql2/promise';

export interface User {
    id: number;
    email: string;
    username: string;
    password?: string; // Password is optional because we don't always want to expose it
    is_verified?: boolean;
    is_admin?: boolean; // Added for admin role
}

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

export interface MenuRowData extends RowDataPacket {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
}

export interface VerificationToken {
    id: number;
    user_id: number;
    token: string;
    created_at: Date;
    expires_at: Date;
}

export interface BookingRow extends RowDataPacket {
  booking_time: string;
  service_duration: number;
}

export interface Service {
    id: number;
    name: string;
    description: string | null;
    price: number;
    duration: number;
    category?: string;
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';
export type PaymentConfirmationStatus = 'confirmed' | 'pending' | 'not_applicable' | null;

export interface Booking {
    id: number;
    menu_item_id: number;
    start_time: string;
    end_time: string;
    user_id: number | null;
    customer_first_name: string;
    customer_last_name: string;
    customer_email: string;
    customer_phone: string | null;
    created_at: string;
    status: BookingStatus;
    payment_confirmation: PaymentConfirmationStatus;
    payment_method: string | null;
    payment_status: string | null; // This seems to be legacy, but keeping for type safety
    notes: string | null;
    menu_items: MenuItem; // Included via Prisma's `include`
    users: { // Included via Prisma's `include`
      username: string;
      email: string;
    } | null;
}

export interface MenuCategory {
    id: number;
    name: string;
}

export interface MenuItem {
    id: number;
    name: string;
    description?: string;
    price: number;
    duration: number;
    category_id: number;
}

export interface MenuItemRow extends RowDataPacket {
    duration: number;
}
