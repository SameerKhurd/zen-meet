import { ConnectionCollectionService } from "./database-services/connection-collection.service";
import { AnswerCandidatesChannel } from "./channels/answer-candidates-channel";
import { OfferCandidatesChannel } from "./channels/offer-candidates-channel";
import { stunServers } from "src/environments/environment";
import { Subject } from "rxjs";

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

export enum connectionStatus {
  NEW = 0,
  CONNECTED = 1,
  CLOSED = 2,
  ERROR = 3,
}

export class ConnectionService {
  remoteMediaStream!: MediaStream;
  status: connectionStatus = connectionStatus.NEW;
  participantConnectionEvent = new Subject<boolean>();
  audioReceiver: RTCRtpReceiver | any = undefined;

  private meetingId: string = "";
  private userParticipantId: string = "";
  private peerParticipantId: string = "";

  private toPeerConnection!: RTCPeerConnection;
  private toPeerConnectionId: string = "";
  private fromPeerConnection!: RTCPeerConnection;
  private fromPeerConnectionId: string = "";
  private offerCandidatesChannel!: OfferCandidatesChannel;
  private answerCandidatesChannel!: AnswerCandidatesChannel;

  constructor(
    private connectionCollectionService: ConnectionCollectionService,
    meetingId: string,
    userParticipantId: string,
    peerParticipantId: string,
    localMediaStream: MediaStream
  ) {
    this.meetingId = meetingId;
    this.userParticipantId = userParticipantId;
    this.peerParticipantId = peerParticipantId;
    this.toPeerConnectionId = `${this.userParticipantId}_${this.peerParticipantId}`;
    this.fromPeerConnectionId = `${this.peerParticipantId}_${this.userParticipantId}`;
    this.offerCandidatesChannel = new OfferCandidatesChannel(
      this.connectionCollectionService
    );
    this.answerCandidatesChannel = new AnswerCandidatesChannel(
      this.connectionCollectionService
    );
    this.remoteMediaStream = new MediaStream();
    this.createMeshConnection(localMediaStream);
  }

  private replaceConnectionMediaTrack(
    localMediaStream: MediaStream,
    getMediaTracksMethod: "getVideoTracks" | "getAudioTracks"
  ): void {
    const [currMediaTrack] = localMediaStream[getMediaTracksMethod]();

    [this.toPeerConnection, this.fromPeerConnection].forEach(
      (peerConnection: RTCPeerConnection) => {
        const sender = peerConnection
          .getSenders()
          .find((s) => s.track?.kind === currMediaTrack.kind);
        sender?.replaceTrack(currMediaTrack);
      }
    );
  }

  updateConnectionVideoMediaTrack(localMediaStream: MediaStream): void {
    this.replaceConnectionMediaTrack(localMediaStream, "getVideoTracks");
  }

  updateConnectionAudioMediaTrack(localMediaStream: MediaStream): void {
    this.replaceConnectionMediaTrack(localMediaStream, "getAudioTracks");
  }

  closeConnection() {
    this.removeConnectionEventHandlers(this.toPeerConnection);
    this.removeConnectionEventHandlers(this.fromPeerConnection);
    this.status = connectionStatus.CLOSED;
  }

  private addLocalMediaStreamToMeshConnection(
    localMediaStream: MediaStream
  ): void {
    localMediaStream.getTracks().forEach((track: MediaStreamTrack) => {
      console.log("addtrack", track);
      //console.log("toPeerConnectionss", this.toPeerConnection);
      //console.log("fromPeerConnectionss", this.fromPeerConnection);
      this.toPeerConnection.addTrack(track, localMediaStream);
      this.fromPeerConnection.addTrack(track, localMediaStream);
    });
  }

  private getRemoteMediaStreamFromMeshConnection(): void {
    this.toPeerConnection.ontrack = (event: RTCTrackEvent) => {
      console.log("toPeerConnection", event);
      this.remoteMediaStream = event.streams[0];
      // connection.remoteStream.getTracks((track: any) => {
      //   connection.remoteStream.addTrack(track);
      // });
    };

    this.fromPeerConnection.ontrack = (event: RTCTrackEvent) => {
      console.log("fromPeerConnection", event);
      //this.remoteMediaStream = event.streams[0];
      // connection.remoteStream.getTracks((track: any) => {
      //   connection.remoteStream.addTrack(track);
      // });
    };
  }

  private async createMeshConnection(localMediaStream: MediaStream) {
    await this.establishToPeerConnection(localMediaStream);
    await this.establishFromPeerConnection(localMediaStream);

    //this.addLocalMediaStreamToMeshConnection(localMediaStream);
    //this.getRemoteMediaStreamFromMeshConnection();
  }

  private async establishToPeerConnection(localMediaStream: MediaStream) {
    await this.connectionCollectionService.addConnection(
      this.meetingId,
      this.toPeerConnectionId
    );
    this.toPeerConnection = this.createNewRTCPeerConnection();

    this.attachConnectionEventHandlers(
      this.toPeerConnection,
      this.offerCandidatesChannel,
      this.toPeerConnectionId,
      localMediaStream
    );

    await this.setConnectionOfferDescription();

    const answerCandidateChannelCallbackWrapper = (type: any, data: any) => {
      return this.answerCandidateChannelCallback(type, data);
    };
    this.answerCandidatesChannel.subscribe(
      this.meetingId,
      this.toPeerConnectionId,
      answerCandidateChannelCallbackWrapper
    );
  }

  private async establishFromPeerConnection(localMediaStream: MediaStream) {
    this.fromPeerConnection = this.createNewRTCPeerConnection();

    this.attachConnectionEventHandlers(
      this.fromPeerConnection,
      this.answerCandidatesChannel,
      this.fromPeerConnectionId,
      localMediaStream
    );

    await this.setConnectionRemoteDescription(
      this.fromPeerConnection,
      this.fromPeerConnectionId,
      "getConnectionOfferData"
    );

    await this.setConnectionAnswerDescription();

    const offerCandidateChannelCallbackWrapper = (type: any, data: any) => {
      return this.offerCandidateChannelCallback(type, data);
    };
    this.offerCandidatesChannel.subscribe(
      this.meetingId,
      this.fromPeerConnectionId,
      offerCandidateChannelCallbackWrapper
    );
  }

  private createNewRTCPeerConnection(): RTCPeerConnection {
    const newPeerConnection: RTCPeerConnection = new RTCPeerConnection(
      stunServers
    );
    return newPeerConnection;
  }

  private async setConnectionRemoteDescription(
    peerConnection: RTCPeerConnection,
    connectionId: string,
    getRemoteDescriptionMethod:
      | "getConnectionOfferData"
      | "getConnectionAnswerData"
  ): Promise<void> {
    if (!peerConnection.currentRemoteDescription) {
      const connRemoteDescriptionInit: RTCSessionDescriptionInit | undefined =
        await this.connectionCollectionService[getRemoteDescriptionMethod](
          this.meetingId,
          connectionId
        );

      if (connRemoteDescriptionInit) {
        const connRemoteDescription: RTCSessionDescription =
          new RTCSessionDescription(connRemoteDescriptionInit);
        await peerConnection.setRemoteDescription(connRemoteDescription);
      }
    }
  }

  private async addIceCandidateToConnection(
    peerConnection: RTCPeerConnection,
    iceCandidate: RTCIceCandidate,
    debug: string
  ): Promise<void> {
    try {
      await peerConnection.addIceCandidate(iceCandidate);
    } catch (e: any) {
      console.log(e, debug);
    }
  }

  private async setConnectionOfferDescription(): Promise<void> {
    const connOfferOptions: RTCOfferOptions = offerOptions;
    const offerDescription: RTCSessionDescriptionInit =
      await this.toPeerConnection.createOffer(connOfferOptions);

    await this.toPeerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
    await this.connectionCollectionService.setConnectionOfferData(
      this.meetingId,
      this.toPeerConnectionId,
      offer
    );
  }

  private async setConnectionAnswerDescription(): Promise<void> {
    const answerDescription: RTCSessionDescriptionInit =
      await this.fromPeerConnection.createAnswer();

    // TODO - check if new RTCSessionDescription obg is required
    await this.fromPeerConnection.setLocalDescription(
      new RTCSessionDescription(answerDescription)
    );

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };
    await this.connectionCollectionService.updateConnectionAnwserData(
      this.meetingId,
      this.fromPeerConnectionId,
      answer
    );
  }

  private async answerCandidateChannelCallback(
    type: any,
    answerIceCandidate: RTCIceCandidateInit
  ): Promise<void> {
    if (type === "added") {
      const newICECandidate: RTCIceCandidate = new RTCIceCandidate(
        answerIceCandidate
      );
      await this.addIceCandidateToConnection(
        this.toPeerConnection,
        newICECandidate,
        "answerCandidateChannelCallback"
      );
    }
    await this.setConnectionRemoteDescription(
      this.toPeerConnection,
      this.toPeerConnectionId,
      "getConnectionAnswerData"
    );
  }

  private async offerCandidateChannelCallback(
    type: any,
    offerIceCandidate: RTCIceCandidateInit
  ): Promise<void> {
    if (type === "added") {
      const newICECandidate: RTCIceCandidate = new RTCIceCandidate(
        offerIceCandidate
      );
      await this.addIceCandidateToConnection(
        this.fromPeerConnection,
        newICECandidate,
        "offerCandidateChannelCallback"
      );
    }
  }

  private handleIceCandidateEvent(
    peerConnection: RTCPeerConnection,
    candidatesChannel: any,
    connectionId: string
  ): void {
    peerConnection.onicecandidate = async (
      event: RTCPeerConnectionIceEvent
    ) => {
      if (event.candidate) {
        const iceCandidate: RTCIceCandidateInit = event.candidate.toJSON();
        await candidatesChannel.publish(
          this.meetingId,
          connectionId,
          iceCandidate
        );
      }
    };
  }

  private handleIceConnectionStateChangeEvent(
    peerConnection: RTCPeerConnection,
    connectionId: string,
    localMediaStream: MediaStream
  ): void {
    peerConnection.oniceconnectionstatechange = (event: any) => {
      switch (peerConnection.iceConnectionState) {
        case "connected":
          this.status = connectionStatus.CONNECTED;
          this.addLocalMediaStreamToMeshConnection(localMediaStream);

          //this.stopLocalVideo();
          //this.startLocalVideo();
          break;
        case "closed":
        case "failed":
        case "disconnected":
          this.closeConnection();
          break;
      }
      this.participantConnectionEvent.next(true);
      console.log(connectionId, peerConnection.iceConnectionState);
    };
  }

  private handleSignalingStateChangeEvent(
    peerConnection: RTCPeerConnection
  ): void {
    peerConnection.onsignalingstatechange = (event: any) => {
      switch (peerConnection.signalingState) {
        case "closed":
          this.closeConnection();
          break;
      }
    };
  }

  private attachConnectionEventHandlers(
    peerConnection: RTCPeerConnection,
    candidatesChannel: any,
    connectionId: string,
    localMediaStream: MediaStream
  ): void {
    localMediaStream.getTracks().forEach((track: MediaStreamTrack) => {
      //console.log("toPeerConnectionss", this.toPeerConnection);
      //console.log("fromPeerConnectionss", this.fromPeerConnection);
      peerConnection.addTrack(track, localMediaStream);
    });

    peerConnection.ontrack = (event: RTCTrackEvent) => {
      this.remoteMediaStream = event.streams[0];

      this.audioReceiver = peerConnection.getReceivers().find((r) => {
        return r.track.kind === "audio";
      });
      // if (event.track.kind == "video" || event.track.kind == "audio") {
      //   this.remoteMediaStream.addTrack(event.track);
      // }

      // remoteMediaStream.getTracks().forEach((track: any) => {
      //   this.remoteMediaStream.addTrack(track);
      // });
    };
    this.handleIceCandidateEvent(
      peerConnection,
      candidatesChannel,
      connectionId
    );
    this.handleIceConnectionStateChangeEvent(
      peerConnection,
      connectionId,
      localMediaStream
    );
    this.handleSignalingStateChangeEvent(peerConnection);
  }

  private removeConnectionEventHandlers(
    peerConnection: RTCPeerConnection
  ): void {
    if (peerConnection) {
      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;
      peerConnection.oniceconnectionstatechange = null;
      peerConnection.onsignalingstatechange = null;
      peerConnection
        .getTransceivers()
        .forEach((transceiver: RTCRtpTransceiver) => {
          transceiver.stop();
        });
      peerConnection.close();
    }
  }
}
