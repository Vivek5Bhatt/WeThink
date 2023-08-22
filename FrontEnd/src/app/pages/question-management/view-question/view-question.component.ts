import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { urls, data } from '../../../global';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'ngx-view-question',
  templateUrl: './view-question.component.html',
  styleUrls: ['./view-question.component.scss']
})
export class ViewQuestionComponent implements OnInit {

  constructor(
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
  ) { }

  public questionId;
  public questionDetail: any;

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.questionId = params['question_id'];
      this.getQuestionDetail(this.questionId);
    });
  }

  getQuestionDetail(id) {
    this.appService.get(urls.getQuestionDetail + '?question_id=' + id).subscribe((res: any) => {
      this.questionDetail = res;
    })
  }

}
