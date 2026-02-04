export interface Order {
  id: string;
  sessionId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface OrderCreate {
  itemName: string;
  quantity: number;
  unitPrice: number;
}
