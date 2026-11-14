export const SOCKET_ROOMS = {
  RESTAURANT: "room:restaurant",
  KDS: "room:kds",
  WAITERS: "room:waiters",
  ADMIN: "room:admin",
} as const;

export const SOCKET_EVENTS = {
  TABLE_STATUS_CHANGED: "table:status_changed",
  TABLE_TRANSFERRED: "table:transferred",
  TABLE_MERGED: "table:merged",
  ORDER_CREATED: "order:created",
  ORDER_ADDON_ADDED: "order:addon_added",
  ORDER_ITEM_STATUS_UPDATED: "order:item_status_updated",
  ORDER_ITEM_VOIDED: "order:item_voided",
  KDS_TICKET_BUMPED: "kds:ticket_bumped",
  BILL_REQUESTED: "bill:requested",
  BILL_SETTLED: "bill:settled",
} as const;
