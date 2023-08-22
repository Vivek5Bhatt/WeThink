import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppService } from 'app/services/app.service';
import { ReportedPostListComponent } from './reported-post-list.component';

describe('ReportedPostListComponent', () => {
  let component: ReportedPostListComponent;
  let fixture: ComponentFixture<ReportedPostListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportedPostListComponent ],
      providers:[AppService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportedPostListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
