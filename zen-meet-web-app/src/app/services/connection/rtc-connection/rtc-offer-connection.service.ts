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

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

export class RTCOfferConnectionService extends RTCConnectionAbstractService {
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
      this.offerCandidatesChannel,
      this.meetingId,
      this.connectionId,
      this.sessionTimeId
    );
    this.handleIceConnectionStateChangeEvent(localMediaStream);
    this.handleSignalingStateChangeEvent();

    await this.offerCallToParticipant();
    this.subscribeCallsChannel();
  }

  private subscribeCallsChannel(): void {
    const callsChannelAnswerCallbackWrapper = (type: any, data: CallDoc) => {
      return this.callsChannelAnswerCallback(type, data);
    };
    this.callsChannel.subscribe(
      this.meetingId,
      this.connectionId,
      callsChannelAnswerCallbackWrapper
    );
  }

  private subscribeAnswerCandidatesChannel(): void {
    const answerCandidateChannelCallbackWrapper = (type: any, data: any) => {
      return this.answerCandidateChannelCallback(type, data);
    };
    this.answerCandidatesChannel.subscribe(
      this.meetingId,
      this.connectionId,
      answerCandidateChannelCallbackWrapper
    );
  }

  private async offerCallToParticipant(): Promise<void> {
    const connOfferOptions: RTCOfferOptions = offerOptions;
    const offerDescription: RTCSessionDescriptionInit =
      await this.peerConnection.createOffer(connOfferOptions);
    await this.peerConnection.setLocalDescription(offerDescription);
    const offerCallData: RTCSessionDescriptionInit = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
    await this.callsChannel.publish(
      this.meetingId,
      this.connectionId,
      'offer',
      this.sessionTimeId,
      offerCallData
    );
  }

  private async callsChannelAnswerCallback(
    type: any,
    callData: CallDoc
  ): Promise<void> {
    if (
      callData.type == 'answer' &&
      callData.sessionTimeId === this.sessionTimeId
    ) {
      // Idempotency check
      if (!this.isCallAnswered) {
        this.isCallAnswered = true;
        this.status = connectionStatus.WAITING;
        await this.setConnectionRemoteDescription(callData.data);
        this.subscribeAnswerCandidatesChannel();
      }
    }
  }

  private async answerCandidateChannelCallback(
    type: any,
    answerIceCandidateData: CandidateDoc
  ): Promise<void> {
    if (
      type === 'added' &&
      answerIceCandidateData.sessionTimeId === this.sessionTimeId
    ) {
      const newICECandidate: RTCIceCandidate = new RTCIceCandidate(
        answerIceCandidateData.candidateData
      );
      await this.addIceCandidateToConnection(
        newICECandidate,
        'answerCandidateChannelCallback'
      );
    }
  }
}
