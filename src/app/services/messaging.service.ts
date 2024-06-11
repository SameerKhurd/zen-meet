import { Injectable } from "@angular/core";

import { MessageCollectionService } from "./database-services/message-collection.service";
import { MessagesChannel } from "./channels/messages-channel";
import { Subject } from "rxjs";

export interface Message {
  participantId: string;
  participantName: string;
  content: string;
  type: "message" | "reaction" | "user-joined-event";
  sendTime?: Date;
  status?: "not-send" | "sending" | "sent";
}

@Injectable({
  providedIn: "root",
})
export class MessagingService {
  messages: Message[] = [];
  currStartTimeStamp: Date = new Date();
  lastReadTimeStamp: Date = new Date();
  unreadMessageCount: number = 0;
  private messageChannel!: MessagesChannel;
  participantEmohiReactionEvent = new Subject<{
    participantId: string;
    emojiReaction: string;
  }>();

  constructor(messageCollectionService: MessageCollectionService) {
    this.messageChannel = new MessagesChannel(messageCollectionService);
    const userJoinedEventMessage: Message = {
      participantId: "",
      participantName: "",
      content: "You joined the meeting",
      type: "user-joined-event",
      sendTime: this.currStartTimeStamp,
    };
    this.messages.push(userJoinedEventMessage);
  }

  async sendMessage(meetingId: string, userMessage: Message): Promise<void> {
    this.messages.push(userMessage);
    await this.messageChannel.publish(
      meetingId,
      userMessage.participantId,
      userMessage.participantName,
      userMessage.content,
      "message"
    );
  }

  async retryMessage(meetingId: string, userMessage: Message): Promise<void> {
    await this.messageChannel.publish(
      meetingId,
      userMessage.participantId,
      userMessage.participantName,
      userMessage.content,
      "reaction"
    );
  }

  async sendEmojiReaction(
    meetingId: string,
    userMessage: Message
  ): Promise<void> {
    this.participantEmojiReact(userMessage.participantId, userMessage.content);
    await this.messageChannel.publish(
      meetingId,
      userMessage.participantId,
      userMessage.participantName,
      userMessage.content,
      "reaction"
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
      if (this.currStartTimeStamp > message.sendTime!) {
        switch (message.type) {
          case "message": {
            this.addMessage(message);
            this.messages = this.messages.sort(
              (a, b) => a.sendTime?.getTime()! - b.sendTime?.getTime()!
            );
            break;
          }
          case "reaction": {
            break;
          }
        }
      } else if (message.participantId !== userParticipantId) {
        switch (message.type) {
          case "message": {
            this.addMessage(message);
            break;
          }
          case "reaction": {
            this.participantEmojiReact(message.participantId, message.content);
            break;
          }
        }
      }
    }
  }

  updateLastUserReadTimeStamp() {
    this.unreadMessageCount = 0;
    this.lastReadTimeStamp = new Date();
  }

  addMessage(message: Message): void {
    if (message.sendTime?.getTime()! > this.lastReadTimeStamp.getTime()) {
      this.unreadMessageCount++;
    }
    this.messages.push(message);
  }

  calculateUnreadMessage(): void {
    let unreadMessageCount = 0;
    for (const message of this.messages) {
      if (
        message.type === "message" &&
        message.sendTime?.getTime()! > this.lastReadTimeStamp.getTime()
      ) {
        unreadMessageCount++;
      }
    }
  }

  private participantEmojiReact(
    participantId: string,
    emojiReaction: string
  ): void {
    this.participantEmohiReactionEvent.next({
      participantId: participantId,
      emojiReaction: emojiReaction,
    });
  }
}
