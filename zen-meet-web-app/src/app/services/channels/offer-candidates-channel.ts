import { ConnectionCollectionService } from '../database-services/connection-collection.service';

export interface PubSubChannel {
  publish(): void;
  subscribe(): void;
}

export class OfferCandidatesChannel {
  constructor(
    private connectionCollectionService: ConnectionCollectionService
  ) {}

  subscribe(
    meetingId: string,
    connectionId: string,
    callbackFunction: Function
  ): void {
    this.connectionCollectionService.attachOfferCandidateSnapshotListner(
      meetingId,
      connectionId,
      callbackFunction
    );
  }

  async publish(
    meetingId: string,
    connectionId: string,
    sessionTimeId: number,
    candidateId: string,
    offerCandidateData: RTCIceCandidateInit
  ): Promise<void> {
    await this.connectionCollectionService.addOfferCandidate(
      meetingId,
      connectionId,
      sessionTimeId,
      candidateId,
      offerCandidateData
    );
  }
}
