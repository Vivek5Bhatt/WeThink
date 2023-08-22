import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../../services/app.service';
import { UntypedFormBuilder } from '@angular/forms';
import { urls } from '../../../global';

@Component({
  selector: 'ngx-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class NgxVerifyEmailComponent implements OnInit { 
  public token:any;  
  public message:boolean=false;
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
      this.verifyEmail();
    }
  });
}
    ngOnInit(){
      
    }

    verifyEmail(){
      const param = {
        token: this.token
      };

      this.appService.put(urls.verifyEmail, param).subscribe(
        (response: any) => {
          if (response && response.response_code == 200) {
            this.message= true;            
          }
        },
        (error) => {}
      );
    }
}