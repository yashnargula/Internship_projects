import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CustomerSearchComponent } from './components/customer-search/customer-search';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    CustomerSearchComponent
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Order Tracking System</span>
    </mat-toolbar>

    <main class="container">
      <app-customer-search></app-customer-search>
    </main>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent {
  title = 'order-tracking-system';
}
