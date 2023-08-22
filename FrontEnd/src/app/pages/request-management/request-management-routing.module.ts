import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RequestManagementListComponent } from './request-management-list/request-management-list.component';
import { RequestManagementComponent } from './request-management.component';
import { RequestUserDetailComponent } from './request-user-detail/request-user-detail.component';

const routes: Routes = [
  {
    path: '',
    component: RequestManagementListComponent,
  },
  {
    path: 'request-user-detail',
    component: RequestUserDetailComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestManagementRoutingModule { }

export const routedComponents = [
  RequestManagementListComponent,
  RequestUserDetailComponent,
  RequestManagementComponent
];