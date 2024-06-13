import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MeetingService } from 'src/app/services/meeting.service';

@Component({
  selector: 'app-invite-people-dailog',
  templateUrl: './invite-people-dailog.component.html',
  styleUrls: ['./invite-people-dailog.component.scss'],
})
export class InvitePeopleDailogComponent {
  meetingURL = 'https://zenmeet.web.app/meeting/';
  meetingCopy: { meetingURLCopied: boolean; meetingIDCopied: boolean } = {
    meetingURLCopied: false,
    meetingIDCopied: false,
  };
  constructor(
    public dialogRef: MatDialogRef<InvitePeopleDailogComponent>,
    public meetingService: MeetingService
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  copyToClipboard(copyItem: 'meetingURLCopied' | 'meetingIDCopied') {
    const copy =
      copyItem === 'meetingURLCopied'
        ? `${this.meetingURL}${this.meetingService.meetingId}`
        : this.meetingService.meetingId;
    navigator.clipboard.writeText(copy);
    this.meetingCopy[copyItem] = true;
    setTimeout(() => {
      this.meetingCopy[copyItem] = false;
    }, 1250);
  }
}
