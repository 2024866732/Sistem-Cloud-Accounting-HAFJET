// Loyverse API Data Models
export interface Receipt {
  id: string;
  date: string;
  items: Array<{ item_id: string; quantity: number; price: number }>;
  payments: Array<{ payment_id: string; type: string; amount: number }>;
  customer?: Customer;
  store_id: string;
}

export interface Item {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category?: string;
}

export interface Inventory {
  item_id: string;
  store_id: string;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  loyalty?: number;
}

export interface Payment {
  id: string;
  type: string;
  amount: number;
  receipt_id: string;
}
