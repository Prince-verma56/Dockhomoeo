export interface ApiUser {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string;
  roles: string[];
}

export interface ApiOrderSummary {
  id: number;
  orderNumber: string;
  status: string;
  grandTotal: number;
  placedAt: string | Date;
  itemCount: number;
}

export interface ApiAuthState {
  isAuthenticated: boolean;
  user: ApiUser | null;
}
