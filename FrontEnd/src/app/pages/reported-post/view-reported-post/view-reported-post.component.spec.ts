import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppService } from 'app/services/app.service';
import { ViewReportedPostComponent } from './view-reported-post.component';

describe('ViewReportedPostComponent', () => {
  let component: ViewReportedPostComponent;
  let fixture: ComponentFixture<ViewReportedPostComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule],
      declarations: [ ViewReportedPostComponent ],
      providers:[AppService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewReportedPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
