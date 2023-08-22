import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { urls } from "app/global";
import { AppService } from "app/services/app.service";
import { NbDateService } from "@nebular/theme";

@Component({
  selector: "ngx-view-reported-user",
  templateUrl: "./view-reported-user.component.html",
  styleUrls: ["./view-reported-user.component.scss"],
})
export class ViewReportedUserComponent implements OnInit {
  public userData: any;
  public rejectedReasonsData: any;
  public reportedData: any;
  public repliedAllMessageData: any;
  public id: string = "";
  public pageNo: number = 1;
  public limit: number = 10;
  public config: any;
  public noData: boolean = true;
  public search: string = "";
  public colSpan: number = 5;
  public sortType: number = 1;
  public startDate: Date;
  public endDate: Date;
  public max: any = this.dateService.today();
  public reason: string = "";
  public reasonError: boolean = false;

  constructor(
    private appService: AppService,
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    protected dateService: NbDateService<Date>
  ) {
    this.config = {
      itemsPerPage: this.limit,
      currentPage: 1,
      totalItems: 0,
    };
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.id = params["id"];
      this.getUserDetail(this.id);
    });
  }

  ngOnInit() {}

  getUserDetail(id) {
    let startDate = "";
    let endDate = "";

    if (this.startDate) {
      startDate = "&start_date=" + this.startDate.getTime();
    }

    if (this.endDate) {
      endDate = "&end_date=" + (this.endDate.getTime() + 1000 * 60 * 60 * 24);
    }

    this.appService
      .get(
        urls.reportedUserDetail +
          "?user_id=" +
          id +
          "&page_number=" +
          this.pageNo +
          "&limit=" +
          this.limit
      )
      .subscribe(
        (response: any) => {
          if (response && response.response_code == 200 && response.result) {
            this.reportedData = response.result.reported_data;
            this.userData = response.result.users_data;
            this.rejectedReasonsData = response.result.rejected_reasons;
            this.repliedAllMessageData = response.result.replied_all_message;

            if (this.userData.length > 0) {
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

  updateReportedUser(status) {
    var confirmData = true;
    this.reasonError = false;

    if (status == 2) {
      if (
        !confirm(
          "Are you sure you want to accept the reported request of this User?"
        )
      ) {
        confirmData = false;
      }
    }

    if (confirmData) {
      if (status != 2 && this.reason.trim() == "") {
        this.reasonError = true;
        return false;
      }

      this.appService
        .patch(urls.changeReportedUserStatus, {
          id: this.id,
          report_status: status,
          reject_reason: this.reason,
        })
        .subscribe(
          (response: any) => {
            if (response && response.response_code == 200) {
              this.closeRejectReason();
              this.appService.showToast("success", "Success", response.message);
              this.router.navigate(["/reported-user"]);
            }
          },
          (error) => {
            console.log("Update Report User", error);
          }
        );
    }
  }

  searchUser(event) {
    const value = event.target.value;
    this.pageNo = 1;
    this.config.currentPage = 1;

    if (value.length >= 3) {
      // this.search = value.trim();
      this.search = value.toLowerCase();
    } else {
      this.search = "";
    }
  }

  clearSearch() {
    this.search = "";
  }

  pageChanged(event) {
    this.pageNo = event;
    this.getUserDetail(this.id);
  }

  changeOrder() {
    if (this.sortType == 1) {
      this.sortType = 2;
    } else {
      this.sortType = 1;
    }
    this.getUserDetail(this.id);
  }

  openRejectReason() {
    document.getElementById("modal").style.display = "block";
  }

  closeRejectReason() {
    document.getElementById("modal").style.display = "none";
  }
}
