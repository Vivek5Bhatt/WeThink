import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { urls } from 'app/global';
import { AppService } from 'app/services/app.service';

@Component({
  selector: 'ngx-dialog-name-prompt',
  templateUrl: 'dialog-name-prompt.component.html',
  styleUrls: ['dialog-name-prompt.component.scss'],
})
export class DialogNamePromptComponent {
  @Input() id: string;
  @Input() name: string;
  @Input() key: boolean

  constructor(
    protected ref: NbDialogRef<DialogNamePromptComponent>,
    private appService: AppService,

  ) { }

  cancel() {
    this.ref.close();
  }

  addAndUpdateReason() {
    if (this.key) {
      this.appService.patch(urls.updateReport, { id: this.id, name: this.name, }).subscribe(
        (response: any) => {
          if (response && response.response_code == 200) {
            this.appService.showToast('success', 'Success', response.message);
            this.ref.close();
          }
        },
        (error) => { }
      );
    } else {
      this.appService.post(urls.addReport, { name: this.name, type: 1 }).subscribe(
        (response: any) => {
          if (response && response.response_code == 200) {
            this.appService.showToast('success', 'Success', response.message);
            this.ref.close();
          }
        },
        (error) => { }
      )
    }
  }
}
