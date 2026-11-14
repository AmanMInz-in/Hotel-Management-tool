export type Role = "ADMIN" | "WAITER" | "KITCHEN";

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "BILL_REQUESTED" | "CLEANING";

export type OrderStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export type OrderType = "DINE_IN" | "TAKEAWAY";

export type ItemStatus = "PENDING" | "PREPARING" | "READY_TO_SERVE" | "SERVED" | "VOIDED";

export type DiscountType = "NONE" | "FLAT" | "PERCENTAGE";

export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED";

export type PaymentMode = "CASH" | "UPI" | "CARD";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface SectionDTO {
  id: string;
  name: string;
  sortOrder: number;
  tables?: RestaurantTableDTO[];
}

export interface RestaurantTableDTO {
  id: string;
  tableNumber: string;
  sectionId: string;
  sectionName?: string;
  capacity: number;
  status: TableStatus;
  activeOrderId?: string | null;
  mergedIntoTableId?: string | null;
  activeOrder?: OrderDTO | null;
  posX: number;
  posY: number;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  items?: MenuItemDTO[];
}

export interface MenuItemDTO {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  categoryId: string;
  categoryName?: string;
  isAvailable: boolean;
  isVeg: boolean;
  taxRate: number;
  imageUrl?: string | null;
}

export interface OrderItemDTO {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItemName?: string;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
  roundNumber: number;
  isAddon: boolean;
  status: ItemStatus;
  voidReason?: string | null;
  voidedAt?: string | null;
  createdAt: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  tableId?: string | null;
  tableNumber?: string;
  waiterId: string;
  waiterName?: string;
  status: OrderStatus;
  orderType: OrderType;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  notes?: string | null;
  items: OrderItemDTO[];
  createdAt: string;
}

export interface BillDTO {
  id: string;
  billNumber: string;
  orderId: string;
  tableId?: string | null;
  tableNumber?: string;
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  discountReason?: string | null;
  cgstAmount: number;
  sgstAmount: number;
  serviceCharge: number;
  roundOff: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}
