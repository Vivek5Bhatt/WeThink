import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewReportedPostComponent } from './view-reported-post/view-reported-post.component';
import { ReportedPostListComponent } from './reported-post-list/reported-post-list.component';
import { ReportedPostComponent } from './reported-post.component';

const routes: Routes = [
  {
    path: '',
    component: ReportedPostListComponent,
  },
  {
    path: 'view',
    component: ViewReportedPostComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportedPostRoutingModule { }

export const routedComponents = [
  ReportedPostComponent,
  ReportedPostListComponent,
  ViewReportedPostComponent
];
