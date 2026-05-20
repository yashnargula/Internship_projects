import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 space-y-8 max-w-7xl mx-auto w-full">
      <!-- Greeting -->
      <div class="flex items-end justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard Overview</h2>
          <p class="text-slate-500">Welcome back, Alex. Here's what's happening with your store today.</p>
        </div>
        <button (click)="exportReport()" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm">
          <span class="material-symbols-outlined text-sm">download</span>
          Export Report
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Orders -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-slate-500">Total Orders</span>
            <div class="p-2 bg-primary/10 rounded-lg text-primary">
              <span class="material-symbols-outlined text-base">local_shipping</span>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold">{{(totalOrders$ | async)}}</span>
            <span class="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
              <span class="material-symbols-outlined text-xs">trending_up</span>
              +12%
            </span>
          </div>
          <div class="mt-4 h-12 w-full">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 100 30">
              <path d="M0 25 Q 15 20, 30 22 T 60 10 T 100 5" fill="none" stroke="#137fec" stroke-width="2" vector-effect="non-scaling-stroke"></path>
              <path d="M0 25 Q 15 20, 30 22 T 60 10 T 100 5 V 30 H 0 Z" fill="url(#grad1)" opacity="0.1"></path>
              <defs>
                <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#137fec;stop-opacity:1"></stop>
                  <stop offset="100%" style="stop-color:#137fec;stop-opacity:0"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>




        <!-- Pending Orders -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-slate-500">Pending Orders</span>
            <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600">
              <span class="material-symbols-outlined text-base">schedule</span>
            </div>
          </div>
          <span class="text-2xl font-bold">{{(pendingOrders$ | async)}}</span>
          <p class="mt-2 text-xs text-slate-400">Requires attention soon</p>
        </div>

        <!-- Completed Orders -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-slate-500">Completed Orders</span>
            <div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
              <span class="material-symbols-outlined text-base">check_circle</span>
            </div>
          </div>
          <span class="text-2xl font-bold">{{(completedOrders$ | async)}}</span>
          <p class="mt-2 text-xs text-slate-400">96.4% success rate</p>
        </div>

        <!-- Revenue Summary -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-slate-500">Revenue Summary</span>
            <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
              <span class="material-symbols-outlined text-base">payments</span>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold">{{(totalRevenue$ | async) | currency}}</span>
            <span class="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
              <span class="material-symbols-outlined text-xs">trending_up</span>
              +8%
            </span>
          </div>
          <p class="mt-2 text-xs text-slate-400">Across all payment channels</p>
        </div>
      </div>

      <!-- Charts and Activity Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-8">
        <!-- Sales Chart -->
        <div class="xl:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h3 class="font-bold text-lg">Sales Performance</h3>
              <p class="text-sm text-slate-500">{{selectedTimeRange}} revenue tracking</p>
            </div>
            <select
              (change)="onTimeRangeChange($event)"
              class="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-primary/20 cursor-pointer">
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>
          <div class="relative h-64 w-full flex items-end justify-between px-2 gap-4">
            <div *ngFor="let bar of chartData" class="flex flex-col items-center gap-2 flex-1 group">
              <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative flex items-end overflow-hidden h-full">
                <div
                  [class]="bar.highlight ? 'bg-primary w-full transition-all group-hover:opacity-90' : 'bg-primary/20 w-full transition-all group-hover:bg-primary/30'"
                  [style.height]="bar.height"></div>
              </div>
              <span [class]="bar.highlight ? 'text-[10px] font-bold text-slate-900 dark:text-slate-100' : 'text-[10px] font-bold text-slate-400'">{{bar.day}}</span>
            </div>
          </div>
        </div>

        <!-- Recent Activity Feed -->
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-bold text-lg">Recent Activity</h3>
            <a class="text-xs font-semibold text-primary hover:underline" href="#">View all</a>
          </div>
          <div class="space-y-6">
            <!-- Activity Item 1 -->
            <div class="flex gap-4">
              <div class="relative">
                <div class="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span class="material-symbols-outlined text-sm">shopping_cart</span>
                </div>
                <div class="absolute top-8 bottom-[-24px] left-1/2 -translate-x-1/2 w-px bg-slate-200 dark:bg-slate-800"></div>
              </div>
              <div class="flex flex-col">
                <p class="text-sm font-semibold">New order <span class="text-primary">#1234</span></p>
                <p class="text-xs text-slate-500">John Doe placed an order for 2 items</p>
                <span class="text-[10px] font-medium text-slate-400 mt-1">2 mins ago</span>
              </div>
            </div>
            <!-- Activity Item 2 -->
            <div class="flex gap-4">
              <div class="relative">
                <div class="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-sm">person_add</span>
                </div>
                <div class="absolute top-8 bottom-[-24px] left-1/2 -translate-x-1/2 w-px bg-slate-200 dark:bg-slate-800"></div>
              </div>
              <div class="flex flex-col">
                <p class="text-sm font-semibold">New user registered</p>
                <p class="text-xs text-slate-500">Sarah Miller joined the platform</p>
                <span class="text-[10px] font-medium text-slate-400 mt-1">45 mins ago</span>
              </div>
            </div>
            <!-- Activity Item 3 -->
            <div class="flex gap-4">
              <div class="relative">
                <div class="size-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-sm">error</span>
                </div>
              </div>
              <div class="flex flex-col">
                <p class="text-sm font-semibold">Payment failed</p>
                <p class="text-xs text-slate-500">Order #1230 could not be processed</p>
                <span class="text-[10px] font-medium text-slate-400 mt-1">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  private dataService = inject(DataService);

  totalOrders$ = this.dataService.orders$.pipe(map(o => o.length));
  pendingOrders$ = this.dataService.orders$.pipe(map(o => o.filter(x => x.status === 'Pending').length));
  completedOrders$ = this.dataService.orders$.pipe(map(o => o.filter(x => x.status === 'Shipped').length));
  totalRevenue$ = this.dataService.orders$.pipe(map(orders => orders.reduce((acc, curr) => acc + curr.amount, 0)));

  selectedTimeRange = 'Last 7 Days';
  chartData: any[] = [];

  ngOnInit() {
    this.loadChartData();
  }

  onTimeRangeChange(event: any) {
    this.selectedTimeRange = event.target.value;
    this.loadChartData();
  }

  loadChartData() {
    if (this.selectedTimeRange === 'Last 7 Days') {
      this.chartData = [
        { day: 'Mon', height: '40%', highlight: false },
        { day: 'Tue', height: '65%', highlight: false },
        { day: 'Wed', height: '85%', highlight: true },
        { day: 'Thu', height: '55%', highlight: false },
        { day: 'Fri', height: '70%', highlight: false },
        { day: 'Sat', height: '45%', highlight: false },
        { day: 'Sun', height: '30%', highlight: false },
      ];
    } else {
      this.chartData = [
        { day: 'W1', height: '60%', highlight: false },
        { day: 'W2', height: '80%', highlight: true },
        { day: 'W3', height: '45%', highlight: false },
        { day: 'W4', height: '90%', highlight: false },
      ];
    }
  }

  exportReport() {
    alert('Generating full store report...');
  }
}
