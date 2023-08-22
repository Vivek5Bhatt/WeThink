import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxAuthRoutingModule } from './auth-routing.module';
import { NbAuthModule } from '@nebular/auth';
import {
  NbAlertModule,
  NbButtonModule,
  NbCheckboxModule,
  NbInputModule,
  NbActionsModule,
  NbRadioModule,
  NbSelectModule,
} from '@nebular/theme';
import { NgxLoginComponent } from './login/login.component';
import { NgxRequestPasswordComponent } from './request-password/request-password.component';
import { NgxResetPasswordComponent } from './reset-password/reset-password.component';
import { ThemeModule } from '../../@theme/theme.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../../services/app.service';
import { NgxVerifyEmailComponent } from './verify-email/verify-email.component';
import { NgxHealthCheckComponent } from './health-check/health-check.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NbAlertModule,
    NbInputModule,
    NbButtonModule,
    NbCheckboxModule,
    NbActionsModule,
    NbButtonModule,
    NbRadioModule,
    NbSelectModule,
    NgxAuthRoutingModule,
    ThemeModule,
    NbAuthModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    NgxLoginComponent,
    NgxRequestPasswordComponent,
    NgxResetPasswordComponent,
    NgxVerifyEmailComponent,
    NgxHealthCheckComponent
  ],
  providers: [AppService]
})
export class NgxAuthModule {
}