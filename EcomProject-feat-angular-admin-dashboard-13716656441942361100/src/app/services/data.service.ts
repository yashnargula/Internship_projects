import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export interface Order {
  id: string;
  customerName: string;
  customerInitials: string;
  status: 'Pending' | 'Shipped' | 'Cancelled' | 'Processing';
  date: string;
  amount: number;
  items?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  lastActive: string;
  avatarUrl?: string;
  memberSince?: string;
  status?: 'Active' | 'Inactive';
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private ordersSubject = new BehaviorSubject<Order[]>([
    { id: 'ORD-12345', customerName: 'John Doe', customerInitials: 'JD', status: 'Shipped', date: 'Oct 24, 2023', amount: 245.00, items: 2 },
    { id: 'ORD-12346', customerName: 'Jane Smith', customerInitials: 'JS', status: 'Pending', date: 'Oct 24, 2023', amount: 120.50, items: 1 },
    { id: 'ORD-12347', customerName: 'Robert Brown', customerInitials: 'RB', status: 'Shipped', date: 'Oct 23, 2023', amount: 540.00, items: 4 },
    { id: 'ORD-12348', customerName: 'Emily Davis', customerInitials: 'ED', status: 'Cancelled', date: 'Oct 22, 2023', amount: 89.00, items: 1 },
    { id: 'ORD-12349', customerName: 'Michael Wilson', customerInitials: 'MW', status: 'Shipped', date: 'Oct 21, 2023', amount: 1200.00, items: 5 },
    { id: 'ORD-7742', customerName: 'Jonathan Doe', customerInitials: 'JD', status: 'Processing', date: 'Oct 12, 2023', amount: 407.43, items: 3 }
  ]);

  private usersSubject = new BehaviorSubject<User[]>([
    { id: '1', name: 'Sarah Connor', email: 'sarah.c@ecommerce.com', role: 'Admin', lastActive: '2 mins ago', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfIvCQ41q9P842yfCkGJUljhhf0Fd8M-o-9xXRHGgr21XyKrxlEdTu2psgUdciOZk_NRMgN7bTLvswp-Aj7Knjrvkj79NWnlguaTVne4rEV5eCPr2EMHQPLDh7XCaJStD5hcs0JWdXN_mLjDxakMykrVQOFoRtJb0DgTMVRaPjxxP-nhq_iGY_abl-md4_cKDRKEVwcCvmUFyM3X_mpv0aW1vR_bf7XlzDQsvmvyPvn9q1WypueO3BlObdxAKWM15j5gaJ-nPdIwXx', status: 'Active', memberSince: 'Jan 2023' },
    { id: '2', name: 'Marcus Wright', email: 'm.wright@ecommerce.com', role: 'Editor', lastActive: '5 hours ago', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyxB7YNT-fPVnfSjYsL5Is2ClpRudl7gU1lZniAFu7ScYfyjmEChPgPNzNwXjU88xgKzrIKrlGpxsy6Fj9m37UF8O35FsZXcHshfQ_MPG1tyZWTBPmz4544E7VITH58zgony-4ppBpEk9TwFYBiLLi_bRoFa4BuLa5sBmRKdtMLwY1GcEWSx3Q7auaWKw8jlTnyijV-EJcQPbzARs7UKz3oNjkOOQHqzT_6h92M_3WDj58EyOKET6U8MsdzLzgslO4PmntxYxcFOTD', status: 'Active', memberSince: 'Mar 2023' },
    { id: '3', name: 'Kyle Reese', email: 'reese.k@ecommerce.com', role: 'Viewer', lastActive: 'Yesterday', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtL0ieh1xVi9BGR3oWSnSAueMqsK2LTIbnY5lLMu83M9R8lpfaImNu3QZT54M1-ANLSou8y2BJ3G5YQ94DiCbXsiR_xsz1z79tIyaKKhvaQ5N2HtPCUsi0sU8NAR0qDN3db9q5C_S5x2WIaz6Kkm2grpuHnpHkR-dKW-CKC7JUMIOV8PSMSBPh7VACQryJjPDSPNOyKxVkP59pbiS8DVEm00AJz6qHVwlORa8KErIyT6By9T6j3wbSswI9TMaH6MQTX-Ev3CYcDYRg', status: 'Active', memberSince: 'Feb 2023' },
    { id: '4', name: 'John Henry', email: 'j.henry@ecommerce.com', role: 'Editor', lastActive: '3 days ago', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP3QgYKje9s0CCW0q5iCdCnrgLneH6jdIg8g7ehcaFd5HYkf-e2VqXy91RCGC6ym3z28AsdTOpNbTTNNy0Bk80POk3RyPV90_YIaHnf3HE13CqgaMsR6aYA_k2vXTT0GhGAggfry_Q4-sotm6VJf36oofZL4Nd8t3dM2gfYMcScwUfrj8gPAcBItW3ueA_Y5DOzzmIdl2u7QJyWtEeqdfPNivckw2rRE7kXE_3yQnKteGtVlRoV14arPpq-awcXNP5m_ecQAzyA6Jc', status: 'Active', memberSince: 'Jun 2023' }
  ]);

  private globalSearchSubject = new BehaviorSubject<string>('');

  orders$ = this.ordersSubject.asObservable();
  users$ = this.usersSubject.asObservable();
  globalSearch$ = this.globalSearchSubject.asObservable();

  setGlobalSearch(query: string) {
    this.globalSearchSubject.next(query);
  }

  addOrder(order: Order) {
    const currentOrders = this.ordersSubject.getValue();
    this.ordersSubject.next([order, ...currentOrders]);
  }

  updateOrder(updatedOrder: Order) {
    const currentOrders = this.ordersSubject.getValue();
    const index = currentOrders.findIndex(o => o.id === updatedOrder.id);
    if (index !== -1) {
      currentOrders[index] = updatedOrder;
      this.ordersSubject.next([...currentOrders]);
    }
  }

  addUser(user: User) {
    const currentUsers = this.usersSubject.getValue();
    this.usersSubject.next([user, ...currentUsers]);
  }

  updateUser(updatedUser: User) {
    const currentUsers = this.usersSubject.getValue();
    const index = currentUsers.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      currentUsers[index] = { ...currentUsers[index], ...updatedUser };
      this.usersSubject.next([...currentUsers]);
    }
  }

  getOrders(status: string = 'All Orders', search: string = '') {
    return this.orders$.pipe(
      map(orders => orders.filter(order => {
        const matchesStatus = status === 'All Orders' || order.status === status;
        const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
                             order.customerName.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
      }))
    );
  }

  getUsers(role: string = 'All', search: string = '') {
    return this.users$.pipe(
      map(users => users.filter(user => {
        const matchesRole = role === 'All' || user.role === role;
        const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                             user.email.toLowerCase().includes(search.toLowerCase());
        return matchesRole && matchesSearch;
      }))
    );
  }
}
