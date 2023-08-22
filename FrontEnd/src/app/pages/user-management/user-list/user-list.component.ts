import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { urls } from 'app/global';
import { AppService } from 'app/services/app.service';
import { NbLayoutScrollService } from '@nebular/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  pageNo: number = 1;
  limit: number = 10;
  userConfig: any;
  data: any;
  noData: boolean = true;
  userSearch: string = '';
  colSpan: number = 6;


  constructor(
    private appService: AppService,
    private layoutScrollService: NbLayoutScrollService,
    private cd: ChangeDetectorRef,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.userConfig = {
      itemsPerPage: this.limit,
      currentPage: 1,
      totalItems: 0
    };
    this.getUserList();
  }

  getUserList() {
    const apiParmas = '?page_number=' + this.pageNo + '&limit=' + this.limit + '&search=' + this.userSearch
    this.appService.get(urls.userList + apiParmas)
      .subscribe(
        (response: any) => {
          if (response && response.response_code == 200 && response.result) {
            this.userConfig.totalItems = response.result.total_count;
            this.userConfig.currentPage = this.pageNo;
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

  searchUser(event) {
    const value = event.target.value;
    this.pageNo = 1;
    this.userConfig.currentPage = 1;
    if (value.length >= 3) {
      // this.userSearch = value.trim();
      this.userSearch = value.toLowerCase();
      this.getUserList();
    } else {
      this.userSearch = '';
      this.getUserList();
    }
  }

  clearSearch() {
    this.userSearch = '';
    this.getUserList();
  }

  pageChanged(event) {
    this.pageNo = event;
    this.getUserList();
  }

  goToEdit(id) {
    this.router.navigate(["user-management/user-detail"], { queryParams: { user_id: id } });
  }

  onDeleteSuspendConfirm(id: string, status: number): void {
    let check: string;
    if (status === 1) {
      check = 'suspend'
    } else if (status === 2) {
      check = 'delete'
    } else if (status === 3) {
      check = 'restore'
    }
    let text = `Are you sure you want to ${check} this user?`;
    if (window.confirm(text)) {
      this.appService.put(urls.deleteSuspendUser, { user_id: id, account_status: status })
        .subscribe(
          (response: any) => {
            if (response && response.response_code == 200 && response.result) {
              this.appService.showToast('success', 'Success', response.message);
              this.getUserList();
            }
            this.cd.detectChanges();
          },
          (error) => {
            this.cd.detectChanges();
          }
        );
    }
  }

}
