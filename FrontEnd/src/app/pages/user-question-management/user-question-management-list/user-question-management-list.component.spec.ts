import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserQuestionManagementListComponent } from './user-question-management-list.component';

describe('UserListComponent', () => {
  let component: UserQuestionManagementListComponent;
  let fixture: ComponentFixture<UserQuestionManagementListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserQuestionManagementListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserQuestionManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
