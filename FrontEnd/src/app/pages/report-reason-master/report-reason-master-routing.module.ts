import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportListComponent } from './report-list/report-list.component';
import { ReportReasonMasterComponent } from './report-reason-master.component';


const routes: Routes = [{
  path: '',
  component: ReportListComponent,
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportReasonMasterRoutingModule { }

export const routedComponents = [
  ReportReasonMasterComponent,
  ReportListComponent
];
