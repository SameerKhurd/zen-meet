import { Component, Input } from "@angular/core";
import { Message, MessagingService } from "../services/messaging.service";
import { MeetingService } from "../services/meeting.service";

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
    public meetingService: MeetingService
  ) {}

  onClose() {
    this.meetingSideSection.section = "hide";
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
    console.log(newUserMessage);
    this.messagingService
      .sendMessage(this.meetingService.meetingId, newUserMessage)
      .then(() => {
        newUserMessage.status = "not-send";
        console.log(newUserMessage);
      })
      .catch((er: any) => {
        newUserMessage.status = "not-send";
        console.log(newUserMessage, er);
      });
    this.userMessage = "";
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
