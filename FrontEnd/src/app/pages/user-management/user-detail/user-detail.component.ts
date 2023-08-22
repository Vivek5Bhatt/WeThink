import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { urls } from '../../../global';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'ngx-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  public userData: any;
  public userId: string = '';
 
  constructor(
    private appService: AppService,
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.userId = params['user_id'];
      this.getUserDetail(this.userId);
    });
  }

  ngOnInit() {}

  getUserDetail(userId) {
    this.appService.get(urls.userProfile + '?user_id=' + userId)
      .subscribe(
        (response: any) => {
          if (response && response.response_code == 200 && response.result) {
            this.userData = response.result;
          }
          this.cd.detectChanges();
        },
        (error) => {
          this.cd.detectChanges();
        }
      );
  }
  
}
