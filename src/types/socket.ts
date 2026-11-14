import { TableStatus, ItemStatus, OrderItemDTO } from "./index";

export interface ServerToClientEvents {
  "table:status_changed": (data: {
    tableId: string;
    tableNumber: string;
    status: TableStatus;
    activeOrderId?: string | null;
    updatedBy?: string;
  }) => void;

  "table:transferred": (data: {
    fromTableId: string;
    toTableId: string;
    fromTableNumber: string;
    toTableNumber: string;
    orderId: string;
  }) => void;

  "table:merged": (data: {
    sourceTableId: string;
    targetTableId: string;
    targetTableNumber: string;
  }) => void;

  "order:created": (data: {
    orderId: string;
    orderNumber: string;
    tableNumber: string;
    tableId: string;
    items: OrderItemDTO[];
    roundNumber: number;
    createdAt: string;
  }) => void;

  "order:addon_added": (data: {
    orderId: string;
    orderNumber: string;
    tableNumber: string;
    tableId: string;
    items: OrderItemDTO[];
    roundNumber: number;
    isAddon: boolean;
  }) => void;

  "order:item_status_updated": (data: {
    orderId: string;
    itemId: string;
    tableNumber: string;
    status: ItemStatus;
    itemName: string;
  }) => void;

  "order:item_voided": (data: {
    orderId: string;
    itemId: string;
    tableNumber: string;
    reason: string;
    authorizedBy: string;
  }) => void;

  "kds:ticket_bumped": (data: {
    orderId: string;
    tableNumber: string;
    completedAt: string;
  }) => void;

  "bill:requested": (data: {
    tableId: string;
    tableNumber: string;
    orderId: string;
    subtotal: number;
  }) => void;

  "bill:settled": (data: {
    billId: string;
    tableId: string;
    tableNumber: string;
    grandTotal: number;
    paymentMode: string;
  }) => void;
}

export interface ClientToServerEvents {
  "join:room": (room: string) => void;
  "leave:room": (room: string) => void;
}
