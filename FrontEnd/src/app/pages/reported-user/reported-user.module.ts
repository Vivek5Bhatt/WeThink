import { NgModule } from "@angular/core";
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
} from "@nebular/theme";
import { ThemeModule } from "../../@theme/theme.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppService } from "../../services/app.service";
import {
  ReportedUserRoutingModule,
  routedComponents,
} from "./reported-user-routing.module";
import { NgxPaginationModule } from "ngx-pagination";
import { ReportedUserComponent } from "./reported-user.component";
import { ReportedUserListComponent } from "./reported-user-list/reported-user-list.component";
import { ViewReportedUserComponent } from "./view-reported-user/view-reported-user.component";

const components = [
  ReportedUserComponent,
  ViewReportedUserComponent,
  ReportedUserListComponent,
];

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
    ReportedUserRoutingModule,
    NbDatepickerModule,
  ],
  declarations: [...routedComponents, ...components],
  providers: [AppService],
})
export class ReportedUserModule {}
