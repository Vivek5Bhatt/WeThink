import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppService } from 'app/services/app.service';

import { AcceptedReportedCommentListComponent } from './accepted-reported-comment-list.component';

describe('AcceptedReportedCommentListComponent', () => {
  let component: AcceptedReportedCommentListComponent;
  let fixture: ComponentFixture<AcceptedReportedCommentListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AcceptedReportedCommentListComponent ,
      HttpClientModule],
      providers:[AppService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptedReportedCommentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
