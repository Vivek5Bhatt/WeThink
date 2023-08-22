import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../services/app.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { urls } from '../../../global';

@Component({
  selector: 'ngx-request-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class NgxResetPasswordComponent implements OnInit {
    public redirectDelay: number;
    public submitted: boolean = false;
    public data: UntypedFormGroup;
    public token:string;

    constructor(
        private fb: UntypedFormBuilder,
        private appService: AppService,
        protected cd: ChangeDetectorRef,
        protected router: Router,
        private _routeParams: ActivatedRoute,
    ){
      this._routeParams.queryParams.subscribe(params => {
        this.token = params['token'];     
        if(this.token){
          let clean_uri = location.protocol + "//" + location.host + location.pathname;
          window.history.replaceState({}, document.title, clean_uri);
        }
      });
    }

    ngOnInit() {
      this.data = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirm_password: ['', [Validators.required, Validators.minLength(6)]]
      }, {
        validator: Validators.compose([          
         this.newPasswordMatchesConfirmPassword
        ])
      });
    }

    newPasswordMatchesConfirmPassword(group: UntypedFormGroup){
      var confirmPassword = group.controls['confirm_password'];
      if(group.controls['confirm_password'].value == ''){
          confirmPassword.setErrors({ required: true });
      }
      else if(group.controls['confirm_password'].value < 6){
          confirmPassword.setErrors({ minlength: true });
      }
      else if(group.controls['password'].value !== confirmPassword.value){
          confirmPassword.setErrors({ newPasswordMatchesConfirmPassword: true });
      }
      return null;
    }
    
    changePassword(){
      this.submitted = true;
        if (this.data.valid) {
          const param = {
            token: this.token,
            password: this.data.value.password,
            confirm_password: this.data.value.confirm_password,
          };
  
          this.appService.put(urls.changePassword, param).subscribe(
            (response: any) => {
              if (response && response.response_code == 200) {
                this.data.reset();
                this.appService.showToast('success', 'Success', 'Your password has been changed successfully, you can login in the application now.');
                // this.router.navigate(["/auth/login"]);
              }
            },
            (error) => {}
          );
        } 
    }
}