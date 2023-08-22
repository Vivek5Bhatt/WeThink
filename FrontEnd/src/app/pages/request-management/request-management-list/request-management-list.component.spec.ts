import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestManagementListComponent } from './request-management-list.component';

describe('RequestManagementListComponent', () => {
  let component: RequestManagementListComponent;
  let fixture: ComponentFixture<RequestManagementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestManagementListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
