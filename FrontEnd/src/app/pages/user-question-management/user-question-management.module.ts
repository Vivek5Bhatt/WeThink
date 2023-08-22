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
import { UserQuestionManagementRoutingModule, routedComponents } from './user-question-management-routing.module';
import { UserQuestionManagementListComponent } from './user-question-management-list/user-question-management-list.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { QuestionDetailComponent } from './question-detail/question-detail.component';


const components = [UserQuestionManagementListComponent,QuestionDetailComponent];

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
    UserQuestionManagementRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    
  ],
  declarations: [
	  ...routedComponents, ...components
  ],
  providers: [AppService]
})
export class UserQuestionManagementModule { }
