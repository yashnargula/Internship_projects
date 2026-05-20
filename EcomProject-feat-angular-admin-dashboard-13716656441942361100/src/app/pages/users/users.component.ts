import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, User } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="flex flex-1 overflow-hidden">
      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-y-auto">
        <!-- Breadcrumbs & Header -->
        <div class="px-6 py-4 lg:px-10">
          <div class="flex flex-wrap gap-2 text-sm mb-4">
            <a class="text-slate-500 hover:text-primary" href="#">Home</a>
            <span class="text-slate-400">/</span>
            <a class="text-slate-500 hover:text-primary" href="#">Admin</a>
            <span class="text-slate-400">/</span>
            <span class="text-slate-900 dark:text-white font-medium">User Management</span>
          </div>
          <div class="flex flex-wrap justify-between items-end gap-4">
            <div class="flex flex-col gap-1">
              <h1 class="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Users</h1>
              <p class="text-slate-500 dark:text-slate-400 text-base">Manage team members, roles, and system access permissions.</p>
            </div>
            <button (click)="showAddForm = !showAddForm" class="flex items-center justify-center rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-all gap-2">
              <span class="material-symbols-outlined">{{showAddForm ? 'close' : 'add'}}</span>
              <span>{{showAddForm ? 'Cancel' : 'Add User'}}</span>
            </button>
          </div>
        </div>

        <!-- Add User Form -->
        <div *ngIf="showAddForm" class="mx-6 lg:mx-10 mb-6 bg-white dark:bg-slate-900 rounded-xl border border-primary/30 p-6 shadow-lg">
          <h3 class="text-lg font-bold mb-4">New User Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
              <input [(ngModel)]="newUser.name" type="text" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 px-4 text-sm" placeholder="Enter full name">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Email Address</label>
              <input [(ngModel)]="newUser.email" type="email" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 px-4 text-sm" placeholder="email@example.com">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Initial Role</label>
              <select [(ngModel)]="newUser.role" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 px-4 text-sm">
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <button (click)="submitUser()" class="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:opacity-90 transition-all">
              Create User
            </button>
          </div>
        </div>

        <!-- Filters & Search -->
        <div class="px-6 lg:px-10 py-4 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div class="flex items-center gap-4 w-full md:w-auto">
            <div class="relative w-full md:w-80">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                [(ngModel)]="localSearch"
                (ngModelChange)="onSearchChange($event)"
                class="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Search users by name, email..."
                type="text"/>
            </div>
            <button (click)="notImplemented('Filters Modal')" class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <span class="material-symbols-outlined">filter_list</span>
              <span>Filters</span>
            </button>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Role:</span>
            <div class="flex p-1 bg-slate-200/50 dark:bg-slate-800 rounded-lg">
              <button
                *ngFor="let roleTab of roles"
                (click)="setActiveRole(roleTab)"
                [class]="activeRole === roleTab ? 'px-3 py-1 text-xs font-bold rounded-md bg-white dark:bg-slate-700 shadow-sm text-primary' : 'px-3 py-1 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">
                {{roleTab}}
              </button>
            </div>
          </div>
        </div>

        <!-- User Table -->
        <div class="px-6 lg:px-10 py-6 overflow-x-auto">
          <table class="w-full border-separate border-spacing-y-3">
            <thead>
              <tr class="text-left text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th class="px-4 py-2"><input class="rounded border-slate-300 text-primary focus:ring-primary" type="checkbox"/></th>
                <th class="px-4 py-2">User</th>
                <th class="px-4 py-2">Role</th>
                <th class="px-4 py-2">Last Active</th>
                <th class="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr
                *ngFor="let user of filteredUsers$ | async"
                (click)="selectUser(user)"
                [class]="selectedUser?.id === user.id ? 'bg-white dark:bg-slate-900 border border-primary ring-2 ring-primary/20 rounded-xl transition-all cursor-pointer shadow-md' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer rounded-xl shadow-sm'">
                <td class="px-4 py-4 rounded-l-xl">
                  <input [checked]="selectedUser?.id === user.id" class="rounded border-slate-300 text-primary focus:ring-primary" type="checkbox"/>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <div class="size-10 rounded-full border-2 border-primary/20 p-0.5">
                      <div class="size-full rounded-full bg-cover bg-center" [style.background-image]="'url(' + user.avatarUrl + ')'"></div>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-900 dark:text-white">{{user.name}}</span>
                      <span class="text-slate-500 text-xs lowercase">{{user.email}}</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <span [class]="getRoleClass(user.role)">{{user.role}}</span>
                </td>
                <td class="px-4 py-4 text-slate-500">{{user.lastActive}}</td>
                <td class="px-4 py-4 text-right rounded-r-xl">
                  <button (click)="notImplemented('User Actions'); $event.stopPropagation()" class="text-slate-400 hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="mt-auto px-6 lg:px-10 py-6 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Showing 1-{{(filteredUsers$ | async)?.length}} of {{(filteredUsers$ | async)?.length}} users</span>
          <div class="flex items-center gap-2">
            <button class="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <div class="flex gap-1">
              <button class="size-8 rounded-lg bg-primary text-white text-xs font-bold">1</button>
            </div>
            <button class="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Edit User Drawer -->
      <aside *ngIf="selectedUser" class="w-[450px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shadow-2xl z-20 overflow-y-auto">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Edit Permissions</h3>
          <button (click)="closeDrawer()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="p-6 space-y-8">
          <!-- User Identity -->
          <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div class="size-16 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-700 shadow-sm" [style.background-image]="'url(' + selectedUser.avatarUrl + ')'"></div>
            <div class="flex flex-col">
              <h4 class="font-bold text-slate-900 dark:text-white text-lg leading-tight">{{selectedUser.name}}</h4>
              <p class="text-slate-500 text-sm">Member since {{selectedUser.memberSince}}</p>
              <div class="mt-1">
                <span class="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">Active Status</span>
              </div>
            </div>
          </div>

          <!-- Role Selection -->
          <div class="space-y-4">
            <h5 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Select System Role</h5>
            <div class="grid grid-cols-1 gap-3">
              <label *ngFor="let role of ['Admin', 'Editor', 'Viewer']"
                class="flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all"
                [class.border-primary]="tempRole === role"
                [class.bg-primary-5]="tempRole === role"
                [class.border-slate-200]="tempRole !== role">
                <input type="radio" name="role" [value]="role" [(ngModel)]="tempRole" class="text-primary focus:ring-primary h-4 w-4" />
                <div>
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{role}}</p>
                  <p class="text-xs text-slate-500">{{getRoleDescription(role)}}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Specific Permissions (Mock) -->
          <div class="space-y-4">
            <h5 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Specific Permissions</h5>
            <div class="space-y-6">
              <div class="space-y-3">
                <div class="flex items-center gap-2 text-slate-900 dark:text-white">
                  <span class="material-symbols-outlined text-primary">shopping_bag</span>
                  <span class="text-sm font-bold">Order Management</span>
                </div>
                <div class="grid grid-cols-1 gap-2 pl-7">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked class="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary"/>
                    <span class="text-sm text-slate-600 dark:text-slate-400">View and track orders</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Drawer Footer Actions -->
        <div class="mt-auto p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 sticky bottom-0 z-10">
          <div class="flex gap-3">
            <button (click)="closeDrawer()" class="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Discard</button>
            <button (click)="saveUser()" class="flex-1 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-md hover:opacity-90 transition-all">Save Changes</button>
          </div>
        </div>
      </aside>
    </main>
  `,
  styles: [`
    .bg-primary-5 { background-color: rgba(19, 127, 236, 0.05); }
  `]
})
export class UsersComponent implements OnInit {
  roles = ['All', 'Admin', 'Editor', 'Viewer'];
  activeRole = 'All';
  localSearch = '';

  private activeRoleSubject = new BehaviorSubject<string>('All');
  private localSearchSubject = new BehaviorSubject<string>('');

  filteredUsers$!: Observable<User[]>;
  selectedUser: User | null = null;
  tempRole: any = '';
  showAddForm = false;
  newUser: any = {
    name: '',
    email: '',
    role: 'Viewer'
  };

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.filteredUsers$ = combineLatest([
      this.activeRoleSubject,
      this.localSearchSubject,
      this.dataService.globalSearch$,
      this.dataService.users$
    ]).pipe(
      map(([activeRole, localSearch, globalSearch, allUsers]) => {
        return allUsers.filter(u => {
          const matchesRole = activeRole === 'All' || u.role === activeRole;
          const search = (localSearch + ' ' + globalSearch).toLowerCase().trim();
          const matchesSearch = !search || u.name.toLowerCase().includes(search) ||
                               u.email.toLowerCase().includes(search);
          return matchesRole && matchesSearch;
        });
      })
    );
  }

  setActiveRole(role: string) {
    this.activeRole = role;
    this.activeRoleSubject.next(role);
  }

  onSearchChange(query: string) {
    this.localSearchSubject.next(query);
  }

  getRoleClass(role: string) {
    if (role === 'Admin') return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary';
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  }

  getRoleDescription(role: string) {
    switch(role) {
      case 'Admin': return 'Full access to all settings and financial data.';
      case 'Editor': return 'Can manage products, orders and content.';
      case 'Viewer': return 'Read-only access to analytics and orders.';
      default: return '';
    }
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.tempRole = user.role;
  }

  closeDrawer() {
    this.selectedUser = null;
  }

  saveUser() {
    if (this.selectedUser) {
      this.dataService.updateUser({
        ...this.selectedUser,
        role: this.tempRole
      });
      this.closeDrawer();
    }
  }

  submitUser() {
    if (!this.newUser.name || !this.newUser.email) {
      alert('Please fill in all fields.');
      return;
    }
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: this.newUser.name,
      email: this.newUser.email,
      role: this.newUser.role,
      lastActive: 'Just now',
      avatarUrl: 'https://i.pravatar.cc/150?u=' + Math.random(),
      status: 'Active',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
    this.dataService.addUser(user);
    this.showAddForm = false;
    this.newUser = { name: '', email: '', role: 'Viewer' };
  }

  notImplemented(feature: string) {
    console.log(`${feature} is a placeholder in this demo.`);
  }
}
