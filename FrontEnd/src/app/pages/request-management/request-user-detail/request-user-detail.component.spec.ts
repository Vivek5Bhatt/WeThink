import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestUserDetailComponent } from './request-user-detail.component';

describe('RequestUserDetailComponent', () => {
  let component: RequestUserDetailComponent;
  let fixture: ComponentFixture<RequestUserDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestUserDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestUserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
