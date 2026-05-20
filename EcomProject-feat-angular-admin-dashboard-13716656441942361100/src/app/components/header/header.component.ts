import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10">
      <div class="flex-1 max-w-md">
        <div class="relative group">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-slate-400 transition-all"
            placeholder="Search orders, customers, or analytics..."
            type="text"/>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <button class="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" (click)="notify('Notifications')">
          <span class="material-symbols-outlined">notifications</span>
          <span class="absolute top-1.5 right-1.5 size-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </button>
        <div class="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
        <button class="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors" (click)="notify('Language Selection')">
          <span>English</span>
          <span class="material-symbols-outlined text-xs">expand_more</span>
        </button>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  searchQuery = '';

  constructor(private dataService: DataService) {}

  onSearchChange(query: string) {
    this.dataService.setGlobalSearch(query);
  }

  notify(action: string) {
    console.log(`${action} clicked`);
    // In a real app, this could open a menu or show a toast
  }
}
