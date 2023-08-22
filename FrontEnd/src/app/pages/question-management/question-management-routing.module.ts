import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuestionManagementListComponent } from './question-management-list/question-management-list.component';
import { QuestionManagementComponent } from './question-management.component';
import { AddQuestionComponent } from './add-question/add-question.component';
import { EditQuestionComponent } from './edit-question/edit-question.component';
import { ViewQuestionComponent } from './view-question/view-question.component';

const routes: Routes = [{
    path: '',
    component: QuestionManagementListComponent,
  },
  {
    path: 'add',
    component:AddQuestionComponent
  },
  {
    path: 'edit',
    component:EditQuestionComponent
  },
  {
    path: 'view',
    component:ViewQuestionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestionManagementRoutingModule { }

export const routedComponents = [
  QuestionManagementListComponent,
  QuestionManagementComponent
];
