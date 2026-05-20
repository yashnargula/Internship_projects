import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService, Order } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <main class="flex-1 px-6 lg:px-10 py-8 max-w-[1440px] mx-auto w-full">
      <!-- Page Title & Action -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-slate-100">Orders</h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Manage and track your customer orders in real-time.</p>
        </div>
        <button (click)="showCreateForm = !showCreateForm" class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
          <span class="material-symbols-outlined text-[20px]">{{showCreateForm ? 'close' : 'add'}}</span>
          {{showCreateForm ? 'Cancel' : 'Create New Order'}}
        </button>
      </div>

      <!-- Create Order Form -->
      <div *ngIf="showCreateForm" class="bg-white dark:bg-slate-900 rounded-xl border border-primary/30 p-6 mb-8 shadow-lg">
        <h3 class="text-lg font-bold mb-4">New Order Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Customer Name</label>
            <input [(ngModel)]="newOrder.customerName" type="text" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 px-4 text-sm" placeholder="Enter customer name">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Amount</label>
            <input [(ngModel)]="newOrder.amount" type="number" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 px-4 text-sm" placeholder="0.00">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Status</label>
            <select [(ngModel)]="newOrder.status" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 px-4 text-sm">
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Processing">Processing</option>
            </select>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button (click)="submitOrder()" class="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:opacity-90 transition-all">
            Save Order
          </button>
        </div>
      </div>

      <!-- Filter & Search Bar -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between p-4 gap-4">
          <!-- Status Tabs -->
          <div class="flex border-b border-transparent lg:border-none overflow-x-auto gap-1">
            <button *ngFor="let tab of tabs"
              (click)="setActiveTab(tab.name)"
              [class]="tab.active ? 'px-4 py-2 text-sm font-bold rounded-lg bg-primary/10 text-primary whitespace-nowrap' : 'px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg whitespace-nowrap'">
              {{tab.name}}
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <!-- Search input within page -->
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                [(ngModel)]="localSearch"
                (ngModelChange)="onSearchChange($event)"
                class="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Search by ID or customer..."
                type="text"/>
            </div>
            <!-- Date Picker -->
            <div (click)="notImplemented('Date Picker')" class="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:border-slate-300 transition-colors">
              <span class="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>Oct 1, 2023 - Oct 31, 2023</span>
              <span class="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
            <!-- Export Button -->
            <button (click)="exportOrders()" class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
              <span class="material-symbols-outlined text-[18px]">download</span>
              Export
            </button>
          </div>
        </div>
      </div>

      <!-- Orders Table Section -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Order ID</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Customer</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr *ngFor="let order of filteredOrders$ | async" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4">
                  <a [routerLink]="['/orders', order.id]" class="text-primary font-bold hover:underline">#{{order.id}}</a>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">{{order.customerInitials}}</div>
                    <span class="font-medium">{{order.customerName}}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span [class]="'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ' + getStatusClass(order.status)">
                    <span [class]="'w-1.5 h-1.5 rounded-full mr-2 ' + getStatusDotClass(order.status)"></span>
                    {{order.status}}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{{order.date}}</td>
                <td class="px-6 py-4 font-semibold">{{order.amount | currency}}</td>
                <td class="px-6 py-4 text-right">
                  <button (click)="notImplemented('Table Actions')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <span class="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
              <tr *ngIf="!(filteredOrders$ | async)?.length">
                <td colspan="6" class="px-6 py-10 text-center text-slate-500">
                  No orders found matching your criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 gap-4">
          <span class="text-sm text-slate-500 dark:text-slate-400">
            Showing <span class="font-bold text-slate-900 dark:text-slate-100">1</span> to <span class="font-bold text-slate-900 dark:text-slate-100">{{(filteredOrders$ | async)?.length}}</span> of <span class="font-bold text-slate-900 dark:text-slate-100">{{(filteredOrders$ | async)?.length}}</span> orders
          </span>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>
              <span class="material-symbols-outlined text-[18px] align-middle">chevron_left</span>
            </button>
            <button class="px-3 py-1 rounded border border-primary bg-primary text-white text-sm font-bold">1</button>
            <button class="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">2</button>
            <button class="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">3</button>
            <span class="text-slate-400 px-1">...</span>
            <button class="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">12</button>
            <button class="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
              <span class="material-symbols-outlined text-[18px] align-middle">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: []
})
export class OrdersComponent implements OnInit {
  tabs = [
    { name: 'All Orders', active: true },
    { name: 'Pending', active: false },
    { name: 'Shipped', active: false },
    { name: 'Cancelled', active: false },
  ];

  localSearch = '';
  private localSearchSubject = new BehaviorSubject<string>('');
  private activeTabSubject = new BehaviorSubject<string>('All Orders');

  filteredOrders$!: Observable<Order[]>;
  showCreateForm = false;
  newOrder: any = {
    customerName: '',
    amount: 0,
    status: 'Pending'
  };

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.filteredOrders$ = combineLatest([
      this.activeTabSubject,
      this.localSearchSubject,
      this.dataService.globalSearch$,
      this.dataService.orders$
    ]).pipe(
      map(([activeTab, localSearch, globalSearch, allOrders]) => {
        return allOrders.filter(o => {
          const matchesStatus = activeTab === 'All Orders' || o.status === activeTab;
          const search = (localSearch + ' ' + globalSearch).toLowerCase().trim();
          const matchesSearch = !search || o.id.toLowerCase().includes(search) ||
                                o.customerName.toLowerCase().includes(search);
          return matchesStatus && matchesSearch;
        });
      })
    );
  }

  setActiveTab(tabName: string) {
    this.tabs.forEach(t => t.active = t.name === tabName);
    this.activeTabSubject.next(tabName);
  }

  onSearchChange(query: string) {
    this.localSearchSubject.next(query);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Shipped': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Processing': return 'bg-primary/10 text-primary border border-primary/20';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  getStatusDotClass(status: string) {
    switch (status) {
      case 'Shipped': return 'bg-green-500';
      case 'Pending': return 'bg-amber-500';
      case 'Cancelled': return 'bg-red-500';
      case 'Processing': return 'bg-primary';
      default: return 'bg-slate-500';
    }
  }

  submitOrder() {
    if (!this.newOrder.customerName) {
      alert('Please enter a customer name.');
      return;
    }
    const id = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const initials = this.newOrder.customerName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

    const order: Order = {
      id,
      customerName: this.newOrder.customerName,
      customerInitials: initials || '??',
      status: this.newOrder.status,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: this.newOrder.amount,
      items: 1
    };

    this.dataService.addOrder(order);
    this.showCreateForm = false;
    this.newOrder = { customerName: '', amount: 0, status: 'Pending' };
  }

  exportOrders() {
    alert('Orders exported successfully!');
  }

  notImplemented(feature: string) {
    console.log(`${feature} is a placeholder in this demo.`);
  }
}
