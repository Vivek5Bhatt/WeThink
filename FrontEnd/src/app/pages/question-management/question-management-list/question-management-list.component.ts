import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { urls, data } from '../../../global';
import { Router } from '@angular/router';
import { NbLayoutScrollService } from '@nebular/theme';
import { UntypedFormControl } from '@angular/forms';
@Component({
  selector: 'ngx-question-management-list',
  templateUrl: './question-management-list.component.html',
  styleUrls: ['./question-management-list.component.scss']
})
export class QuestionManagementListComponent implements OnInit {

  data: any;
  // public categoryData:any;
  pageNo: number = 1;
  limit: number = 10;
  search: string = '';
  colSpan: number = 6;
  config: any;
  noData: boolean = true;
  selectedItemFormControl = new UntypedFormControl();
  public categoryId:number;
  constructor(
    private appService: AppService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private layoutScrollService: NbLayoutScrollService,
  ) {
    
  }

  ngOnInit(){
    this.config = {
      itemsPerPage: this.limit,
      currentPage: 1,
      totalItems: 0
    };
    // this.getCategoryList();
    this.getQuestionList();
  }

  // getCategoryList(){
  //   this.appService.get(urls.categoryList)
  //   .subscribe(
  //     (response: any) => {
  //       if (response && response.response_code == 200 && response.result) {         
  //         this.categoryData = response.result;
  //         this.categoryData = this.categoryData.filter( x => x.category_name == data.wtCategoryName );
  //       }
  //       this.cd.detectChanges();
  //     },
  //     (error) => {
  //       this.cd.detectChanges();
  //     }
  //   );
  // }

  onDeleteConfirm(id): void {
    let text = 'Are you sure you want to delete this question?';   
    if (window.confirm(text)) {      
      this.appService.delete(urls.deleteQuestion + '?question_id=' +id)
      .subscribe(
        (response: any) => {
          if (response && response.response_code == 200 && response.result) {
            this.appService.showToast('success', 'Success', response.message);
            this.getQuestionList();
          }
          this.cd.detectChanges();
        },
        (error) => {
          this.cd.detectChanges();
        }
      );
    }
  }

  getQuestionList(){ 
    let apiParmas;
    if(this.categoryId){
       apiParmas ='?page_number=' + this.pageNo + '&limit=' + this.limit + '&category_id=' + this.categoryId+ '&type=1'+ '&search=' +this.search
    }else{
       apiParmas ='?page_number=' + this.pageNo + '&limit=' + this.limit+ '&type=1'+ '&search=' +this.search
    }  
    this.appService.get(urls.questionsList + apiParmas)
      .subscribe(
        (response: any) => {
          if (response && response.response_code == 200 && response.result) {
            this.config.totalItems = response.result.total_count;
            this.config.currentPage = this.pageNo;
            this.data = response.result.data;
            this.layoutScrollService.scrollTo(0, 0);
            if( this.data.length > 0 ){
              this.noData  = false;
            } else{
              this.noData  = true;
            }
          }
          this.cd.detectChanges();
        },
        (error) => {
          this.cd.detectChanges();
        }
      );
  }  

  pageChanged(event){
    this.pageNo = event;
    this.getQuestionList();
  }

  goToEdit(id){
    this.router.navigate(["question-management/edit"], { queryParams: {question_id: id}});
  }

  viewQuestion(id){
    this.router.navigate(["question-management/view"], { queryParams: {question_id: id}});
  }

  changeCategory(event){
    this.categoryId = event;
    this.getQuestionList();
  }

  searchUser(event){
    const value = event.target.value;
    this.pageNo = 1;
    this.config.currentPage = 1;
    if (value.length >= 3) {
      // this.search = value.trim();
      this.search = value.toLowerCase();
      this.getQuestionList();
    } else {
      this.search = '';
      this.getQuestionList();
    }
  }

  clearSearch(){
    this.search = '';
    this.getQuestionList();
  }

}
