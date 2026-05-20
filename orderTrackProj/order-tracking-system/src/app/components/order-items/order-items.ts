import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { OrderLineItem } from '../../models/order.model';

@Component({
  selector: 'app-order-items',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Order Items - {{data.orderNumber}}</h2>
    <mat-dialog-content>
      <table mat-table [dataSource]="data.items" class="full-width">

        <ng-container matColumnDef="productName">
          <th mat-header-cell *matHeaderCellDef> Product </th>
          <td mat-cell *matCellDef="let item"> {{item.productName}} </td>
        </ng-container>

        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef> Quantity </th>
          <td mat-cell *matCellDef="let item"> {{item.quantity}} </td>
        </ng-container>

        <ng-container matColumnDef="unitPrice">
          <th mat-header-cell *matHeaderCellDef> Unit Price </th>
          <td mat-cell *matCellDef="let item"> {{item.unitPrice | currency}} </td>
        </ng-container>

        <ng-container matColumnDef="totalPrice">
          <th mat-header-cell *matHeaderCellDef> Total Price </th>
          <td mat-cell *matCellDef="let item"> {{item.totalPrice | currency}} </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    table {
      margin: 16px 0;
    }
  `]
})
export class OrderItemsComponent {
  displayedColumns: string[] = ['productName', 'quantity', 'unitPrice', 'totalPrice'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { orderNumber: string, items: OrderLineItem[] }
  ) {}
}
