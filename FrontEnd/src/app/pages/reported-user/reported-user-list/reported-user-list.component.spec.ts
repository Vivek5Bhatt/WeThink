import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { AppService } from "app/services/app.service";
import { ReportedUserListComponent } from "./reported-user-list.component";

describe("ReportedUserListComponent", () => {
  let component: ReportedUserListComponent;
  let fixture: ComponentFixture<ReportedUserListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ReportedUserListComponent],
      providers: [AppService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportedUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
