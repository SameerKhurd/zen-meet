import { MessageCollectionService } from "../database-services/message-collection.service";

export interface PubSubChannel {
  publish(): void;
  subscribe(): void;
}

export class MessagesChannel {
  constructor(private messageCollectionService: MessageCollectionService) {}

  subscribe(meetingId: string, callbackFunction: Function): void {
    this.messageCollectionService.attachMessageSnapshotListner(
      meetingId,
      callbackFunction
    );
  }

  async publish(
    meetingId: string,
    participantId: string,
    participantName: string,
    content: string,
    type: "message" | "reaction"
  ): Promise<void> {
    await this.messageCollectionService.addMessage(
      meetingId,
      participantId,
      participantName,
      content,
      type
    );
  }
}
