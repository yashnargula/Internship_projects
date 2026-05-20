import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen overflow-y-auto">
      <div class="p-6 flex items-center gap-3">
        <div class="bg-primary rounded-lg p-2 text-white">
          <span class="material-symbols-outlined">shopping_cart</span>
        </div>
        <div class="flex flex-col">
          <h1 class="text-slate-900 dark:text-slate-100 text-lg font-bold leading-none">SwiftAdmin</h1>
          <p class="text-slate-500 text-xs font-normal">e-commerce solutions</p>
        </div>
      </div>
      <nav class="flex-1 px-3 mt-4 space-y-1">
        <a routerLink="/dashboard" routerLinkActive="active-nav" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
          <span class="material-symbols-outlined">dashboard</span>
          <span class="text-sm font-semibold">Dashboard</span>
        </a>
        <a routerLink="/orders" routerLinkActive="active-nav" class="flex items-center gap-3 px-3 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span class="material-symbols-outlined">shopping_bag</span>
          <span class="text-sm font-medium">Orders</span>
        </a>
        <a routerLink="/users" routerLinkActive="active-nav" class="flex items-center gap-3 px-3 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span class="material-symbols-outlined">group</span>
          <span class="text-sm font-medium">Users</span>
        </a>
        <a routerLink="/reports" routerLinkActive="active-nav" class="flex items-center gap-3 px-3 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span class="material-symbols-outlined">bar_chart</span>
          <span class="text-sm font-medium">Reports</span>
        </a>
        <a href="#" class="flex items-center gap-3 px-3 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span class="material-symbols-outlined">settings</span>
          <span class="text-sm font-medium">Settings</span>
        </a>
      </nav>
      <div class="p-4 border-t border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-3 px-2">
          <div class="size-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCuKwe7xo-jMhQZigl_xz6IhFIco-l0HYYNEJwOfuTuU9s6bN0D-6tefHJwBdazpkeXAldFknMFIHtWrk69UPKRpqELRjPd-hpE52lbLgiTazoNp0modQFLU6U4xE_WRQyNaDARtxRzG8qvp2SeEyDg6rmtxrVVruhG5klXQYGBsolg-cXGCfUYUjmhh32dRs0seBFeGQc5wzmSA-SxAHRLe4awrpKSVJKS4FRZG4lydaMi7wq4DjV3gTWOz2aa0kJhakMOeP0Skr2Q')"></div>
          <div class="flex flex-col overflow-hidden">
            <p class="text-sm font-semibold truncate">Alex Johnson</p>
            <p class="text-xs text-slate-500 truncate">Store Manager</p>
          </div>
          <span class="material-symbols-outlined text-slate-400 ml-auto text-sm cursor-pointer">logout</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .active-nav {
      background-color: rgba(19, 127, 236, 0.1) !important;
      color: #137fec !important;
      border-right: 4px solid #137fec;
    }
  `]
})
export class SidebarComponent {}
