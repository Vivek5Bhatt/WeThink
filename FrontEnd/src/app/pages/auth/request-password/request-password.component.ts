import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../../services/app.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { urls } from '../../../global';

@Component({
  selector: 'ngx-request-password',
  templateUrl: './request-password.component.html',
  styleUrls: ['./request-password.component.scss']
})
export class NgxRequestPasswordComponent implements OnInit {
    redirectDelay: number;
    submitted: boolean = false;
    public data: UntypedFormGroup;

    constructor(
        private fb: UntypedFormBuilder,
        private appService: AppService,
        protected cd: ChangeDetectorRef,
        protected router: Router,
    ){}

    ngOnInit(){
        this.data = this.fb.group({
            email: ['', [Validators.required]]
        });
    }

    requestPassword(){
        this.submitted = true;
        if (this.data.valid) {
          this.appService.post(urls.forgotPassword, this.data.getRawValue()).subscribe(
            (response: any) => {
              if (response && response.response_code == 200) {
                this.appService.showToast('success', 'Success', response.message);                
                this.router.navigate(["/auth/login"]);
              }
            },
            (error) => {
              
            }
          );
        } else {
          return;
        }  
    }
}