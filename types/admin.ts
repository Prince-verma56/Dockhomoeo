export type StaffRole = "SUPER_ADMIN" | "ADMIN" | "STAFF";

/** The panel's areas, as in AREAS (backend/src/lib/permissions.ts). */
export type AdminArea =
  | "dashboard"
  | "orders"
  | "returns"
  | "payments"
  | "shipping"
  | "customers"
  | "b2b"
  | "catalog"
  | "discounts"
  | "doctors"
  | "consultations"
  | "payouts"
  | "content"
  | "reports"
  | "settings"
  | "staff";

/** Every admin list answers in this envelope (`paged`, backend/src/lib/http.ts). */
export interface AdminPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface SessionStaffUser {
  id: number;
  role: StaffRole;
  name: string;
  email: string;
  roleName?: string | null;
  permissions: string[];
}

export interface AdminDashboardData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    lowStockCount: number;
    pendingDoctorApprovals: number;
    totalCustomers: number;
  };
  recentOrders: {
    id: number;
    orderNumber: string;
    customerName: string;
    status: string;
    paymentMethod: string;
    grandTotal: number;
    placedAt: string;
  }[];
  attentionItems: {
    label: string;
    count: number;
    href: string;
    type: "warning" | "danger" | "info";
  }[];
}

export interface AdminProductItem {
  id: number;
  name: string;
  slug: string;
  form: string;
  sku?: string;
  brandName?: string | null;
  categoryName?: string | null;
  price: number;
  mrp: number;
  stock: number;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  imageUrl?: string | null;
}

export interface AdminOrderItem {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone?: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  grandTotal: number;
  placedAt: string;
  itemCount: number;
  channel: "D2C" | "B2B";
}

// Doctors, streams, reviews and prescriptions have their own file: types/api/admin-care.ts.

export interface AdminCategoryItem {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  isActive: boolean;
  imageUrl?: string | null;
}

export interface AdminBrandItem {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  productCount: number;
  isActive: boolean;
}
