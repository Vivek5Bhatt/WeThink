import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { PagesComponent } from "./pages.component";
import { AuthGuard } from "../guard/auth-guard";
const routes: Routes = [
  {
    path: "",
    component: PagesComponent,
    children: [
      {
        path: "accepted-reported-comment",
        loadChildren: () =>
          import(
            "./accepted-reported-comment/accepted-reported-comment.module"
          ).then((m) => m.AcceptedReportedCommentModule),
        canActivate: [AuthGuard],
      },
      {
        path: "reported-comment",
        loadChildren: () =>
          import("./reported-comment/reported-comment.module").then(
            (m) => m.ReportedCommentModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: "report-reason-master",
        loadChildren: () =>
          import("./report-reason-master/report-reason-master.module").then(
            (m) => m.ReportReasonMasterModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: "question-management",
        loadChildren: () =>
          import("./question-management/question-management.module").then(
            (m) => m.QuestionManagementModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: "user-question-management",
        loadChildren: () =>
          import(
            "./user-question-management/user-question-management.module"
          ).then((m) => m.UserQuestionManagementModule),
        canActivate: [AuthGuard],
      },
      {
        path: "user-management",
        loadChildren: () =>
          import("./user-management/user-management.module").then(
            (m) => m.UserManagementModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: "reported-post",
        loadChildren: () =>
          import("./reported-post/reported-post.module").then(
            (m) => m.ReportedPostModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: "reported-user",
        loadChildren: () =>
          import("./reported-user/reported-user.module").then(
            (m) => m.ReportedUserModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: "",
        loadChildren: () =>
          import("./question-management/question-management.module").then(
            (m) => m.QuestionManagementModule
          ),
        canActivate: [AuthGuard],
      },
      {
        path: "request-management",
        loadChildren: () =>
          import("./request-management/request-management.module").then(
            (m) => m.RequestManagementModule
          ),
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
