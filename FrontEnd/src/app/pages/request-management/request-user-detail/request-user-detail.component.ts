import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { urls } from "app/global";
import { AppService } from "app/services/app.service";
import { Observable, Observer } from "rxjs";

interface RequestDetails {
  id: number;
  username: string;
  name: string;
  full_name: string;
  email: string;
  phone_no: number;
  known_as: string;
  status: string;
  category: string;
}

@Component({
  selector: "ngx-request-user-detail",
  templateUrl: "./request-user-detail.component.html",
  styleUrls: ["./request-user-detail.component.scss"],
})
export class RequestUserDetailComponent implements OnInit {
  public id: string = "Driving License";
  // public userProfile: boolean = false;
  public responses: string[] = [
    "hii",
    "hello",
    "bye",
    "evening",
    "wdguhd",
    "fefe",
    "mske",
    "avenger",
    "avenger3",
    "back",
    "suno",
    "bhago",
    "kyu",
  ];
  public duplicate: string[] = [
    "new",
    "duplicate",
    "array",
    "for",
    "infinite scroll",
    "testing",
  ];
  public scrollDistance: number = 1;
  public throttle: number = 50;
  requestId: any;
  requestDetails: any;
  base64Image: string;
  rejectReasonList: any;

  constructor(
    private appService: AppService,
    private cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.requestId = params["request_id"];
      this.getRequestDetail(this.requestId);
    });
  }

  getRequestDetail(requestId) {
    this.appService
      .get(urls.requestManagementDetails + "?id=" + requestId)
      .subscribe(
        (response: any) => {
          if (response && response.response_code == 200 && response.result) {
            this.requestDetails = response.result.data;
            this.rejectReasonList = response.result.reject_reasons;
          }
          this.cd.detectChanges();
        },
        (error) => {
          this.cd.detectChanges();
        }
      );
  }

  receiveMessage($event) {
    if ($event) {
      this.onProfileAction("reject", $event);
    }
  }

  scrollDown() {
    this.responses.push(...this.duplicate);
  }

  onProfileAction(action, reason?): void {
    let payload;
    if (action == "verify") {
      payload = {
        user_id: this.requestDetails.user_id,
        account_status: true,
      };
    } else {
      if (reason) {
        payload = {
          user_id: this.requestDetails.user_id,
          account_status: false,
          reject_reason: reason,
        };
      }
    }

    this.appService.patch(urls.requestProfileAction, payload).subscribe(
      (response: any) => {
        if (response && response.response_code == 200 && response.result) {
          this.appService.showToast("success", "Success", response.message);
          if (action == "verify") {
            this.router.navigate(["request-management"])
          } else {
            this.getRequestDetail(this.requestId);
          }
        }
        this.cd.detectChanges();
      },
      (error) => {
        this.cd.detectChanges();
      }
    );
  }

  onVerifiy() {
    let text = "Are you sure you want to verify this request?";

    if (window.confirm(text)) {
      this.onProfileAction("verify");
    }
  }

  openRejectReason() {
    document.getElementById("modal").style.display = "block";
  }

  downloadImage(imageUrl) {
    this.getBase64ImageFromURL(imageUrl).subscribe((base64data) => {
      this.base64Image = "data:image/jpg;base64," + base64data;
      var link = document.createElement("a");
      document.body.appendChild(link); // for Firefox

      link.setAttribute("href", this.base64Image);
      link.setAttribute("download", "mrHankey.jpg");
      link.click();
    });
  }

  getBase64ImageFromURL(url: string) {
    return Observable.create((observer: Observer<string>) => {
      const img: HTMLImageElement = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      if (!img.complete) {
        img.onload = () => {
          observer.next(this.getBase64Image(img));
          observer.complete();
        };
        img.onerror = (err) => {
          observer.error(err);
        };
      } else {
        observer.next(this.getBase64Image(img));
        observer.complete();
      }
    });
  }

  getBase64Image(img: HTMLImageElement) {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const dataURL: string = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }
}
