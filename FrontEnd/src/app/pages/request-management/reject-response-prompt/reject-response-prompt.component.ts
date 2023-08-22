import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'ngx-reject-response-prompt',
  templateUrl: './reject-response-prompt.component.html',
  styleUrls: ['./reject-response-prompt.component.scss']
})
export class RejectResponsePromptComponent {
  @Output() messageEvent = new EventEmitter<string>();
  public response: string;

  constructor() {}

  closeRejectReason(){
    document.getElementById("modal").style.display = "none";
  }

  sendRejectMsg() {
    this.messageEvent.emit(this.response);
    this.response = ''
    document.getElementById("modal").style.display = "none";
  }
}
