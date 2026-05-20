import { Routes } from '@angular/router';
import { CustomerSearchComponent } from './components/customer-search/customer-search';

export const routes: Routes = [
  { path: '', component: CustomerSearchComponent },
  { path: '**', redirectTo: '' }
];
