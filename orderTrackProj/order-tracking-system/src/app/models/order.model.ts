export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface SalesOrder {
  orderNumber: string;
  orderDate: Date;
  totalAmount: number;
  status: string;
  customerId: number;
}

export interface OrderLineItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
