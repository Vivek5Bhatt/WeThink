import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectResponsePromptComponent } from './reject-response-prompt.component';

describe('RejectResponsePromptComponent', () => {
  let component: RejectResponsePromptComponent;
  let fixture: ComponentFixture<RejectResponsePromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectResponsePromptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectResponsePromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
