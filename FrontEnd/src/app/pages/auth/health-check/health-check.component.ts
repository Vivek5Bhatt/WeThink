import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { urls } from '../../../global';

@Component({
  selector: 'ngx-health-check',
  templateUrl: './health-check.component.html',
  styleUrls: ['./health-check.component.scss']
})
export class NgxHealthCheckComponent implements OnInit {

  constructor(
    private appService: AppService,
  ) { }

  public healthCheckDetail: any;

  ngOnInit(): void {
    this.getHealthCheckDetail();
  }

  getHealthCheckDetail() {
    this.appService.get(urls.healthCheck).subscribe((res: any) => {
      this.healthCheckDetail = res?.status;
    })
  }

}
