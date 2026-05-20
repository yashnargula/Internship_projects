import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Customer, SalesOrder, OrderLineItem } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Mock data - in real app, this would come from API
  private customers: Customer[] = [
    { id: 1, name: 'John Doe', phone: '1234567890', email: 'john@email.com', address: '123 Main St' },
    { id: 2, name: 'Jane Smith', phone: '9876543210', email: 'jane@email.com', address: '456 Oak Ave' }
  ];

  private salesOrders: SalesOrder[] = [
    { orderNumber: 'SO001', orderDate: new Date(), totalAmount: 250.50, status: 'Shipped', customerId: 1 },
    { orderNumber: 'SO002', orderDate: new Date(), totalAmount: 125.75, status: 'Processing', customerId: 1 },
    { orderNumber: 'SO003', orderDate: new Date(), totalAmount: 500.00, status: 'Delivered', customerId: 2 }
  ];

  private orderItems: { [key: string]: OrderLineItem[] } = {
    'SO001': [
      { productName: 'Laptop', quantity: 1, unitPrice: 200.50, totalPrice: 200.50 },
      { productName: 'Mouse', quantity: 2, unitPrice: 25.00, totalPrice: 50.00 }
    ],
    'SO002': [
      { productName: 'Keyboard', quantity: 1, unitPrice: 125.75, totalPrice: 125.75 }
    ],
    'SO003': [
      { productName: 'Monitor', quantity: 1, unitPrice: 500.00, totalPrice: 500.00 }
    ]
  };

  searchCustomer(searchTerm: string): Observable<Customer> {
    const customer = this.customers.find(
      c => c.phone === searchTerm || c.email === searchTerm
    );

    if (customer) {
      return of(customer);
    } else {
      return throwError(() => new Error('No records found'));
    }
  }

  getSalesOrders(customerId: number): Observable<SalesOrder[]> {
    const orders = this.salesOrders.filter(o => o.customerId === customerId);
    return of(orders);
  }

  getOrderItems(orderNumber: string): Observable<OrderLineItem[]> {
    const items = this.orderItems[orderNumber] || [];
    return of(items);
  }
}
