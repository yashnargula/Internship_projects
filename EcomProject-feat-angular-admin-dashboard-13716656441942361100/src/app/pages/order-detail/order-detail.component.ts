import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService, Order } from '../../services/data.service';
import { map, Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="flex-1 max-w-[1440px] mx-auto w-full p-6 space-y-6" *ngIf="order$ | async as order">
      <!-- Order Header Area -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Order #{{order.id}}</h1>
            <span [class]="'px-2.5 py-0.5 rounded-full text-xs font-bold ' + getStatusClass(order.status)">{{order.status | uppercase}}</span>
          </div>
          <p class="text-slate-500 text-sm">Placed on {{order.date}} • ID: 550e8400-e29b-41d4</p>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="downloadInvoice(order.id)" class="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span class="material-symbols-outlined text-sm">download</span>
            Download Invoice
          </button>
          <button
            *ngIf="order.status !== 'Cancelled'"
            (click)="cancelOrder(order)"
            class="flex items-center gap-2 px-4 py-2 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg text-sm font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
            <span class="material-symbols-outlined text-sm">cancel</span>
            Cancel Order
          </button>
          <button (click)="updateStatus(order)" class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95">
            <span class="material-symbols-outlined text-sm">sync_alt</span>
            Update Status
          </button>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Customer Information -->
        <aside class="lg:col-span-3 space-y-6">
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Customer Information</h3>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{{order.customerInitials}}</div>
                <div>
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{order.customerName}}</p>
                  <p class="text-xs text-slate-500">Customer since 2021</p>
                </div>
              </div>
              <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-slate-400 text-lg">mail</span>
                  <a class="text-sm text-primary font-medium hover:underline" href="mailto:j.doe&#64;example.com">j.doe&#64;example.com</a>
                </div>
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-slate-400 text-lg">call</span>
                  <span class="text-sm text-slate-600 dark:text-slate-400">+1 (555) 012-3456</span>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Shipping Address</h3>
              <button (click)="notImplemented('Edit Address')" class="text-primary text-xs font-bold hover:underline">Edit</button>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-medium text-slate-900 dark:text-white">{{order.customerName}}</p>
              <p class="text-sm text-slate-600 dark:text-slate-400">123 Business Avenue</p>
              <p class="text-sm text-slate-600 dark:text-slate-400">Suite 400</p>
              <p class="text-sm text-slate-600 dark:text-slate-400">San Francisco, CA 94107</p>
              <p class="text-sm text-slate-600 dark:text-slate-400">United States</p>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase">Method</span>
                <span class="text-xs font-bold text-slate-900 dark:text-white">FedEx Ground</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Center Column: Ordered Items -->
        <section class="lg:col-span-6 space-y-6">
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 class="font-bold text-slate-900 dark:text-white">Ordered Items</h3>
              <span class="text-xs font-medium text-slate-500">{{order.items}} Items</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Product</th>
                    <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Qty</th>
                    <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Price</th>
                    <th class="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr *ngFor="let item of items">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                          <img class="w-full h-full object-cover" [src]="item.image" [alt]="item.name">
                        </div>
                        <div>
                          <p class="text-sm font-bold text-slate-900 dark:text-white leading-tight">{{item.name}}</p>
                          <p class="text-xs text-slate-500">{{item.details}}</p>
                          <p class="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mt-1">SKU: {{item.sku}}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center text-sm font-medium text-slate-700 dark:text-slate-300">{{item.qty}}</td>
                    <td class="px-6 py-4 text-right text-sm font-medium text-slate-700 dark:text-slate-300">{{item.price | currency}}</td>
                    <td class="px-6 py-4 text-right text-sm font-bold text-slate-900 dark:text-white">{{(item.qty * item.price) | currency}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- Summary Area -->
          <div class="flex justify-end">
            <div class="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Subtotal</span>
                <span class="text-slate-900 dark:text-white font-medium">{{order.amount | currency}}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Shipping (Ground)</span>
                <span class="text-slate-900 dark:text-white font-medium">$12.50</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Tax (CA 8.5%)</span>
                <span class="text-slate-900 dark:text-white font-medium">{{(order.amount * 0.085) | currency}}</span>
              </div>
              <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span class="text-base font-bold text-slate-900 dark:text-white">Total Amount</span>
                <span class="text-xl font-black text-primary">{{(order.amount * 1.085 + 12.50) | currency}}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Right Column: Order Timeline -->
        <aside class="lg:col-span-3">
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm sticky top-24">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Order Timeline</h3>
            <div class="relative space-y-8">
              <div class="timeline-item relative flex gap-4" *ngFor="let step of getTimeline(order); let last = last">
                <div class="timeline-line shrink-0 w-6 flex justify-center">
                  <div [class]="'z-10 size-6 rounded-full flex items-center justify-center ' + step.circleClass">
                    <span *ngIf="step.icon" class="material-symbols-outlined text-[14px]">{{step.icon}}</span>
                    <div *ngIf="step.pulse" class="size-2 bg-primary rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div class="pb-1" [class.opacity-50]="step.pending">
                  <p [class]="'text-sm font-bold ' + step.titleClass">{{step.title}}</p>
                  <p class="text-xs text-slate-500">{{step.time}}</p>
                  <p *ngIf="step.note" class="text-xs text-slate-400 mt-1">{{step.note}}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
    <div *ngIf="!(order$ | async)" class="p-20 text-center">
       <p class="text-slate-500">Loading order details...</p>
       <a routerLink="/orders" class="text-primary hover:underline mt-4 block">Back to Orders</a>
    </div>
  `,
  styles: []
})
export class OrderDetailComponent implements OnInit {
  order$!: Observable<Order | undefined>;

  items = [
    {
      name: 'Elite Runner X-200',
      details: 'Color: Midnight Blue / Size: 10',
      sku: 'ERX-200-MB-10',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0tyoyVhwiMfLbJ2AM185h88b-ZlbujH5JcvfL3Kmn4mPNnQYJp8HTyWPMY-EH-ArjZz_CwMpIlyDkq1sjv1e9P2I3neFD-t0gR9mJ5Tuu9xdIKc4j3DeR_oBiv5TBttPnHyvcExMfZDZ82ZARRLOm5Mm_xsmqbW0UotSIZ6e5eU13M7ybgM6Jr6kDjgCCU7-IK-3PJhHbFX80zrP4PzSt9gdNWyoe4uvHLttb2eOgQ3U9Xm9sHpbdSM_IBkPkatKTqxQSfz5kXEPb',
      qty: 1,
      price: 129.00
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.order$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        return this.dataService.orders$.pipe(
          map(orders => orders.find(o => o.id === id))
        );
      })
    );
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

  getTimeline(order: Order) {
    return [
      {
        title: 'Order Placed',
        time: order.date,
        note: 'Web checkout by customer',
        icon: 'check',
        circleClass: 'bg-primary text-white',
        titleClass: 'text-slate-900 dark:text-white',
        pending: false
      },
      {
        title: 'Payment Confirmed',
        time: order.date,
        note: 'Stripe transaction #8812',
        icon: 'check',
        circleClass: 'bg-primary text-white',
        titleClass: 'text-slate-900 dark:text-white',
        pending: false
      },
      {
        title: order.status === 'Cancelled' ? 'Cancelled' : 'Processing',
        time: order.date,
        note: order.status === 'Cancelled' ? 'Order was cancelled by staff' : 'Ready for warehouse picking',
        pulse: order.status === 'Processing',
        icon: order.status === 'Cancelled' ? 'close' : (order.status === 'Shipped' ? 'check' : undefined),
        circleClass: order.status === 'Cancelled' ? 'bg-rose-500 text-white' : (order.status === 'Processing' ? 'bg-white dark:bg-slate-900 border-2 border-primary text-primary' : 'bg-primary text-white'),
        titleClass: order.status === 'Cancelled' ? 'text-rose-500' : (order.status === 'Processing' ? 'text-primary' : 'text-slate-900 dark:text-white'),
        pending: false
      },
      {
        title: 'Shipped',
        time: order.status === 'Shipped' ? order.date : 'Not yet updated',
        icon: 'local_shipping',
        circleClass: order.status === 'Shipped' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-400',
        titleClass: order.status === 'Shipped' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400',
        pending: order.status !== 'Shipped'
      }
    ];
  }

  downloadInvoice(id: string) {
    alert(`Downloading invoice for order #${id}...`);
  }

  cancelOrder(order: Order) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.dataService.updateOrder({ ...order, status: 'Cancelled' });
    }
  }

  updateStatus(order: Order) {
    const statuses: ('Pending' | 'Processing' | 'Shipped' | 'Cancelled')[] = ['Pending', 'Processing', 'Shipped', 'Cancelled'];
    const currentIndex = statuses.indexOf(order.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    this.dataService.updateOrder({ ...order, status: statuses[nextIndex] });
  }

  notImplemented(feature: string) {
    alert(`${feature} is not implemented in this demo.`);
  }
}
