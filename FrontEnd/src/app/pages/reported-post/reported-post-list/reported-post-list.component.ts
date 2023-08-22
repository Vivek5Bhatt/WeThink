import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbLayoutScrollService } from '@nebular/theme';
import { urls } from 'app/global';
import { AppService } from 'app/services/app.service';

@Component({
  selector: 'ngx-reported-post-list',
  templateUrl: './reported-post-list.component.html',
  styleUrls: ['./reported-post-list.component.scss']
})
export class ReportedPostListComponent implements OnInit {
  pageNo: number = 1;
  limit: number = 10;
  config: any;
  data: any;
  noData: boolean = true;
  search: string = '';
  colSpan: number = 6;

  constructor(
    private appService: AppService,
    private layoutScrollService: NbLayoutScrollService,
    private cd: ChangeDetectorRef,
    private router :Router
  ) { }

  ngOnInit(): void {
    this.config = {
      itemsPerPage: this.limit,
      currentPage: 1,
      totalItems: 0
    };
    this.getReportedPostList();
  }
  
  getReportedPostList() {
    const apiParmas = '?page_number=' + this.pageNo + '&limit=' + this.limit + '&search=' + this.search;
    this.appService.get(urls.reportedPostList + apiParmas)
      .subscribe(
        (response: any) => {
          if (response && response.response_code == 200 && response.result) {
            this.config.totalItems = response.result.total_count;
            this.config.currentPage = this.pageNo;
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

  searchReportedPost(event) {
    const value = event.target.value;
    this.pageNo = 1;
    this.config.currentPage = 1;

    if (value.length >= 3) {
      // this.search = value.trim();
      this.search = value.toLowerCase();
      this.getReportedPostList();
    } else {
      this.search = '';
      this.getReportedPostList();
    }
  }

  clearSearch() {
    this.search = '';
    this.getReportedPostList();
  }

  pageChanged(event) {
    this.pageNo = event;
    this.getReportedPostList();
  }

  goToView(id) {
    this.router.navigate(["reported-post/view"], { queryParams: {id: id}});
  }

}
