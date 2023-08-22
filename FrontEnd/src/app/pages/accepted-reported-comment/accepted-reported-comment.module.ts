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
import { AcceptedReportedCommentRoutingModule, routedComponents } from './accepted-reported-comment-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { AcceptedReportedCommentListComponent } from './accepted-reported-comment-list/accepted-reported-comment-list.component';
import { AcceptedReportedCommentComponent } from './accepted-reported-comment.component';
import { EditAcceptedReportedCommentComponent } from './edit-accepted-reported-comment/edit-accepted-reported-comment.component';


const components = [AcceptedReportedCommentComponent, AcceptedReportedCommentListComponent,EditAcceptedReportedCommentComponent];

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
    AcceptedReportedCommentRoutingModule
  ],
  declarations: [
    ...routedComponents, ...components,
  ],
  providers: [AppService],
})
export class AcceptedReportedCommentModule { }
