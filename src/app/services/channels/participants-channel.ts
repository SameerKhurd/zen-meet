import { ParticipantCollectionService } from "../database-services/participant-collection.service";

export interface PubSubChannel {
  publish(): void;
  subscribe(): void;
}

export class ParticipantChannel {
  constructor(
    private participantCollectionService: ParticipantCollectionService
  ) {}

  subscribe(meetingId: string, callbackFunction: Function): void {
    this.participantCollectionService.attachParticipantSnapshotListner(
      meetingId,
      callbackFunction
    );
  }

  async publish(
    meetingId: string,
    participantId: string,
    participantName: string
  ): Promise<void> {
    await this.participantCollectionService.addParticipant(
      meetingId,
      participantId,
      participantName
    );
  }
}
