import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppService } from 'app/services/app.service';

import { ReportedCommentListComponent } from './reported-comment-list.component';

describe('ReportedCommentListComponent', () => {
  let component: ReportedCommentListComponent;
  let fixture: ComponentFixture<ReportedCommentListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportedCommentListComponent ],
      providers:[AppService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportedCommentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
