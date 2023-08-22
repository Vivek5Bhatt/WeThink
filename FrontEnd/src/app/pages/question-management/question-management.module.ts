import { NgModule } from '@angular/core';
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbTabsetModule,
  // NbUserModule,
  NbRadioModule,
  NbSelectModule,
  NbListModule,
  NbIconModule
} from '@nebular/theme';
import { ThemeModule } from '../../@theme/theme.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../../services/app.service';
import { QuestionManagementRoutingModule, routedComponents } from './question-management-routing.module';
import { QuestionManagementListComponent } from './question-management-list/question-management-list.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { AddQuestionComponent } from './add-question/add-question.component';
import { EditQuestionComponent } from './edit-question/edit-question.component';
import { ViewQuestionComponent } from './view-question/view-question.component';

const components = [
  QuestionManagementListComponent,
  AddQuestionComponent,
  EditQuestionComponent,
  ViewQuestionComponent
];

@NgModule({
  imports: [
    FormsModule,
    ThemeModule,
    NbCardModule,
    NbButtonModule,
    NbTabsetModule,
    NbActionsModule,
    NbRadioModule,
    NbSelectModule,
    NbListModule,
    NbIconModule,
    QuestionManagementRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,

  ],
  declarations: [
    ...routedComponents, ...components, ViewQuestionComponent
  ],
  providers: [AppService]
})
export class QuestionManagementModule { }
