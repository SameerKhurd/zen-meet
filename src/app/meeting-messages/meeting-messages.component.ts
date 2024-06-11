import { Component, Input } from "@angular/core";
import { Message, MessagingService } from "../services/messaging.service";
import { MeetingService } from "../services/meeting.service";
import { MatDialog } from "@angular/material/dialog";
import { EmojiPickerComponent } from "../emoji-picker/emoji-picker.component";

@Component({
  selector: "app-meeting-messages",
  templateUrl: "./meeting-messages.component.html",
  styleUrls: ["./meeting-messages.component.scss"],
})
export class MeetingMessagesComponent {
  @Input() meetingSideSection!: any;
  userMessage = "";

  constructor(
    public messagingService: MessagingService,
    public meetingService: MeetingService,
    public dialog: MatDialog
  ) {}

  onClose() {
    this.messagingService.updateLastUserReadTimeStamp();
    this.meetingSideSection.section = "hide";
  }

  openEmojiDialog() {
    const dialogRef = this.dialog.open(EmojiPickerComponent, {
      data: { emoji: "" },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: { emoji: string } | undefined) => {
        if (result) {
          this.userMessage += result.emoji;
        }
      });
  }

  onSendMessage() {
    const newUserMessage: Message = {
      content: this.userMessage,
      participantId: this.meetingService.userParticipantId,
      participantName: this.meetingService.userParticipantName,
      type: "message",
      status: "sending",
      sendTime: new Date(),
    };

    this.messagingService
      .sendMessage(this.meetingService.meetingId, newUserMessage)
      .then(() => {
        newUserMessage.status = "sent";
      })
      .catch((er: any) => {
        newUserMessage.status = "not-send";
      });
    this.userMessage = "";
  }

  onRetryMessage(userMessage: Message) {
    userMessage.status = "sending";
    userMessage.sendTime = new Date();

    this.messagingService
      .retryMessage(this.meetingService.meetingId, userMessage)
      .then(() => {
        userMessage.status = "sent";
      })
      .catch((er: any) => {
        userMessage.status = "not-send";
      });
  }

  splitPartcipantName(participantName: string): string {
    participantName = participantName.trim();
    let initials: string = participantName?.length ? participantName[0] : "";
    const whitespaceIndex = participantName.indexOf(" ");
    if (whitespaceIndex > 0) {
      const lastName: string = participantName
        .substring(whitespaceIndex)
        .trim();
      initials += lastName.length ? lastName[0] : "";
    }
    return initials;
  }
}
