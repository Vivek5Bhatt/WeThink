import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NbLayoutScrollService } from "@nebular/theme";
import { urls } from "app/global";
import { AppService } from "app/services/app.service";

@Component({
  selector: "ngx-reported-user-list",
  templateUrl: "./reported-user-list.component.html",
  styleUrls: ["./reported-user-list.component.scss"],
})
export class ReportedUserListComponent implements OnInit {
  pageNo: number = 1;
  limit: number = 10;
  config: any;
  data: any;
  noData: boolean = true;
  search: string = "";
  colSpan: number = 6;

  constructor(
    private appService: AppService,
    private layoutScrollService: NbLayoutScrollService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.config = {
      itemsPerPage: this.limit,
      currentPage: 1,
      totalItems: 0,
    };
    this.getReportedUserList();
  }

  getReportedUserList() {
    const apiParmas =
      "?page_number=" +
      this.pageNo +
      "&limit=" +
      this.limit +
      "&search=" +
      this.search;
    this.appService.get(urls.reportedUserList + apiParmas).subscribe(
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

  searchReportedUser(event) {
    const value = event.target.value;
    this.pageNo = 1;
    this.config.currentPage = 1;

    if (value.length >= 3) {
      // this.search = value.trim();
      this.search = value.toLowerCase();
      this.getReportedUserList();
    } else {
      this.search = "";
      this.getReportedUserList();
    }
  }

  clearSearch() {
    this.search = "";
    this.getReportedUserList();
  }

  pageChanged(event) {
    this.pageNo = event;
    this.getReportedUserList();
  }

  goToView(id) {
    this.router.navigate(["reported-user/view"], { queryParams: { id: id } });
  }
}
