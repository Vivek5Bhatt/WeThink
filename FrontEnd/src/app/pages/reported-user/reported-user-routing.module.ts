import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ViewReportedUserComponent } from "./view-reported-user/view-reported-user.component";
import { ReportedUserListComponent } from "./reported-user-list/reported-user-list.component";
import { ReportedUserComponent } from "./reported-user.component";

const routes: Routes = [
  {
    path: "",
    component: ReportedUserListComponent,
  },
  {
    path: "view",
    component: ViewReportedUserComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportedUserRoutingModule {}

export const routedComponents = [
  ReportedUserComponent,
  ReportedUserListComponent,
  ViewReportedUserComponent,
];
