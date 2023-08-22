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
import { UserManagementRoutingModule, routedComponents } from './user-management-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserListComponent } from './user-list/user-list.component';

const components = [UserDetailComponent, UserListComponent];

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
    UserManagementRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    
  ],
  declarations: [
	  ...routedComponents, ...components
  ],
  providers: [AppService]
})
export class UserManagementModule { }
