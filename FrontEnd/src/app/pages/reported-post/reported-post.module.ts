import { NgModule } from '@angular/core';
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbRadioModule,
  NbSelectModule,
  NbListModule,
  NbIconModule,
  NbDialogModule,
  NbDatepickerModule,
} from '@nebular/theme';
import { ThemeModule } from '../../@theme/theme.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../../services/app.service';
import { ReportedPostRoutingModule, routedComponents } from './reported-post-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReportedPostComponent } from './reported-post.component';
import { ReportedPostListComponent } from './reported-post-list/reported-post-list.component';
import { ViewReportedPostComponent } from './view-reported-post/view-reported-post.component';

const components = [ReportedPostComponent, ViewReportedPostComponent, ReportedPostListComponent];

@NgModule({
  imports: [
    FormsModule,
    ThemeModule,
    NbCardModule,
    NbButtonModule,
    NbActionsModule,
    NbRadioModule,
    NbSelectModule,
    NbListModule,
    NbIconModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NbDialogModule.forChild(),
    ReportedPostRoutingModule,
    NbDatepickerModule,
  ],
  declarations: [
    ...routedComponents, ...components,
  ],
  providers: [AppService],
})
export class ReportedPostModule { }
