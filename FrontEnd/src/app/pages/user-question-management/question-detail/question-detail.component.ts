import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { urls } from '../../../global';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NbLayoutScrollService } from '@nebular/theme';

@Component({
  selector: 'ngx-question-detail',
  templateUrl: './question-detail.component.html',
  styleUrls: ['./question-detail.component.scss']
})
export class QuestionDetailComponent implements OnInit {
  public questionData: any;
  public questionId: string = '';
 
  constructor(
    private appService: AppService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private layoutScrollService: NbLayoutScrollService,
    
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.questionId = params['question_id'];
      this.getQuestionDetail(this.questionId);
    });
  }

  ngOnInit() {}

  getQuestionDetail(questionId) {
    this.appService.get(urls.questionDetail + '?question_id=' + questionId)
      .subscribe(
        (response: any) => {
          if (response && response.response_code == 200 && response.result) {
            this.questionData = response.result;
          }
          this.cd.detectChanges();
        },
        (error) => {
          this.cd.detectChanges();
        }
      );
  }
  goToUser(id){
    this.router.navigate(["user-management/user-detail"], { queryParams: {user_id: id}});
  }
}
