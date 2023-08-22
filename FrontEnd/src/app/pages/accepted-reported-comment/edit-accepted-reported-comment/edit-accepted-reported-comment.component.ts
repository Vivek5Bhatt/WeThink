import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { urls } from 'app/global';
import { AppService } from 'app/services/app.service';

@Component({
  selector: 'ngx-edit-accepted-reported-comment',
  templateUrl: './edit-accepted-reported-comment.component.html',
  styleUrls: ['./edit-accepted-reported-comment.component.scss']
})
export class EditAcceptedReportedCommentComponent implements OnInit {

  public commentData: any;
  public id: string = '';

  constructor(
    private appService: AppService,
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.id = params['id'];
      this.getCommentDetail(this.id);
    });
  }

  ngOnInit() { }

  getCommentDetail(id) {
    this.appService.get(urls.reportedCommentDetail + '?id=' + id)
      .subscribe(
        (response: any) => {
          if (response && response.response_code == 200 && response.result) {
            this.commentData = response.result;
          }
          this.cd.detectChanges();
        },
        (error) => {
          this.cd.detectChanges();
        }
      );
  }
  goToUser(id) {
    this.router.navigate(["user-management/user-detail"], { queryParams: { user_id: id } });
  }
}
