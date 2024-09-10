export type OrderItemType =
  "cpn"
  | "cpd"
  | "cps"
  | "cpt"
  | "cpm"
  | "cpa"
  | "trh"
  | "trmo"
  | "trhn"
  | "trd"
  | "trl"
  | "trml"
  | "soc"
  | "sovq";
export type OrderItemState = "hot" | "cold"
export type OrderItemStatus = "cancelled" | "completed"

export interface OrderCustomer {
  name: string;
  class: string;
  phone_number?: string;
}

export interface OrderItemAll
{
  id: OrderItemType;
  fullName: string;
  state: OrderItemState;
  number: number
}

export interface Order extends OrderCustomer {
  order_id: string;
  items_total: OrderItemAll[];
  price: number;
  /**
   * This field will be used by the bot so that everytime it restarts it can use the field to check
   * if the order has been posted before
   */
  posted: boolean
}