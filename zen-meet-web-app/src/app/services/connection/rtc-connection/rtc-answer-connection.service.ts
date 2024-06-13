import {
  RTCConnectionAbstractService,
  connectionStatus,
} from './rtc-connection-abstract/rtc-connection-abstract.service';
import { CallsChannel } from '../../channels/calls-channel';
import { AnswerCandidatesChannel } from '../../channels/answer-candidates-channel';
import { OfferCandidatesChannel } from '../../channels/offer-candidates-channel';
import {
  CallDoc,
  CandidateDoc,
  ConnectionCollectionService,
} from '../../database-services/connection-collection.service';

export class RTCAnswerConnectionService extends RTCConnectionAbstractService {
  private meetingId: string = '';
  private connectionId: string = '';
  private callsChannel!: CallsChannel;
  private offerCandidatesChannel!: OfferCandidatesChannel;
  private answerCandidatesChannel!: AnswerCandidatesChannel;
  private sessionTimeId: number = 0;

  constructor(
    private connectionCollectionService: ConnectionCollectionService,
    meetingId: string,
    connectionId: string,
    localMediaStream: MediaStream,
    sessionTimeId: number
  ) {
    super();
    this.meetingId = meetingId;
    this.connectionId = connectionId;
    this.sessionTimeId = sessionTimeId;
    this.callsChannel = new CallsChannel(this.connectionCollectionService);
    this.offerCandidatesChannel = new OfferCandidatesChannel(
      this.connectionCollectionService
    );
    this.answerCandidatesChannel = new AnswerCandidatesChannel(
      this.connectionCollectionService
    );
    this.isCallAnswered = false;
    this.establishPeerConnection(localMediaStream);
  }

  async establishPeerConnection(localMediaStream: MediaStream) {
    this.peerConnection = this.createNewRTCPeerConnection();

    this.addLocalMediaStreamToMeshConnection(localMediaStream);
    this.handleOnTrackEvent();
    this.handleIceCandidateEvent(
      this.answerCandidatesChannel,
      this.meetingId,
      this.connectionId,
      this.sessionTimeId
    );
    this.handleIceConnectionStateChangeEvent(localMediaStream);
    this.handleSignalingStateChangeEvent();

    this.subscribeCallsChannel();
  }

  private subscribeCallsChannel(): void {
    const callsChannelOfferCallbackWrapper = (type: any, data: CallDoc) => {
      return this.callsChannelOfferCallback(type, data);
    };
    this.callsChannel.subscribe(
      this.meetingId,
      this.connectionId,
      callsChannelOfferCallbackWrapper
    );
  }

  private subscribeOfferCandidateChannel(): void {
    const offerCandidateChannelCallbackWrapper = (type: any, data: any) => {
      return this.offerCandidateChannelCallback(type, data);
    };
    this.offerCandidatesChannel.subscribe(
      this.meetingId,
      this.connectionId,
      offerCandidateChannelCallbackWrapper
    );
  }

  private async answerCallFromParticipant(): Promise<void> {
    const answerDescription: RTCSessionDescriptionInit =
      await this.peerConnection.createAnswer();

    // TODO - check if new RTCSessionDescription obg is required
    await this.peerConnection.setLocalDescription(
      new RTCSessionDescription(answerDescription)
    );

    const answerCallData: RTCSessionDescriptionInit = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };
    await this.callsChannel.publish(
      this.meetingId,
      this.connectionId,
      'answer',
      this.sessionTimeId,
      answerCallData
    );
  }

  private async callsChannelOfferCallback(
    type: any,
    callData: CallDoc
  ): Promise<void> {
    if (
      callData.type == 'offer' &&
      callData.sessionTimeId === this.sessionTimeId
    ) {
      // Idempotency check
      if (!this.isCallAnswered) {
        this.isCallAnswered = true;
        this.status = connectionStatus.WAITING;
        await this.setConnectionRemoteDescription(callData.data);
        await this.answerCallFromParticipant();
        this.subscribeOfferCandidateChannel();
      }
    }
  }

  private async offerCandidateChannelCallback(
    type: any,
    offerIceCandidateData: CandidateDoc
  ): Promise<void> {
    if (
      type === 'added' &&
      offerIceCandidateData.sessionTimeId === this.sessionTimeId
    ) {
      const newICECandidate: RTCIceCandidate = new RTCIceCandidate(
        offerIceCandidateData.candidateData
      );
      await this.addIceCandidateToConnection(
        newICECandidate,
        'offerCandidateChannelCallback'
      );
    }
  }
}
