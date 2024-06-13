import { ConnectionCollectionService } from '../database-services/connection-collection.service';

export interface PubSubChannel {
  publish(): void;
  subscribe(): void;
}

export class CallsChannel {
  constructor(
    private connectionCollectionService: ConnectionCollectionService
  ) {}

  subscribe(
    meetingId: string,
    connectionId: string,
    callbackFunction: Function
  ): void {
    this.connectionCollectionService.attachCallsSnapshotListner(
      meetingId,
      connectionId,
      callbackFunction
    );
  }

  async publish(
    meetingId: string,
    connectionId: string,
    type: 'offer' | 'answer',
    senderSessionId: number,
    callData: RTCSessionDescriptionInit
  ): Promise<void> {
    await this.connectionCollectionService.addCallData(
      meetingId,
      connectionId,
      type,
      senderSessionId,
      callData
    );
  }
}
