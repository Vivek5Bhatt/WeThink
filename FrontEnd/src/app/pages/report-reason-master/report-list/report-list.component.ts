import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService, NbLayoutScrollService } from '@nebular/theme';
import { urls } from 'app/global';
import { AppService } from 'app/services/app.service';
import { DialogNamePromptComponent } from '../dialog-name-prompt/dialog-name-prompt.component';

@Component({
  selector: 'ngx-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent implements OnInit {
  pageNo: number = 1;
  limit: number = 10;
  reportConfig: any;
  data: any;
  noData: boolean = true;
  search: string = '';
  colSpan: number = 6;
  names: any;


  constructor(
    private appService: AppService,
    private layoutScrollService: NbLayoutScrollService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private dialogService: NbDialogService
  ) { }

  ngOnInit(): void {
    this.reportConfig = {
      itemsPerPage: this.limit,
      currentPage: 1,
      totalItems: 0
    };
    this.getReportList();
  }

  getReportList() {
    const apiParmas = '?page_number=' + this.pageNo + '&limit=' + this.limit + '&type=1' + '&search=' + this.search
    this.appService.get(urls.reportList + apiParmas)
      .subscribe(
        (response: any) => {
          if (response && response.response_code == 200 && response.result) {
            this.reportConfig.totalItems = response.result.total_count;
            this.reportConfig.currentPage = this.pageNo;
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

  searchReport(event) {
    const value = event.target.value;
    this.pageNo = 1;
    this.reportConfig.currentPage = 1;
    if (value.length >= 3) {
      // this.search = value.trim();
      this.search = value.toLowerCase();
      this.getReportList();
    } else {
      this.search = '';
      this.getReportList();
    }
  }

  clearSearch() {
    this.search = '';
    this.getReportList();
  }

  pageChanged(event) {
    this.pageNo = event;
    this.getReportList();
  }

  goToEdit(id, name, key) {
    if (key) {
      this.dialogService.open(DialogNamePromptComponent, {
        context: {
          id: id,
          name: name,
          key: key
        },
      })
        .onClose.subscribe(res => this.getReportList());
    } else {
      this.dialogService.open(DialogNamePromptComponent, {
        context: {},
      })
        .onClose.subscribe(res => this.getReportList());
    }
  }

  onDelete(id): void {
    let text = 'Are you sure you want to delete this reason?';
    if (window.confirm(text)) {
      this.appService.delete(urls.reportDelete + '?id=' + id)
        .subscribe(
          (response: any) => {
            if (response && response.response_code == 200 && response.result) {
              this.appService.showToast('success', 'Success', response.message);
              this.getReportList();
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
