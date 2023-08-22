import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {  UserManagementComponent} from './user-management.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserListComponent } from './user-list/user-list.component';

const routes: Routes = [
  {
    path: '',
    component: UserListComponent,
  },
  {
    path: 'user-detail',
    component: UserDetailComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }

export const routedComponents = [
  UserDetailComponent,
  UserManagementComponent,
  UserListComponent
];
