import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppService } from 'app/services/app.service';

import { EditAcceptedReportedCommentComponent } from './edit-accepted-reported-comment.component';

describe('EditAcceptedReportedCommentComponent', () => {
  let component: EditAcceptedReportedCommentComponent;
  let fixture: ComponentFixture<EditAcceptedReportedCommentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule],
      declarations: [ EditAcceptedReportedCommentComponent ],
      providers:[AppService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAcceptedReportedCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
