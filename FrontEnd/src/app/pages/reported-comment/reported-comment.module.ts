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
  NbIconModule,
  NbDialogModule,
} from '@nebular/theme';
import { ThemeModule } from '../../@theme/theme.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../../services/app.service';
import { ReportedCommentRoutingModule, routedComponents } from './reported-comment-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReportedCommentComponent } from './reported-comment.component';
import { ReportedCommentListComponent } from './reported-comment-list/reported-comment-list.component';
import { EditReportedCommentComponent } from './edit-reported-comment/edit-reported-comment.component';


const components = [ReportedCommentComponent, ReportedCommentListComponent];

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
    ReactiveFormsModule,
    NgxPaginationModule,
    NbDialogModule.forChild(),
    ReportedCommentRoutingModule
  ],
  declarations: [
    ...routedComponents, ...components, EditReportedCommentComponent,
  ],
  providers: [AppService],
})
export class ReportedCommentModule { }
