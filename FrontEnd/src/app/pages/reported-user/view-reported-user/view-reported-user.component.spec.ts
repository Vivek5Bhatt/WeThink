import { HttpClientModule } from "@angular/common/http";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { AppService } from "app/services/app.service";
import { ViewReportedUserComponent } from "./view-reported-user.component";

describe("ViewReportedUserComponent", () => {
  let component: ViewReportedUserComponent;
  let fixture: ComponentFixture<ViewReportedUserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [ViewReportedUserComponent],
      providers: [AppService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewReportedUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
