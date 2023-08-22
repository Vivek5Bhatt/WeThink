import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NbLayoutScrollService } from "@nebular/theme";
import { urls } from "app/global";
import { AppService } from "app/services/app.service";

interface verfiyRequestDate {
  id: number;
  username: string;
  name: string;
  email: string;
  phone_no: string;
  status: number;
}
@Component({
  selector: "ngx-request-management-list",
  templateUrl: "./request-management-list.component.html",
  styleUrls: ["./request-management-list.component.scss"],
})
export class RequestManagementListComponent implements OnInit {
  public pageNo: number = 1;
  public limit: number = 5;
  public config: any;
  public requestSearch: string = "";
  public colSpan: number = 7;
  public noData: boolean = true;
  public selectedStatus: number;
  public statusData: { [key: number]: string } = {
    0:"All",
    1: "Pending",
    2: "Verified",
    3: "Unverified",
    4: "Resubmitted",
  };

  public data: verfiyRequestDate[] = [];
  public statusType: any = 0;
 
  constructor(
    private router: Router,
    private appService: AppService,
    private layoutScrollService: NbLayoutScrollService,
    private cd:ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.limit = 5;
    this.config = {
      itemsPerPage: this.limit,
      currentPage: 1,
      totalItems: 0
    };
    this.requestSearch = "";
    this.getRequestManagementList();
  }

  getRequestManagementList() {

    let apiParmas;
      if( this.requestSearch.length>0 && this.selectedStatus>0 ){
        apiParmas =
        "?page_number=" +
        this.pageNo +
        "&limit=" +
        this.limit +
        "&status=" + 
        +this.selectedStatus +
        "&search=" +
        this.requestSearch;
      }else if(this.selectedStatus>0){
      apiParmas =
      "?page_number=" +
      this.pageNo +
      "&limit=" +
      this.limit +
      "&status=" 
      +this.selectedStatus
      }else{
        apiParmas =
      "?page_number=" +
      this.pageNo +
      "&limit=" +
      this.limit +
      "&search=" +
      this.requestSearch;
      }
     
    this.appService.get(urls.requestManagementList + apiParmas).subscribe(
      (response: any) => {
        if (response && response.response_code == 200 && response.result) {
          this.data = response.result.data;
          this.config.totalItems = response.result.total_count;
          this.config.currentPage = this.pageNo;
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

  selectedStatusValue(event) {
    this.selectedStatus = event;
    this.getRequestManagementList();
    
  }

  selectedLimitValue(event){
    this.limit = event;
    this.config.itemsPerPage = this.limit;
    this.getRequestManagementList();
    this.cd.detectChanges();
  }

  pageChanged(event) {
    this.pageNo = event;
    this.getRequestManagementList();
  }

  searchRequest(event){
    const value = event.target.value;
    this.pageNo = 1;
    this.config.currentPage = 1;
    if (value.length >= 1) {
      this.requestSearch = value.trim();
      this.requestSearch = this.requestSearch.toLowerCase();
      this.getRequestManagementList();
    } else {
      this.requestSearch = '';
      this.getRequestManagementList();
    }
  }

  clearSearch() {
    this.requestSearch = "";
    this.getRequestManagementList();
  }

  goToUserDetail(id) {
    this.router.navigate(["request-management/request-user-detail"], { queryParams: {request_id: id}});
  }
  
}
