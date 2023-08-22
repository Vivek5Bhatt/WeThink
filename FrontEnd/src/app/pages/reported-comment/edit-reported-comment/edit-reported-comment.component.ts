import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { urls } from 'app/global';
import { AppService } from 'app/services/app.service';

@Component({
  selector: 'ngx-edit-reported-comment',
  templateUrl: './edit-reported-comment.component.html',
  styleUrls: ['./edit-reported-comment.component.scss']
})
export class EditReportedCommentComponent implements OnInit {

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

  updateReportedComment(status) {
    this.appService.patch(urls.updateReportedComment, { id: this.id, report_status: status, }).subscribe(
      (response: any) => {
        if (response && response.response_code == 200) {
          this.appService.showToast('success', 'Success', response.message);
          this.router.navigate(["/reported-comment"]);
        }
      },
      (error) => { }
    );
  }

}
