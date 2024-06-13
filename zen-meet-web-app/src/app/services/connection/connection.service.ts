import { RTCConnectionAbstractService } from './rtc-connection/rtc-connection-abstract/rtc-connection-abstract.service';
import { RTCAnswerConnectionService } from './rtc-connection/rtc-answer-connection.service';
import { RTCOfferConnectionService } from './rtc-connection/rtc-offer-connection.service';
import { ConnectionCollectionService } from '../database-services/connection-collection.service';

export class ConnectionService {
  private meetingId: string = '';
  private userParticipantId: string = '';
  private peerParticipantId: string = '';
  private userSessionId!: number;
  partcipantSessionId!: number;
  private connectionId: string = '';
  private isCaller: boolean = true;
  private rtcConnection!: RTCConnectionAbstractService;

  constructor(
    private connectionCollectionService: ConnectionCollectionService,
    meetingId: string,
    userParticipantId: string,
    peerParticipantId: string,
    localMediaStream: MediaStream,
    userSessionId: number,
    partcipantSessionId: number
  ) {
    this.meetingId = meetingId;
    this.userParticipantId = userParticipantId;
    this.peerParticipantId = peerParticipantId;
    this.userSessionId = userSessionId;
    this.partcipantSessionId = partcipantSessionId;
    this.createMeshConnection(localMediaStream);
  }

  get status() {
    return this.rtcConnection.status;
  }

  get audioReceiver() {
    return this.rtcConnection.audioReceiver;
  }

  get remoteMediaStream() {
    return this.rtcConnection.remoteMediaStream;
  }

  connectionEventListener() {
    return this.rtcConnection.connectionEvent;
  }

  updateConnectionVideoMediaTrack(localMediaStream: MediaStream): void {
    this.rtcConnection.updateConnectionVideoMediaTrack(localMediaStream);
  }

  updateConnectionAudioMediaTrack(localMediaStream: MediaStream): void {
    this.rtcConnection.updateConnectionAudioMediaTrack(localMediaStream);
  }

  closeConnection() {
    this.rtcConnection.closeConnection();
  }

  private createMeshConnection(localMediaStream: MediaStream) {
    this.determineWhoIsCaller();
    this.generateConnectionId();
    const sessionTimeId = Math.max(
      this.userSessionId,
      this.partcipantSessionId
    );

    this.rtcConnection = this.isCaller
      ? new RTCOfferConnectionService(
          this.connectionCollectionService,
          this.meetingId,
          this.connectionId,
          localMediaStream,
          sessionTimeId
        )
      : new RTCAnswerConnectionService(
          this.connectionCollectionService,
          this.meetingId,
          this.connectionId,
          localMediaStream,
          sessionTimeId
        );
  }

  private determineWhoIsCaller(): void {
    this.isCaller = this.userParticipantId < this.peerParticipantId;
  }

  private generateConnectionId(): void {
    this.connectionId = this.isCaller
      ? `${this.userParticipantId}_${this.peerParticipantId}`
      : `${this.peerParticipantId}_${this.userParticipantId}`;
  }
}
