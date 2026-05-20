import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderService } from '../../services/order.service';
import { SalesOrder } from '../../models/order.model';
import { OrderItemsComponent } from '../order-items/order-items';

@Component({
  selector: 'app-sales-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <mat-card *ngIf="salesOrders.length > 0">
      <mat-card-header>
        <mat-card-title>Sales Orders</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <table mat-table [dataSource]="salesOrders" class="full-width">

          <ng-container matColumnDef="orderNumber">
            <th mat-header-cell *matHeaderCellDef> Order Number </th>
            <td mat-cell *matCellDef="let order">
              <button mat-button color="primary" (click)="viewOrderItems(order.orderNumber)">
                {{order.orderNumber}}
              </button>
            </td>
          </ng-container>

          <ng-container matColumnDef="orderDate">
            <th mat-header-cell *matHeaderCellDef> Date </th>
            <td mat-cell *matCellDef="let order"> {{order.orderDate | date}} </td>
          </ng-container>

          <ng-container matColumnDef="totalAmount">
            <th mat-header-cell *matHeaderCellDef> Total Amount </th>
            <td mat-cell *matCellDef="let order"> {{order.totalAmount | currency}} </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let order"> {{order.status}} </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    table {
      margin-top: 16px;
    }
  `]
})
export class SalesOrdersComponent implements OnInit {
  @Input() customerId!: number;
  salesOrders: SalesOrder[] = [];
  displayedColumns: string[] = ['orderNumber', 'orderDate', 'totalAmount', 'status'];

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.customerId) {
      this.orderService.getSalesOrders(this.customerId).subscribe(orders => {
        this.salesOrders = orders;
      });
    }
  }

  viewOrderItems(orderNumber: string): void {
    this.orderService.getOrderItems(orderNumber).subscribe(items => {
      this.dialog.open(OrderItemsComponent, {
        width: '600px',
        data: { orderNumber, items }
      });
    });
  }
}
