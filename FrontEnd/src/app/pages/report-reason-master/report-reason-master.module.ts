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
import { ReportReasonMasterRoutingModule, routedComponents } from './report-reason-master-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReportListComponent } from './report-list/report-list.component';
import { DialogNamePromptComponent } from './dialog-name-prompt/dialog-name-prompt.component';

const components = [ReportListComponent,DialogNamePromptComponent];

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
        ReportReasonMasterRoutingModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        NbDialogModule.forChild(),
    ],
    declarations: [
        ...routedComponents, ...components,
    ],
    providers: [AppService]
})
export class ReportReasonMasterModule { }
