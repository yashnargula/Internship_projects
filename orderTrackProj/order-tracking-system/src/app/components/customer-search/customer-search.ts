import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OrderService } from '../../services/order';
import { Customer, SalesOrder } from '../../models/order.model';
import { SalesOrdersComponent } from '../sales-orders/sales-orders';

@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    SalesOrdersComponent
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Customer Search</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="search-container">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Enter Phone or Email</mat-label>
            <input matInput [(ngModel)]="searchTerm" placeholder="1234567890 or email@example.com">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <button mat-raised-button color="primary" (click)="searchCustomer()" [disabled]="!searchTerm">
            Search Customer
          </button>
        </div>

        <div *ngIf="customer" class="customer-details">
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> {{customer.name}}</p>
          <p><strong>Phone:</strong> {{customer.phone}}</p>
          <p><strong>Email:</strong> {{customer.email}}</p>
          <p><strong>Address:</strong> {{customer.address}}</p>
        </div>
      </mat-card-content>
    </mat-card>

    <app-sales-orders
      *ngIf="customer"
      [customerId]="customer.id"
      (viewItems)="onViewItems($event)">
    </app-sales-orders>
  `,
  styles: [`
    .search-container {
      display: flex;
      gap: 16px;
      align-items: center;
      margin: 16px 0;
    }
    .full-width {
      flex: 1;
    }
    .customer-details {
      margin-top: 24px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
  `]
})
export class CustomerSearchComponent {
  searchTerm: string = '';
  customer: Customer | null = null;

  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {}

  searchCustomer(): void {
    if (!this.searchTerm) return;

    this.orderService.searchCustomer(this.searchTerm).subscribe({
      next: (customer) => {
        this.customer = customer;
      },
      error: () => {
        this.snackBar.open('No records found', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.customer = null;
      }
    });
  }

  onViewItems(orderNumber: any): void {
    // This will be handled by the order-items component
    console.log('View items for order:', orderNumber);
  }
}
