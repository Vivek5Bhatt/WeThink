import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AcceptedReportedCommentListComponent } from './accepted-reported-comment-list/accepted-reported-comment-list.component';
import { AcceptedReportedCommentComponent } from './accepted-reported-comment.component';
import { EditAcceptedReportedCommentComponent } from './edit-accepted-reported-comment/edit-accepted-reported-comment.component';



const routes: Routes = [
  {
    path: '',
    component: AcceptedReportedCommentListComponent,
  },
  {
    path: 'edit',
    component: EditAcceptedReportedCommentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcceptedReportedCommentRoutingModule { }

export const routedComponents = [
  AcceptedReportedCommentComponent,
  AcceptedReportedCommentListComponent,
  EditAcceptedReportedCommentComponent
  
];
