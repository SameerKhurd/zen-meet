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

  async publishNewParticipant(
    meetingId: string,
    participantId: string,
    participantName: string,
    videoEnabled: boolean,
    micEnabled: boolean,
    handRaised: boolean
  ): Promise<Date> {
    return await this.participantCollectionService.addParticipant(
      meetingId,
      participantId,
      participantName,
      videoEnabled,
      micEnabled,
      handRaised
    );
  }

  async publishParticipantChanges(
    meetingId: string,
    participantId: string,
    videoEnabled: boolean,
    micEnabled: boolean,
    handRaised: boolean
  ): Promise<void> {
    await this.participantCollectionService.updateParticipantData(
      meetingId,
      participantId,
      videoEnabled,
      micEnabled,
      handRaised
    );
  }
}
