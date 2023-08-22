import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditReportedCommentComponent } from './edit-reported-comment/edit-reported-comment.component';
import { ReportedCommentListComponent } from './reported-comment-list/reported-comment-list.component';
import { ReportedCommentComponent } from './reported-comment.component';


const routes: Routes = [
  {
    path: '',
    component: ReportedCommentListComponent,
  },
  {
    path: 'edit',
    component: EditReportedCommentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportedCommentRoutingModule { }

export const routedComponents = [
  ReportedCommentComponent,
  ReportedCommentListComponent,
  EditReportedCommentComponent
];
