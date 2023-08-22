import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbLayoutScrollService } from '@nebular/theme';
import { urls } from 'app/global';
import { AppService } from 'app/services/app.service';

@Component({
  selector: 'ngx-accepted-reported-comment-list',
  templateUrl: './accepted-reported-comment-list.component.html',
  styleUrls: ['./accepted-reported-comment-list.component.scss']
})
export class AcceptedReportedCommentListComponent implements OnInit {
  pageNo: number = 1;
  limit: number = 10;
  conf: any;
  data: any;
  noData: boolean = true;
  search: string = '';
  colSpan: number = 6;
  names: any;


  constructor(
    private appService: AppService,
    private layoutScrollService: NbLayoutScrollService,
    private cd: ChangeDetectorRef,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.conf = {
      itemsPerPage: this.limit,
      currentPage: 1,
      totalItems: 0
    };
    this.getAcceptedReportedCommentList();
  }

  getAcceptedReportedCommentList() {
    const apiParmas = '?page_number=' + this.pageNo + '&limit=' + this.limit + '&report_status=2' + '&type=1' + '&search=' + this.search
    this.appService.get(urls.reportedCommentList + apiParmas)
      .subscribe(
        (response: any) => {
          if (response && response.response_code == 200 && response.result) {
            this.conf.totalItems = response.result.total_count;
            this.conf.currentPage = this.pageNo;
            this.data = response.result.data;
            this.layoutScrollService.scrollTo(0, 0);
            if (this.data.length > 0) {
              this.noData = false;
            } else {
              this.noData = true;
            }
          }
          this.cd.detectChanges();
        },
        (error) => {
          this.cd.detectChanges();
        }
      );
  }

  searchAcceptReport(event) {
    const value = event.target.value;
    this.pageNo = 1;
    this.conf.currentPage = 1;
    if (value.length >= 3) {
      // this.search = value.trim();
      this.search = value.toLowerCase();
      this.getAcceptedReportedCommentList();
    } else {
      this.search = '';
      this.getAcceptedReportedCommentList();
    }
  }

  clearSearch() {
    this.search = '';
    this.getAcceptedReportedCommentList();
  }

  pageChanged(event) {
    this.pageNo = event;
    this.getAcceptedReportedCommentList();
  }
    goToView(id) {
    this.router.navigate(["accepted-reported-comment/edit"], { queryParams: {id: id}});
  }
}
