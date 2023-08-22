import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuestionManagementListComponent } from './question-management-list.component';

describe('UserListComponent', () => {
  let component: QuestionManagementListComponent;
  let fixture: ComponentFixture<QuestionManagementListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionManagementListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
