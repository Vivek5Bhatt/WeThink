import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../../services/app.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { urls } from '../../../global';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class NgxLoginComponent implements OnInit {
    redirectDelay: number;
    submitted: boolean = false;
    public data: UntypedFormGroup;

    constructor(
        private fb: UntypedFormBuilder,
        private appService: AppService,
        protected cd: ChangeDetectorRef,
        protected router: Router,
    ){

    }

    ngOnInit(){
        this.data = this.fb.group({
            email: ['', [Validators.required]],
            password: ['', [Validators.required]],
            // device_token: ['string'],
        });
    }

    login(){
        this.submitted = true;
        if (this.data.valid) {
          this.appService.post(urls.login, this.data.getRawValue()).subscribe(
            (response: any) => {
              if (response && response.response_code == 200 && response.result) {
                this.appService.showToast('success', 'Success', response.message);
                localStorage.setItem('userToken', response.result.token);
                localStorage.setItem('name', response.result.name);
                this.router.navigate(["question-management"]);
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