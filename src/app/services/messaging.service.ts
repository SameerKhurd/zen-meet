import { Injectable } from "@angular/core";

import { MessageCollectionService } from "./database-services/message-collection.service";
import { MessagesChannel } from "./channels/messages-channel";

export interface Message {
  participantId: string;
  participantName: string;
  content: string;
  type: "message";
  sendTime?: Date;
  status?: "not-send" | "sending" | "sent";
}

@Injectable({
  providedIn: "root",
})
export class MessagingService {
  messages: Message[] = [];
  lastSeenTimeStamp: Date = new Date();
  private messageChannel!: MessagesChannel;

  constructor(messageCollectionService: MessageCollectionService) {
    this.messageChannel = new MessagesChannel(messageCollectionService);
  }

  async sendMessage(meetingId: string, userMessage: Message): Promise<void> {
    this.messages.push(userMessage);
    await this.messageChannel.publish(
      meetingId,
      userMessage.participantId,
      userMessage.participantName,
      userMessage.content,
      userMessage.type
    );
  }

  subscribeMessageChannel(meetingId: string, userParticipantId: string): void {
    const messageChannelCallbackWrapper = (type: any, data: any) => {
      return this.messageChannelCallback(type, data, userParticipantId);
    };
    this.messageChannel.subscribe(meetingId, messageChannelCallbackWrapper);
  }

  private messageChannelCallback(
    type: any,
    message: Message,
    userParticipantId: string
  ): void {
    if (type === "added") {
      if (message.participantId !== userParticipantId) {
        this.messages.push(message);
      }
      if (this.lastSeenTimeStamp > message.sendTime!) {
        console.log("sort")
        this.messages = this.messages.sort(
          (a, b) => a.sendTime?.getTime()! - b.sendTime?.getTime()!
        );
      }
    }
  }
}
