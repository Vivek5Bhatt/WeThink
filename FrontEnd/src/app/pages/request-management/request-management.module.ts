import { NgModule } from '@angular/core';
import { RequestManagementRoutingModule, routedComponents } from './request-management-routing.module';
import { RequestManagementListComponent } from './request-management-list/request-management-list.component';
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbTabsetModule,
  NbRadioModule,
  NbSelectModule,
  NbListModule,
  NbIconModule,
  NbDialogModule,
} from '@nebular/theme';
import { ThemeModule } from '../../@theme/theme.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AppService } from 'app/services/app.service';
import { RejectResponsePromptComponent } from './reject-response-prompt/reject-response-prompt.component';
import { RequestUserDetailComponent } from './request-user-detail/request-user-detail.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
const components = [RequestManagementListComponent, RequestUserDetailComponent, RejectResponsePromptComponent]
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
        RequestManagementRoutingModule,
        NbDialogModule.forChild(),
        InfiniteScrollModule,
    ],
    declarations: [
        ...routedComponents, ...components
    ],
    providers: [AppService]
})
export class RequestManagementModule {
  constructor() {
    console.log("Request module loaded")
  }
}
