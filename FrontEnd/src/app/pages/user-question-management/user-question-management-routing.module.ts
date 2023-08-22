import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserQuestionManagementListComponent } from './user-question-management-list/user-question-management-list.component';
import { UserQuestionManagementComponent } from './user-question-management.component';
import { QuestionDetailComponent } from './question-detail/question-detail.component';

const routes: Routes = [{
    path: '',
    component: UserQuestionManagementListComponent,
  },{
    path: 'question-detail',
    component: QuestionDetailComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserQuestionManagementRoutingModule { }

export const routedComponents = [
  UserQuestionManagementListComponent,
  UserQuestionManagementComponent,
  QuestionDetailComponent
];
